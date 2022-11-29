import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider } from "../../.gen/providers/auth0/provider"
import { Client } from "../../.gen/providers/auth0/client"
import { Connection } from "../../.gen/providers/auth0/connection"
import { ResourceServer } from "../../.gen/providers/auth0/resource-server"
import { config } from "../configs"
import { Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: Connection

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "AMAZON_CIENT_ID", "AMAZON_CLIENT_SECRET"])

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
    // Note: ext_groups, ext_profile, ext_nested_groups are currently not supported
    // Field	Value to Provide
    // Allowed Javascript Origins	https://YOUR_DOMAIN/
    // Allowed Return URL	https://YOUR_DOMAIN/login/callback
    // 
    // ... Terraform source code broken??  
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.amazon,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
      options: {
        ...config.base.connection.amazon.options,
        clientId: config.env.AMAZON_CIENT_ID,
        clientSecret: config.env.AMAZON_CLIENT_SECRET,
        scopes: ["profile"]
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "basic-amazon");
}