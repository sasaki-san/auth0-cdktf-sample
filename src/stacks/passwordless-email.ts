import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { Client } from "../../.gen/providers/auth0/client";
import { ClientGrant } from "../../.gen/providers/auth0/client-grant";
import { GlobalClient } from "../../.gen/providers/auth0/global-client";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";
import { ResourceServer } from "../../.gen/providers/auth0/resource-server";
import { User } from "../../.gen/providers/auth0/user";
import ConnectionDeployment from "../constructs/connection/connection-deployment";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly clientGrants: ClientGrant
  readonly connection: ConnectionDeployment
  readonly user: User
  readonly globalClient: GlobalClient

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.rwa,
      name: Utils.id(name, "client"),
      grantTypes: [
        Types.GrantTypes.implicit,
        Types.GrantTypes.passwordless_otp
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
    this.clientGrants = new ClientGrant(this, Utils.id(name, "client-grants"), {
      clientId: this.client.clientId,
      audience: this.resourceServer.identifier,
      scope: ["transfer:funds"]
    })

    // Create a Passwordless - Email Connection
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "email",
      enabledClientIds: [this.client.clientId, config.env.CLIENT_ID],
    })

    // Create a User in the connection
    this.user = new User(this, Utils.id(name, "user"), {
      dependsOn: this.connection.dependables,
      ...config.base.user.passwordless.buzz,
      connectionName: this.connection.name,
    })

    // Enable passwordless login
    this.globalClient = new GlobalClient(this, Utils.id(name, "globalclient"), {
      customLoginPageOn: true,
      customLoginPage: Fn.file(Utils.assetPath("classic-ul", "login.passwordless.html"))
    })

  }
}

export default (app: App) => {
  new Stack(app, "passwordless-email");
}