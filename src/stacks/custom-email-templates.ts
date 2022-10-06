import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, EmailTemplate } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";
import { EmailTemplates } from "../utils/Types";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    let htmlBody = this.readAsset("email", "welcome_email.html")
    htmlBody = htmlBody.replace("Welcome to ", "[Modified] Welcome to ")

    // Welcome email
    new EmailTemplate(this, this.id(name, "emailtemplate"), {
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