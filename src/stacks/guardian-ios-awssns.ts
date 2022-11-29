import { Construct } from "constructs";
import { App, Fn, TerraformOutput, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider"
import { SnsPlatformApplication } from "@cdktf/provider-aws/lib/sns-platform-application"
import { SnsTopic } from "@cdktf/provider-aws/lib/sns-topic"
import { SnsTopicSubscription } from "@cdktf/provider-aws/lib/sns-topic-subscription"
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { Client } from "../../.gen/providers/auth0/client";
import { ClientGrant } from "../../.gen/providers/auth0/client-grant";
import { Connection } from "../../.gen/providers/auth0/connection";
import { Guardian } from "../../.gen/providers/auth0/guardian";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";
import { ResourceServer } from "../../.gen/providers/auth0/resource-server";
import { User } from "../../.gen/providers/auth0/user";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly awsProvider: AwsProvider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: Connection
  readonly user: User
  readonly awsSnsTopic: SnsTopic
  readonly awsSnsTopicSubscription: SnsTopicSubscription
  readonly awsSnsPlatformApp: SnsPlatformApplication
  readonly guardian: Guardian

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "AWS_ACCESS_KEY_ID", "AWS_ACCESS_SECRET_KEY", "AWS_REGION", "MOBILE_IOS_CALLBACK", "GUARDIAN_SNS_EVENT_DELIVERY_EMAIL", "GUARDIAN_SNS_APNS_SIGNING_KEY_FILE_NAME", "GUARDIAN_SNS_APNS_SIGNING_KEY_ID", "GUARDIAN_SNS_APNS_BUNDLE_ID", "GUARDIAN_SNS_APNS_TEAM_ID"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    this.awsProvider = new AwsProvider(this, Utils.id(name, "awsProvider"), {
      region: config.env.AWS_REGION,
      accessKey: config.env.AWS_ACCESS_KEY_ID,
      secretKey: config.env.AWS_ACCESS_SECRET_KEY,
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.native,
      name: Utils.id(name, "client"),
      logoUri: Utils.logUris.apple,
      callbacks: config.env.MOBILE_IOS_CALLBACK
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, Utils.id(name, "api"), {
      ...config.base.api.default,
      name: Utils.id(name, "api"),
      identifier: `https://${name}`,
      scopes: [{ value: "transfer:funds", description: "Transfer funds" }]
    })

    // Grant API permissions to the Applicaiton
    new ClientGrant(this, Utils.id(name, "client-grants"), {
      clientId: this.client.clientId,
      audience: this.resourceServer.identifier,
      scope: ["transfer:funds"]
    })

    // Create an Auth0 Connection
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      provider: this.auth0Provider,
      ...config.base.connection.auth0,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID]
    })

    // Create a User in the created connection
    this.user = new User(this, Utils.id(name, "user"), {
      provider: this.auth0Provider,
      ...config.base.user.john,
      connectionName: this.connection.name,
      picture: Utils.roboHash(name)
    })

    // Create a topic to subscribe SNS events
    this.awsSnsTopic = new SnsTopic(this, Utils.id(name, "awssnstopic"), {
      provider: this.awsProvider,
      name: Utils.id(name, "topic"),
    })

    this.awsSnsTopicSubscription = new SnsTopicSubscription(this, Utils.id(name, "awssnstopicsub"), {
      provider: this.awsProvider,
      dependsOn: [this.awsSnsTopic],
      topicArn: this.awsSnsTopic.arn,
      endpointAutoConfirms: true,
      protocol: "email",
      endpoint: config.env.GUARDIAN_SNS_EVENT_DELIVERY_EMAIL
    })

    this.awsSnsPlatformApp = new SnsPlatformApplication(this, Utils.id(name, "awssnsplatformapp"), {
      provider: this.awsProvider,
      dependsOn: [this.awsSnsTopic],
      name: Utils.id(name, "platformapp"),
      // Change this to APNS for Prod.
      platform: "APNS_SANDBOX", 
      // https://docs.aws.amazon.com/sns/latest/api/API_CreatePlatformApplication.html
      // For APNS and APNS_SANDBOX using token credentials, 
      // - PlatformPrincipal is signing key ID and 
      // - PlatformCredential is signing key.
      platformCredential: Fn.file(Utils.assetPath("apns", config.env.GUARDIAN_SNS_APNS_SIGNING_KEY_FILE_NAME)),
      platformPrincipal: config.env.GUARDIAN_SNS_APNS_SIGNING_KEY_ID,
      applePlatformBundleId: config.env.GUARDIAN_SNS_APNS_BUNDLE_ID,
      applePlatformTeamId: config.env.GUARDIAN_SNS_APNS_TEAM_ID,
      eventDeliveryFailureTopicArn: this.awsSnsTopic.arn,
      eventEndpointCreatedTopicArn: this.awsSnsTopic.arn,
      eventEndpointDeletedTopicArn: this.awsSnsTopic.arn,
      eventEndpointUpdatedTopicArn: this.awsSnsTopic.arn
    })

    // Setup MFA with APNS. - Note that Auth0 terraform currently does not support this
    this.guardian = new Guardian(this, Utils.id(name, "guardian"), {
      provider: this.auth0Provider,
      policy: Types.Policies.Always,
      push: {
        customApp: {
          appName: name,
        },
        amazonSns: {
          awsAccessKeyId: config.env.AWS_ACCESS_KEY_ID,
          awsSecretAccessKey: config.env.AWS_ACCESS_SECRET_KEY,
          awsRegion: config.env.AWS_REGION,
          snsGcmPlatformApplicationArn: "",
          snsApnsPlatformApplicationArn: this.awsSnsPlatformApp.arn,
        }
      }
    })

    new TerraformOutput(this, Utils.id(name, "snsPlatformAppArn"), {
      value: this.awsSnsPlatformApp.arn
    })

  }
}

export default (app: App) => {
  new Stack(app, "guardian-ios-awssns");
}