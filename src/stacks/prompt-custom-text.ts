import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider, PromptCustomText, } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { PromptGroups, PromptLangs } from "../utils/Types";
import Utils from "../utils/Utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    new PromptCustomText(this, Utils.id(name, "prompt"), {
      prompt: PromptGroups.login,
      language: PromptLangs.en,
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