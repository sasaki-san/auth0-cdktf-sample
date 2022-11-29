import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Utils, Validators } from "../utils";
import { Branding } from "../../.gen/providers/auth0/branding";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

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
        body: Fn.file(Utils.assetPath("new-ul", "simple.html"))
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-new-ul");
}