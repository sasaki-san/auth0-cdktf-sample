import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider, Rule, RuleConfigA, RuleConfigAConfig } from "../../.gen/providers/auth0"
import { config } from "../configs"
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

    const enabledRules = [
      { name: "Console Log Rule 1", src: "console-log.js" },
      { name: "Console Log Rule 2", src: "console-log.js" }
    ]

    // Create Rules
    enabledRules.forEach((rule, index) => {
      new Rule(this, Utils.id(name, `rule-${rule.name}`), {
        name: rule.name,
        script: Utils.readAsset("rules", rule.src),
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
      new RuleConfigA(this, Utils.id(name, `rule-config-${ruleConfig.key}`), ruleConfig)
    })

  }
}

export default (app: App) => {
  new Stack(app, "rules");
}