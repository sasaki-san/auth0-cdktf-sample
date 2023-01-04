import { Construct } from "constructs";
import { Connection, ConnectionConfig } from "../../../.gen/providers/auth0/connection"
import { ConnectionClient } from "../../../.gen/providers/auth0/connection-client"
import { config } from "../../configs"

export type StrategyTypes = "auth0" | "amazon" | "azuread" | "google" | "okta" | "saml" | "email" | "sms"

export interface ConnectionDeploymentConfig {
  enabledClientIds: string[]
  strategy: StrategyTypes
  overrides?: {
    connection: Partial<ConnectionConfig>
  }
}

export default class ConnectionDeployment extends Construct {

  readonly connection: Connection
  readonly connectionClients: ConnectionClient[] = []

  get name() { return this.connection.name }
  get id() { return this.connection.id }
  get dependables() { return this.connectionClients }

  constructor(scope: Construct, name: string, constructConfig: ConnectionDeploymentConfig) {
    super(scope, name)

    // Create an Auth0 Connection
    // Note: ext_groups, ext_profile, ext_nested_groups are currently not supported
    // Field	Value to Provide
    // Allowed Javascript Origins	https://YOUR_DOMAIN/
    // Allowed Return URL	https://YOUR_DOMAIN/login/callback
    // 
    // ... Terraform source code broken??  
    this.connection = new Connection(this, name, {
      ...config.base.connection[constructConfig.strategy],
      ...constructConfig.overrides?.connection,
      name,
      options: {
        ...config.base.connection[constructConfig.strategy].options,
        ...constructConfig.overrides?.connection.options
      }
    })

    let previous: ConnectionClient | undefined = undefined
    constructConfig.enabledClientIds.map((clientId, i) => {
      previous = new ConnectionClient(this, `${name}-client-${i}`, {
        dependsOn: previous ? [previous] : [],
        clientId: clientId,
        connectionId: this.connection.id,
      })
      this.connectionClients.push(previous)
    })

  }

}
