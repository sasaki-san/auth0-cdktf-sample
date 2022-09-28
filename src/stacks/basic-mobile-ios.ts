import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, Client, ClientGrant, Connection, ResourceServer, User } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly clientGrants: ClientGrant
  readonly connection: Connection
  readonly user: User

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.native,
      name: this.id(name, "client"),
      logoUri: `https://openmoji.org/data/color/svg/F8FF.svg`,
      callbacks: config.env.MOBILE_IOS_CALLBACK,
      allowedLogoutUrls: config.env.MOBILE_IOS_LOGOUT
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

  }
}

export default (app: App) => {
  new Stack(app, "basic-mobile-ios");
}