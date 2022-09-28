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
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.samlIdp,
      name: this.id(name, "client"),
      callbacks: [`https://${config.env.SAML_SP_DOMAIN}/login/callback?connection=${spConnName}`],
    })

    // Create an Auth0 Connection
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.connection.auth0,
      name: this.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
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
      domain: config.env.SAML_SP_DOMAIN,
      clientId: config.env.SAML_SP_CLIENT_ID,
      clientSecret: config.env.SAML_SP_CLIENT_SECRET
    })

    // Create an Auth0 Application - RegularWeb App with Saml Addon
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.samlSp,
      name: this.id(name, "client-sp"),
      provider: this.auth0Provider
    })

    // Create an Auth0 Connection (Username and Password)
    this.connection = new Connection(this, this.id(name, "connection"), {
      ...config.connection.saml,
      name: spConnName,
      enabledClients: [this.client.clientId, config.env.SAML_SP_CLIENT_ID],
      provider: this.auth0Provider,
      options: {
        ...config.connection.saml.options,
        signInEndpoint: `https://${config.env.DOMAIN}/samlp/${idpInfo.client.clientId}`,
        signOutEndpoint: `https://${config.env.DOMAIN}/samlp/${idpInfo.client.clientId}/logout`,
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