import { Construct } from "constructs";
import { App, Fn, TerraformOutput, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { Action } from "../../.gen/providers/auth0/action";
import { Client } from "../../.gen/providers/auth0/client";
import { ClientGrant } from "../../.gen/providers/auth0/client-grant";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";
import { ResourceServer } from "../../.gen/providers/auth0/resource-server";
import { TriggerBinding } from "../../.gen/providers/auth0/trigger-binding";
import ConnectionDeployment from "../constructs/connection/connection-deployment";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly scimAdapter: ResourceServer
  readonly auth0MgmtClient: Client
  readonly scimAdapterClient: Client
  readonly connection: ConnectionDeployment
  readonly clientCredentialAction: Action

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

    const connectionName = Utils.id(name, "connection")

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 API 
    this.scimAdapter = new ResourceServer(this, Utils.id(name, "api"), {
      ...config.base.api.default,
      name: "SCIM Adapter",
      identifier: "https://scim.adapter",
      signingAlg: Types.AlgTypes.HS256
    })

    // Create an Auth0 Application
    this.auth0MgmtClient = new Client(this, Utils.id(name, "auth0mgmt-client"), {
      ...config.base.client.m2m,
      name: Utils.id(name, "auth0mgmt-client")
    })

    // Grant API permissions to the Applicaiton
    new ClientGrant(this, Utils.id(name, "mgmtapi-grants"), {
      clientId: this.auth0MgmtClient.clientId,
      audience: `https://${config.env.DOMAIN}/api/v2/`,
      scope: [
        "read:users",
        "create:users",
        "update:users",
        "delete:users"
      ]
    })

    this.scimAdapterClient = new Client(this, Utils.id(name, "scim-adapter-client"), {
      ...config.base.client.m2m,
      name: Utils.id(name, "scim-adapter-client"),
      clientMetadata: {
        "connection": connectionName
      }
    })

    new ClientGrant(this, Utils.id(name, "scimadapter-grants"), {
      clientId: this.auth0MgmtClient.clientId,
      audience: this.scimAdapter.identifier,
      scope: []
    })

    // Create an Auth0 Connection
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "auth0",
      enabledClientIds: [this.scimAdapterClient.clientId, this.auth0MgmtClient.clientId, config.env.CLIENT_ID],
      overrides: {
        connection: {
          name: connectionName,
          options: {
            requiresUsername: true
          },
        }
      }
    })

    this.clientCredentialAction = new Action(this, Utils.id(name, `action`), {
      name: Utils.id(name, `action`),
      deploy: true,
      code: Fn.file(Utils.assetPath("actions", "scim2-adapter-hook.js")),
      supportedTriggers: Types.ActionCurrentTriggers.credentials_exchange
    })

    new TriggerBinding(this, Utils.id(name, `actiontriggerbinding`), {
      dependsOn: [this.clientCredentialAction],
      trigger: Types.ActionCurrentTriggers.credentials_exchange.id,
      actions: [{ id: this.clientCredentialAction.id, displayName: this.clientCredentialAction.name }]
    })

    new TerraformOutput(this, Utils.id(name, "SCIM_API_KEY"), {
      description: "SCIM_API_KEY",
      value: this.scimAdapter.signingSecret
    })

    new TerraformOutput(this, Utils.id(name, "MGMT_CLIENT_ID"), {
      description: "MGMT_CLIENT_ID",
      value: this.auth0MgmtClient.clientId
    })

    new TerraformOutput(this, Utils.id(name, "MGMT_CLIENT_SECRET"), {
      description: "MGMT_CLIENT_SECRET",
      value: Fn.nonsensitive(this.auth0MgmtClient.clientSecret,),
    })

    new TerraformOutput(this, Utils.id(name, "SCIM_CLIENT_ID"), {
      description: "SCIM_CLIENT_ID",
      value: this.scimAdapterClient.clientId
    })

    new TerraformOutput(this, Utils.id(name, "SCIM_CLIENT_SECRET"), {
      description: "SCIM_CLIENT_SECRET",
      value: Fn.nonsensitive(this.scimAdapterClient.clientSecret),
    })

  }
}

export default (app: App) => {
  new Stack(app, "scim2-adapter");
}