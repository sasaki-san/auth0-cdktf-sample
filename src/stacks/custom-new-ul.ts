import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider, Branding } from "../../.gen/providers/auth0"
import { config } from "../configs"
import Utils from "../utils/Utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider

  validateParams() {

  }

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    new Branding(this, Utils.id(name, "branding"), {
      colors: {
        primary: "#0059d6",
        pageBackground: "#FFFFFF"
      },
      universalLogin: {
        body: Utils.readAsset("new-ul", "simple.html")
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-new-ul");
}