import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, Branding } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider

  validateParams() {

  }

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    new Branding(this, this.id(name, "branding"), {
      colors: {
        primary: "#0059d6",
        pageBackground: "#FFFFFF"
      },
      universalLogin: {
        body: this.readAsset("new-ul", "simple.html")
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-new-ul");
}