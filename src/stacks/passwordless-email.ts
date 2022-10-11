import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, Client, GlobalClient, ClientGrant, Connection, ResourceServer, User } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";
import { GrantTypes } from "../utils/Types";
import Utils from "../utils/Utils";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly clientGrants: ClientGrant
  readonly connection: Connection
  readonly user: User
  readonly globalClient: GlobalClient

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, this.id(name, "client"), {
      ...config.base.client.rwa,
      name: this.id(name, "client"),
      grantTypes: [
        GrantTypes.implicit,
        ...Utils.mfaGrantTypes(),
        GrantTypes.passwordless_otp
      ]
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, this.id(name, "api"), {
      ...config.base.api.default,
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

    // Create a Passwordless - Email Connection
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.base.connection.email,
      enabledClients: [this.client.clientId, config.env.CLIENT_ID]
    })

    // Create a User in the connection
    this.user = new User(this, this.id(name, "user"), {
      email: "john@gmail.com",
      connectionName: this.connection.name,
      emailVerified: true,
      picture: `https://robohash.org/${name}.png`
    })

    // Enable passwordless login
    this.globalClient = new GlobalClient(this, this.id(name, "globalclient"), {
      customLoginPageOn: true,
      customLoginPage: this.readAsset("classic-ul", "login.passwordless.html")
    })

  }
}

export default (app: App) => {
  new Stack(app, "passwordless-email");
}