import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { PromptCustomText } from "../../.gen/providers/auth0/prompt-custom-text";
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

    new PromptCustomText(this, Utils.id(name, "prompt"), {
      prompt: Types.PromptGroups.login,
      language: Types.PromptLangs.en,
      body: Fn.jsonencode({
        "login": {
          "title": "Welcome"
        }
      })
    })

  }
}

export default (app: App) => {
  new Stack(app, "prompt-custom-text");
}