import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider } from "../../.gen/providers/auth0/provider"
import { Client } from "../../.gen/providers/auth0/client"
import { ResourceServer } from "../../.gen/providers/auth0/resource-server"
import { config } from "../configs"
import { Utils, Validators } from "../utils";
import ConnectionDeployment from "../constructs/connection/connection-deployment";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: ConnectionDeployment

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "GOOGLE_CIENT_ID", "GOOGLE_CLIENT_SECRET"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.spa,
      name: Utils.id(name, "client")
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, Utils.id(name, "api"), {
      ...config.base.api.default,
      name: Utils.id(name, "api"),
      identifier: `https://${name}`,
    })

    // Create an Auth0 Connection
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "google",
      enabledClientIds: [this.client.clientId, config.env.CLIENT_ID],
      overrides: {
        connection: {
          options: {
            clientId: config.env.GOOGLE_CIENT_ID,
            clientSecret: config.env.GOOGLE_CLIENT_SECRET
          }
        }
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "basic-google");
}