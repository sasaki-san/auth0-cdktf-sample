import { Construct } from "constructs";
import { App, Fn } from "cdktf";
import { Auth0Provider, PromptCustomText, } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";
import { PromptGroups, PromptLangs } from "../utils/Types";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    new PromptCustomText(this, this.id(name, "prompt"), {
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