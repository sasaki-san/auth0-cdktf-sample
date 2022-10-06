import { Construct } from "constructs";
import { App, TerraformOutput } from "cdktf";
import { Auth0Provider, Client, ClientGrant, Connection, ResourceServer, User } from "../../.gen/providers/auth0"
import { AwsProvider } from "@cdktf/provider-aws/lib/provider"
import { SnsPlatformApplication } from "@cdktf/provider-aws/lib/sns-platform-application"
import { SnsTopic } from "@cdktf/provider-aws/lib/sns-topic"
import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly awsProvider: AwsProvider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly clientGrants: ClientGrant
  readonly connection: Connection
  readonly user: User
  readonly awsSnsTopic?: SnsTopic
  readonly awsSnsTopicSubscription?: SnsTopicSubscription
  readonly awsSnsPlatformApp: SnsPlatformApplication

  constructor(scope: Construct, name: string) {
    super(scope, name)

    if (!config.env.GUARDIAN_SNS_GCM_SERVER_KEY) {
      throw Error(`GUARDIAN_SNS_GCM_SERVER_KEY must be set`)
    }
    if (!config.env.GUARDIAN_SNS_EVENT_DELIVERY_EMAIL) {
      throw Error(`GUARDIAN_SNS_EVENT_DELIVERY_EMAIL must be set`)
    }

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    this.awsProvider = new AwsProvider(this, this.id(name, "awsProvider"), {
      region: config.env.AWS_REGION,
      accessKey: config.env.AWS_ACCESS_KEY_ID,
      secretKey: config.env.AWS_ACCESS_SECRET_KEY,
    })

    // Create an Auth0 Application
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.native,
      name: this.id(name, "client"),
      logoUri: `https://openmoji.org/data/color/svg/E047.svg`,
      callbacks: config.env.MOBILE_ANDROID_CALLBACK,
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, this.id(name, "api"), {
      ...config.api.default,
      name: this.id(name, "api"),
      identifier: `https://${name}`,
      scopes: [{ value: "transfer:funds", description: "Transfer funds" }]
    })

    // Grant API permissions to the Applicaiton
    this.clientGrants = new ClientGrant(this, this.id(name, "client-grants"), {
      clientId: this.client.clientId,
      audience: this.resourceServer.identifier,
      scope: ["transfer:funds"]
    })

    // Create an Auth0 Connection
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.connection.auth0,
      name: this.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID]
    })

    // Create a User in the created connection
    this.user = new User(this, this.id(name, "user-john"), {
      email: "john@gmail.com",
      password: "Password!",
      connectionName: this.connection.name,
    })

    // Create a topic to subscribe SNS events
    this.awsSnsTopic = new SnsTopic(this, this.id(name, "awssnstopic"), {
      provider: this.awsProvider,
      name: this.id(name, "topic"),
    })

    this.awsSnsTopicSubscription = new SnsTopicSubscription(this, this.id(name, "awssnstopicsub"), {
      provider: this.awsProvider,
      dependsOn: [this.awsSnsTopic],
      topicArn: this.awsSnsTopic.arn,
      endpointAutoConfirms: true,
      protocol: "email",
      endpoint: config.env.GUARDIAN_SNS_EVENT_DELIVERY_EMAIL 
    })

    this.awsSnsPlatformApp = new SnsPlatformApplication(this, this.id(name, "awssnsplatformapp"), {
      provider: this.awsProvider,
      dependsOn: [this.awsSnsTopic],
      name: this.id(name, "platformapp"),
      platform: "GCM",
      platformCredential: config.env.GUARDIAN_SNS_GCM_SERVER_KEY,
      eventDeliveryFailureTopicArn: this.awsSnsTopic.arn,
      eventEndpointCreatedTopicArn: this.awsSnsTopic.arn,
      eventEndpointDeletedTopicArn: this.awsSnsTopic.arn,
      eventEndpointUpdatedTopicArn: this.awsSnsTopic.arn
    })

    new TerraformOutput(this, this.id(name, "snsPlatformAppArn"), {
      value: this.awsSnsPlatformApp.arn
    })

    // Terraform doesn't work with Amazon SNS part.
    // this.guardian = new Guardian(this, this.id(name, "guardian"), {
    //   provider: this.auth0Provider,
    //   policy: Policies.Always,
    //   push: {
    //     customApp: {
    //       appName: name,
    //     },
    //     amazonSns: {
    //       awsAccessKeyId: config.env.GUARDIAN_AWS_ACCESS_KEY_ID!,
    //       awsSecretAccessKey: config.env.GUARDIAN_AWS_ACCESS_SECRET_KEY!,
    //       awsRegion: config.env.GUARDIAN_AWS_REGION!,
    //       snsGcmPlatformApplicationArn: this.snsPlatformApp.arn
    //       snsApnsPlatformApplicationArn: "",
    //     }
    //   }
    // })

  }
}

export default (app: App) => {
  new Stack(app, "guardian-awssns-provider");
}