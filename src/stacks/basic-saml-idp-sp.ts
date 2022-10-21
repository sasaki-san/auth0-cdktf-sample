import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider, Client, Connection, Rule, User } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly idpAuth0Provider: Auth0Provider
  readonly idpClient: Client
  readonly idpConnection: Connection
  readonly idpUser: User
  readonly idpRule: Rule

  readonly spAuth0Provider: Auth0Provider
  readonly spClient: Client
  readonly spConnection: Connection
  readonly spRule: Rule

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "SAML_SP_DOMAIN", "SAML_SP_CLIENT_ID", "SAML_SP_CLIENT_SECRET"])

    // IDP

    this.idpAuth0Provider = new Auth0Provider(this, Utils.id(name, "idp-auth0provider"), {
      alias: "idp",
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application with Saml Addon
    this.idpClient = new Client(this, Utils.id(name, "idp-client"), {
      provider: this.idpAuth0Provider,
      ...config.base.client.samlIdp,
      name: Utils.id(name, "idp-client"),
      callbacks: [`https://${config.env.SAML_SP_DOMAIN}/login/callback?connection=${Utils.id(name, "sp-connection")}`],
    })

    // Create an Auth0 Connection
    this.idpConnection = new Connection(this, Utils.id(name, "idp-connection"), {
      provider: this.idpAuth0Provider,
      ...config.base.connection.auth0,
      name: Utils.id(name, "idp-connection"),
      enabledClients: [this.idpClient.clientId, config.env.CLIENT_ID],
    })

    // Create a User in the created connection
    this.idpUser = new User(this, Utils.id(name, "idp-user"), {
      provider: this.idpAuth0Provider,
      ...config.base.user.john,
      connectionName: this.idpConnection.name,
      picture: Utils.roboHash(name),
      userMetadata: JSON.stringify({
        favorite_color: "red"
      })
    })

    // Create a rule that performs user profile mappings
    this.idpRule = new Rule(this, Utils.id(name, `rule-idp`), {
      provider: this.idpAuth0Provider,
      name: `${name}-saml-idp-attr-mapping`,
      script: Fn.file(Utils.assetPath("rules", "saml-idp-attr-mapping.js")),
      enabled: true,
    })

    // SP

    this.spAuth0Provider = new Auth0Provider(this, Utils.id(name, "sp-auth0provider"), {
      alias: "sp",
      domain: config.env.SAML_SP_DOMAIN,
      clientId: config.env.SAML_SP_CLIENT_ID,
      clientSecret: config.env.SAML_SP_CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.spClient = new Client(this, Utils.id(name, "sp-client"), {
      provider: this.spAuth0Provider,
      ...config.base.client.samlSp,
      name: Utils.id(name, "sp-client"),
      callbacks: [
        ...config.base.client.samlSp.callbacks!,
        Utils.auth0AuthApiDebuggerUrl(this.spAuth0Provider.domain!)
      ]
    })

    // Create an Auth0 Connection
    this.spConnection = new Connection(this, Utils.id(name, "sp-connection"), {
      provider: this.spAuth0Provider,
      ...config.base.connection.saml,
      name: Utils.id(name, "sp-connection"),
      enabledClients: [this.spClient.clientId, config.env.SAML_SP_CLIENT_ID],
      options: {
        ...config.base.connection.saml.options,
        signInEndpoint: `https://${config.env.DOMAIN}/samlp/${this.idpClient.clientId}`,
        signOutEndpoint: `https://${config.env.DOMAIN}/samlp/${this.idpClient.clientId}/logout`,
        signingCert: Fn.base64encode(Fn.lookup(Fn.element(this.idpClient.signingKeys, 0), "cert", "")),
        debug: true,
        fieldsMap: JSON.stringify({
          saml_profile_data_color: "http://schemas.my-cdktf-stack.me/claims/color"
        })
      }
    })

    // Create a rule that performs user profile mappings
    this.spRule = new Rule(this, Utils.id(name, `rule-sp`), {
      provider: this.spAuth0Provider,
      name: `${name}-saml-sp-attr-mapping`,
      script: Fn.file(Utils.assetPath("rules", "saml-sp-attr-mapping.js")),
      enabled: true,
    })

  }

}

export default (app: App) => {
  new Stack(app, "basic-saml-idp-sp")
}