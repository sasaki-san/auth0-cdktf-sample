import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { EmailTemplate } from "../../.gen/providers/auth0/email-template";
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

    // Welcome email
    new EmailTemplate(this, Utils.id(name, "emailtemplate"), {
      template: Types.EmailTemplates.welcome_email,
      enabled: true,
      from: "admin@test.com",
      subject: "[Modified] Welcome!",
      syntax: "liquid",
      body: Fn.file(Utils.assetPath("email", "welcome_email.html"))
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-email-templates");
}