import { Construct } from "constructs";
import { App } from "cdktf";
import { Action, Auth0Provider, TriggerBinding } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";
import { NodeRuntime } from "../utils/Types";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly actions: Action[]

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    const enabledActions = [
      {
        name: "Console Log Action 1",
        src: "console-log.js",
        dependencies: [
          { name: "lodash", version: "latest" },
          { name: "reques", version: "latest" }
        ],
        secrets: [
          { name: "secret-1", value: "password" },
          { name: "secret-2", value: "password" }
        ],
        trigger: { id: "post-login", version: "v3" }
      },
      {
        name: "Console Log Action 2",
        src: "console-log.js",
        dependencies: [
          { name: "auth0", version: "latest" }
        ],
        secrets: [
          { name: "secret-3", value: "password" },
          { name: "secret-4", value: "password" }
        ],
        trigger: { id: "post-login", version: "v3" }
      },
    ]

    // Create actions
    this.actions = enabledActions.map(action => {
      return new Action(this, this.id(name, `action-${action.name}`), {
        name: action.name,
        runtime: NodeRuntime.node16,
        deploy: true,
        code: this.script("actions", action.src),
        supportedTriggers: action.trigger,
        dependencies: action.dependencies,
      })
    })

    // Add the created actions to Login flow
    new TriggerBinding(this, this.id(name, `trigger-binding`), {
      trigger: "post-login",
      actions: this.actions.map(a => ({ id: a.id, displayName: a.name }))
    })
  }
}

export default (app: App) => {
  new Stack(app, "actions");
}