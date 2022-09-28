import { Construct } from "constructs";
import { App, Fn } from "cdktf";
import { Auth0Provider, Client, Connection, User } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";

interface IdpInfo {
  client: Client
}

class BasicSamlIdpStack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly connection: Connection
  readonly user: User

  constructor(scope: Construct, name: string, spConnName: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.auth0Provider.domain,
      clientId: config.auth0Provider.clientId,
      clientSecret: config.auth0Provider.clientSecret
    })

    // Create an Auth0 Application - RegularWeb App with Saml Addon
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.samlIdpDefault,
      name: this.id(name, "client"),
      callbacks: [`https://${config.samlSpAuth0Provider.domain}/login/callback?connection=${spConnName}`],
    })

    // Create an Auth0 Connection (Username and Password)
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.connection.auth0,
      name: this.id(name, "connection"),
      enabledClients: [this.client.clientId, config.auth0Provider.clientId],
    })

    // Create a User in the created connection
    this.user = new User(this, this.id(name, "user-john"), {
      email: "john@gmail.com",
      password: "Password!",
      connectionName: this.connection.name,
    })
  }
}

class BasicSamlSpStack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly connection: Connection

  constructor(scope: Construct, name: string, spConnName: string, idpInfo: IdpInfo) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.samlSpAuth0Provider.domain,
      clientId: config.samlSpAuth0Provider.clientId,
      clientSecret: config.samlSpAuth0Provider.clientSecret
    })

    // Create an Auth0 Application - RegularWeb App with Saml Addon
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.samlSpDefault,
      name: this.id(name, "client-sp"),
      provider: this.auth0Provider
    })

    // Create an Auth0 Connection (Username and Password)
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.connection.saml,
      name: spConnName,
      enabledClients: [this.client.clientId, config.samlSpAuth0Provider.clientId],
      provider: this.auth0Provider,
      options: {
        ...config.connection.saml.options,
        signInEndpoint: `https://${config.auth0Provider.domain}/samlp/${idpInfo.client.clientId}`,
        signOutEndpoint: `https://${config.auth0Provider.domain}/samlp/${idpInfo.client.clientId}/logout`,
        signingCert: Fn.base64encode(idpInfo.client.signingKeys.get(0).lookup("cert"))
      }
    })

  }
}

export default (app: App) => {
  const spConnName = "basic-saml-sp-connection"
  // Create IDP app
  const samlIdp = new BasicSamlIdpStack(app, "basic-saml-idp", spConnName)
  // Create SP app
  new BasicSamlSpStack(app, "basic-saml-sp", spConnName, { client: samlIdp.client });
}