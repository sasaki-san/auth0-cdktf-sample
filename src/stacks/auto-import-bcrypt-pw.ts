import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, Client, Connection, ResourceServer } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: Connection

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.spa,
      name: this.id(name, "client")
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, this.id(name, "api"), {
      ...config.api.default,
      name: this.id(name, "api"),
      identifier: `https://${name}`,
    })

    // Create an Auth0 Connection 
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.connection.auth0,
      name: this.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
      options: {
        importMode: true,
        enabledDatabaseCustomization: true,
        customScripts: {
          login: this.script("database", "auto-import-bcrypt.login.js"),
          get_user: this.script("database", "auto-import-bcrypt.getUser.js"),
        }
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "auto-import-bcrypt-pw");
}