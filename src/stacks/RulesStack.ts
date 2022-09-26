import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, Rule, RuleConfigA, RuleConfigAConfig } from "../../.gen/providers/auth0"
import { config } from "../configurations"
import BaseAuth0TerraformStack from "./BaseAuth0TerraformStack";

class RulesStack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.auth0Provider.domain,
      clientId: config.auth0Provider.clientId,
      clientSecret: config.auth0Provider.clientSecret
    })

    const enabledRules = [
      { name: "Console Log", src: "console-log.js" },
      { name: "Console Log 2", src: "console-log.js" }
    ]

    // Create Rules
    enabledRules.forEach((rule, index) => {
      new Rule(this, this.id(name, `rule-${rule.name}`), {
        name: rule.name,
        script: this.script("rules", rule.src),
        enabled: true,
        order: index + 1
      })
    })

    const ruleConfigs: RuleConfigAConfig[] = [
      { key: "some_secret_1", value: "password" },
      { key: "some_secret_2", value: "password" }
    ]

    // Create Rule Settings
    ruleConfigs.forEach((ruleConfig) => {
      new RuleConfigA(this, this.id(name, `rule-config-${ruleConfig.key}`), ruleConfig)
    })

  }
}

export const CreateRulesStack = (app: App) => {
  new RulesStack(app, "rules");
}