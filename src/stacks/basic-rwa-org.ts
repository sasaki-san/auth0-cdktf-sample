import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Utils, Validators } from "../utils";
import { Client } from "../../.gen/providers/auth0/client";
import { ClientGrant } from "../../.gen/providers/auth0/client-grant";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";
import { ResourceServer } from "../../.gen/providers/auth0/resource-server";
import { User } from "../../.gen/providers/auth0/user";
import { Organization } from "../../.gen/providers/auth0/organization";
import { OrganizationConnection } from "../../.gen/providers/auth0/organization-connection";
import ConnectionDeployment from "../constructs/connection/connection-deployment";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly clientGrants: ClientGrant
  readonly connection: ConnectionDeployment
  readonly user: User
  readonly organization: Organization
  readonly organizationConnection: OrganizationConnection

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.rwa,
      name: Utils.id(name, "client"),
      // Organization setting = BOTH
      organizationRequireBehavior: "no_prompt",
      organizationUsage: "allow",
      initiateLoginUri: "https://yusasaki.local/login-org"
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, Utils.id(name, "api"), {
      ...config.base.api.default,
      name: Utils.id(name, "api"),
      identifier: `https://${name}`,
      scopes: [{ value: "transfer:funds", description: "Transfer funds" }]
    })

    // Grant API permissions to the Applicaiton
    this.clientGrants = new ClientGrant(this, Utils.id(name, "client-grants"), {
      clientId: this.client.clientId,
      audience: this.resourceServer.identifier,
      scope: ["transfer:funds"]
    })

    // Create an Auth0 Connection
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "auth0",
      enabledClientIds: [this.client.clientId, config.env.CLIENT_ID],
    })

    this.organization = new Organization(this, Utils.id(name, "org"), {
      name: Utils.id(name, "org"),
      displayName: Utils.id(name, "org"),
      branding: {
        logoUrl: "https://openmoji.org/data/color/svg/2B22.svg",
      }
    })

    this.organizationConnection = new OrganizationConnection(this, Utils.id(name, "org-conn"), {
      connectionId: this.connection.id,
      organizationId: this.organization.id,
      assignMembershipOnLogin: true,
    })

    // Create a User in the created connection
    this.user = new User(this, Utils.id(name, "user"), {
      dependsOn: this.connection.dependables,
      ...config.base.user.john,
      connectionName: this.connection.name,
    })

  }
}

export default (app: App) => {
  new Stack(app, "basic-rwa-org");
}