import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider } from "../../.gen/providers/auth0/provider"
import { Client } from "../../.gen/providers/auth0/client"
import { Connection } from "../../.gen/providers/auth0/connection"
import { config } from "../configs"
import { Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly connection: Connection

  constructor(scope: Construct, name: string, alg: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

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

    // Create an Auth0 Connection 
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.auth0,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
      options: {
        importMode: true,
        enabledDatabaseCustomization: true,
        customScripts: {
          login: Fn.file(Utils.assetPath("database", `${alg}.login.js`)),
          get_user: Fn.file(Utils.assetPath("database", "getUser.js"))
        }
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "customdb-import-bcrypt", "bcrypt");
  new Stack(app, "customdb-import-pbkdf2", "pbkdf2");
}