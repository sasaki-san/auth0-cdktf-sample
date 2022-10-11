import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider, Client, Connection, User } from "../../.gen/providers/auth0"
import { config } from "../configs"
import Utils from "../utils/Utils";

interface IdpInfo {
  client: Client
}

class BasicSamlIdpStack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly connection: Connection
  readonly user: User

  constructor(scope: Construct, name: string, spConnName: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application with Saml Addon
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.samlIdp,
      name: Utils.id(name, "client"),
      callbacks: [`https://${config.env.SAML_SP_DOMAIN}/login/callback?connection=${spConnName}`],
    })

    // Create an Auth0 Connection
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.auth0,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
    })

    // Create a User in the created connection
    this.user = new User(this, Utils.id(name, "user"), {
      email: "john@gmail.com",
      password: "Password!",
      connectionName: this.connection.name,
    })
  }
}

class BasicSamlSpStack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly connection: Connection

  constructor(scope: Construct, name: string, spConnName: string, idpInfo: IdpInfo) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.SAML_SP_DOMAIN,
      clientId: config.env.SAML_SP_CLIENT_ID,
      clientSecret: config.env.SAML_SP_CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.samlSp,
      name: Utils.id(name, "client-sp"),
      provider: this.auth0Provider
    })

    // Create an Auth0 Connection
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.saml,
      name: spConnName,
      enabledClients: [this.client.clientId, config.env.SAML_SP_CLIENT_ID],
      provider: this.auth0Provider,
      options: {
        ...config.base.connection.saml.options,
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