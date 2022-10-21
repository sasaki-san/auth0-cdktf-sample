import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Action, Auth0Provider, TriggerBinding } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly postLoginAction: Action
  readonly preUserRegistrationAction: Action
  readonly postChangePasswordAction: Action

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Post login action

    this.postLoginAction = new Action(this, Utils.id(name, `action-postlogin`), {
      name: Utils.id(name, `action-postlogin`),
      // runtime: Types.NodeRuntime.node16,
      deploy: true,
      code: Fn.file(Utils.assetPath("actions", "console-log.js")),
      supportedTriggers: Types.ActionCurrentTriggers.post_login,
      dependencies: [
        { name: "lodash", version: "latest" },
        { name: "reques", version: "latest" }
      ]
    })

    new TriggerBinding(this, Utils.id(name, `triggerbinding-postlogin`), {
      dependsOn: [this.postLoginAction],
      trigger: Types.ActionCurrentTriggers.post_login.id,
      actions: [{ id: this.postLoginAction.id, displayName: this.postLoginAction.name }]
    })

    // // Pre user registration action
    this.preUserRegistrationAction = new Action(this, Utils.id(name, `action-preuserreg`), {
      name: Utils.id(name, `action-preuserreg`),
      // runtime: Types.NodeRuntime.node16,
      deploy: true,
      code: Fn.file(Utils.assetPath("actions", "console-log.js")),
      supportedTriggers: Types.ActionCurrentTriggers.pre_user_registration,
      dependencies: [
        { name: "lodash", version: "latest" },
        { name: "reques", version: "latest" }
      ]
    })

    new TriggerBinding(this, Utils.id(name, `triggerbinding-preuserreg`), {
      dependsOn: [this.preUserRegistrationAction],
      trigger: Types.ActionCurrentTriggers.pre_user_registration.id,
      actions: [{ id: this.preUserRegistrationAction.id, displayName: this.preUserRegistrationAction.name }]
    })

    // Post change password action

    this.postChangePasswordAction = new Action(this, Utils.id(name, `action-postchpw`), {
      name: Utils.id(name, `action-postchpw`),
      // runtime: Types.NodeRuntime.node16,
      deploy: true,
      code: Fn.file(Utils.assetPath("actions", "post-change-pw-send-email.js")),
      supportedTriggers: Types.ActionCurrentTriggers.post_change_password,
      dependencies: [
        { name: "nodemailer", version: "latest" }
      ],
      secrets: [
        { name: "SMTP_HOST", value: config.env.SMTP_HOST },
        { name: "SMTP_PORT", value: config.env.SMTP_PORT },
        { name: "SMTP_AUTH_USER", value: config.env.SMTP_AUTH_USER },
        { name: "SMTP_AUTH_PASS", value: config.env.SMTP_AUTH_PASS },
      ]
    })

    new TriggerBinding(this, Utils.id(name, `triggerbinding-postchpw`), {
      dependsOn: [this.postChangePasswordAction],
      trigger: Types.ActionCurrentTriggers.post_change_password.id,
      actions: [{ id: this.postChangePasswordAction.id, displayName: this.postChangePasswordAction.name }]
    })

  }
}

export default (app: App) => {
  new Stack(app, "actions");
}