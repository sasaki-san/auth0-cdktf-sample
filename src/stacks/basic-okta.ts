import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { Auth0Provider } from "../../.gen/providers/auth0/provider"
import { OktaProvider } from "../../.gen/providers/okta/provider"
import { AppOauth } from "../../.gen/providers/okta/app-oauth"
import { User } from "../../.gen/providers/okta/user"
import { AppUser } from "../../.gen/providers/okta/app-user"
import { Client } from "../../.gen/providers/auth0/client"
import { ResourceServer } from "../../.gen/providers/auth0/resource-server"
import { config } from "../configs"
import { Utils, Validators } from "../utils";
import ConnectionDeployment from "../constructs/connection/connection-deployment";

class Stack extends TerraformStack {

  readonly oktaProvider: OktaProvider
  readonly oktaOidcApp: AppOauth
  readonly oktaUser: User
  readonly oktaAppUser: AppUser

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: ConnectionDeployment

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "OKTA_BASE_URL", "OKTA_ORG", "OKTA_API_TOKEN"])

    // Crate an OIDC app at Okta

    this.oktaProvider = new OktaProvider(this, Utils.id(name, "oktaprovider"), {
      baseUrl: config.env.OKTA_BASE_URL,
      orgName: config.env.OKTA_ORG,
      apiToken: config.env.OKTA_API_TOKEN
    })

    this.oktaOidcApp = new AppOauth(this, Utils.id(name, "okta-oidc-app"), {
      label: Utils.id(name, "app"),
      type: "web",
      grantTypes: ["authorization_code"],
      redirectUris: [`https://${config.env.DOMAIN}/login/callback`],
      responseTypes: ["code"],
    })

    new TerraformOutput(this, Utils.id(name, "oktaOidcApp.clientId"), {
      value: this.oktaOidcApp.clientId
    })

    this.oktaUser = new User(this, Utils.id(name, "oktauser"), {
      firstName: "John",
      lastName: "Smith",
      login: "john-okta@gmail.com",
      email: "john-okta@gmail.com",
      password: "Password1234!",
    })

    this.oktaAppUser = new AppUser(this, Utils.id(name, "oktaappuser"), {
      appId: this.oktaOidcApp.id,
      userId: this.oktaUser.id,
      username: this.oktaUser.login
    })

    // Create an Auth0 app with Okta Enterprise connection

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
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "okta",
      enabledClientIds: [this.client.clientId, config.env.CLIENT_ID],
      overrides: {
        connection: {
          showAsButton: true,
          displayName: "Okta",
          options: {
            domain: `${config.env.OKTA_ORG}.${config.env.OKTA_BASE_URL}`,
            clientId: this.oktaOidcApp.clientId,
            clientSecret: this.oktaOidcApp.clientSecret
          }
        }
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "basic-okta");
}