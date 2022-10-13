import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider, EmailTemplate } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { EmailTemplates } from "../utils/Types";
import { Utils, Validators } from "../utils";

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

    let htmlBody = Utils.readAsset("email", "welcome_email.html")
    htmlBody = htmlBody.replace("Welcome to ", "[Modified] Welcome to ")

    // Welcome email
    new EmailTemplate(this, Utils.id(name, "emailtemplate"), {
      template: EmailTemplates.welcome_email,
      enabled: true,
      from: "admin@test.com",
      subject: "[Modified] Welcome!",
      syntax: "liquid",
      body: htmlBody,
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-email-templates");
}