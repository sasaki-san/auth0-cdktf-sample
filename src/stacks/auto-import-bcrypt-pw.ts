import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider, Client, Connection, ResourceServer } from "../../.gen/providers/auth0"
import { config } from "../configs"
import Utils from "../utils/Utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: Connection

  constructor(scope: Construct, name: string) {
    super(scope, name)

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
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.auth0,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
      options: {
        importMode: true,
        enabledDatabaseCustomization: true,
        customScripts: {
          login: Utils.readAsset("database", "auto-import-bcrypt.login.js"),
          get_user: Utils.readAsset("database", "auto-import-bcrypt.getUser.js"),
        }
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "auto-import-bcrypt-pw");
}