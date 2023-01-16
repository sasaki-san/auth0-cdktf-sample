import { Construct } from "constructs";
import { App, Fn, TerraformOutput, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider"
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";
import { Client } from "../../.gen/providers/auth0/client";
import { ClientGrant } from "../../.gen/providers/auth0/client-grant";
import { Guardian } from "../../.gen/providers/auth0/guardian";
import { ResourceServer } from "../../.gen/providers/auth0/resource-server";
import { User } from "../../.gen/providers/auth0/user";
import ConnectionDeployment from "../constructs/connection/connection-deployment";
import AwsSnsPlatformAppDeployment from "../constructs/guardian/awssnsplatform-deployment";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly awsProvider: AwsProvider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: ConnectionDeployment
  readonly user: User
  readonly awsSnsPlatformAppGcm?: AwsSnsPlatformAppDeployment
  readonly awsSnsPlatformAppApns?: AwsSnsPlatformAppDeployment
  readonly guardian: Guardian

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "AWS_ACCESS_KEY_ID", "AWS_ACCESS_SECRET_KEY", "AWS_REGION", "MOBILE_ANDROID_CALLBACK", "GUARDIAN_SNS_EVENT_DELIVERY_EMAIL", "GUARDIAN_SNS_GCM_SERVER_KEY"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.native,
      name: Utils.id(name, "client"),
      logoUri: Utils.logUris.guardian,
      callbacks: [
        ...(config.base.client.native.callbacks || []),
        ...config.env.MOBILE_ANDROID_CALLBACK,
        ...config.env.MOBILE_IOS_CALLBACK
      ]
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
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "auth0",
      enabledClientIds: [this.client.clientId, config.env.CLIENT_ID],
      overrides: {
        connection: {
          provider: this.auth0Provider,
        }
      }
    })

    // Create a User in the created connection
    this.user = new User(this, Utils.id(name, "user"), {
      dependsOn: this.connection.dependables,
      provider: this.auth0Provider,
      ...config.base.user.john,
      connectionName: this.connection.name,
      picture: Utils.roboHash(name)
    })

    this.awsProvider = new AwsProvider(this, Utils.id(name, "awsProvider"), {
      region: config.env.AWS_REGION,
      accessKey: config.env.AWS_ACCESS_KEY_ID,
      secretKey: config.env.AWS_ACCESS_SECRET_KEY,
    })

    // Create AWS platform app for Android
    if (config.env.GUARDIAN_SNS_GCM_SERVER_KEY) {
      this.awsSnsPlatformAppGcm = new AwsSnsPlatformAppDeployment(this, Utils.id(name, "awssns-gcm"), {
        platform: "GCM",
        overrides: {
          snsTopicSubscription: {
            protocol: "email",
            endpoint: config.env.GUARDIAN_SNS_EVENT_DELIVERY_EMAIL
          },
          snsPlatformApp: {
            platformCredential: config.env.GUARDIAN_SNS_GCM_SERVER_KEY,
          }
        }
      })
    }

    // Create AWS platform app for Apple 
    if (config.env.GUARDIAN_SNS_APNS_SIGNING_KEY_ID) {
      this.awsSnsPlatformAppApns = new AwsSnsPlatformAppDeployment(this, Utils.id(name, "awssns-apns"), {
        platform: "APNS_SANDBOX",
        overrides: {
          snsTopicSubscription: {
            protocol: "email",
            endpoint: config.env.GUARDIAN_SNS_EVENT_DELIVERY_EMAIL
          },
          snsPlatformApp: {
            // https://docs.aws.amazon.com/sns/latest/api/API_CreatePlatformApplication.html
            // For APNS and APNS_SANDBOX using token credentials, 
            // - PlatformPrincipal is signing key ID and 
            // - PlatformCredential is signing key.
            platformCredential: Fn.file(Utils.assetPath("apns", config.env.GUARDIAN_SNS_APNS_SIGNING_KEY_FILE_NAME)),
            platformPrincipal: config.env.GUARDIAN_SNS_APNS_SIGNING_KEY_ID,
            applePlatformBundleId: config.env.GUARDIAN_SNS_APNS_BUNDLE_ID,
            applePlatformTeamId: config.env.GUARDIAN_SNS_APNS_TEAM_ID,
          }
        }
      })
    }

    // Setup Guardian Push MFA with AWS SNS
    this.guardian = new Guardian(this, Utils.id(name, "guardian"), {
      provider: this.auth0Provider,
      policy: Types.Policies.Always,
      push: {
        provider: "sns",
        enabled: true,
        amazonSns: {
          awsAccessKeyId: config.env.AWS_ACCESS_KEY_ID,
          awsSecretAccessKey: config.env.AWS_ACCESS_SECRET_KEY,
          awsRegion: config.env.AWS_REGION,
          snsGcmPlatformApplicationArn: this.awsSnsPlatformAppGcm?.snsPlatformApp.arn || "",
          snsApnsPlatformApplicationArn: this.awsSnsPlatformAppApns?.snsPlatformApp.arn || ""
        }
      }
    })

    new TerraformOutput(this, Utils.id(name, "gcm.snsPlatformApp.arn"), {
      value: this.awsSnsPlatformAppGcm?.snsPlatformApp.arn
    })

    new TerraformOutput(this, Utils.id(name, "apns.snsPlatformApp.arn"), {
      value: this.awsSnsPlatformAppApns?.snsPlatformApp.arn
    })

  }
}

export default (app: App) => {
  new Stack(app, "guardian-awssns");
}