import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider, GlobalClient, Tenant } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly globalClient: GlobalClient
  readonly tenant: Tenant

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Update login page template
    this.globalClient = new GlobalClient(this, Utils.id(name, "globalclient"), {
      customLoginPageOn: true,
      customLoginPage: Fn.file(Utils.assetPath("classic-ul", "login.passwordless.html"))
    })

    // Update both password-reset and multifactor templates
    this.tenant = new Tenant(this, Utils.id(name, "tenant"), {
      sessionCookie: {
        mode: "persistent"
      },
      idleSessionLifetime: 72, // this is in hours 4320 minutes
      sessionLifetime: 168, // this is in hours = 10800 minutes
      changePassword: {
        enabled: true,
        html: Fn.file(Utils.assetPath("classic-ul", "password-reset.default.html"))
      },
      guardianMfaPage: {
        enabled: true,
        html: Fn.file(Utils.assetPath("classic-ul", "multifactor.default.html"))
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-classic-ul");
}