import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, GlobalClient, Tenant } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly globalClient: GlobalClient
  readonly tenant: Tenant

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Update login page template
    this.globalClient = new GlobalClient(this, this.id(name, "globalclient"), {
      customLoginPageOn: true,
      customLoginPage: this.readAsset("classic-ul", "login.passwordless.html")
    })

    // Update both password-reset and multifactor templates
    this.tenant = new Tenant(this, this.id(name, "tenant"), {
      sessionCookie: {
        mode: "persistent"
      },
      idleSessionLifetime: 72, // this is in hours 4320 minutes
      sessionLifetime: 168, // this is in hours = 10800 minutes
      changePassword: {
        enabled: true,
        html: this.readAsset("classic-ul", "password-reset.default.html")
      },
      guardianMfaPage: {
        enabled: true,
        html: this.readAsset("classic-ul", "multifactor.default.html")
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-classic-ul");
}