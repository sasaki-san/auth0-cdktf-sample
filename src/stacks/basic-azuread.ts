import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider, Client, Connection, ResourceServer, Tenant } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly connection: Connection

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "AZUREAD_TENANT_ID", "AZUREAD_CLIENT_ID", "AZUREAD_CLIENT_SECRET"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    // Create an Auth0 Application
    this.client = new Client(this, Utils.id(name, "client"), {
      ...config.base.client.spa,
      name: Utils.id(name, "client")
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, Utils.id(name, "api"), {
      ...config.base.api.default,
      name: Utils.id(name, "api"),
      identifier: `https://${name}`,
    })

    // Create an Auth0 Connection
    // Note: ext_groups, ext_profile, ext_nested_groups are currently not supported
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.azuread,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID],
      showAsButton: true,
      displayName: "Azure AD",
      options: {
        ...config.base.connection.azuread.options,
        shouldTrustEmailVerifiedConnection: "never_set_emails_as_verified",
        domain: config.env.AZUREAD_TENANT_ID,
        tenantDomain: config.env.AZUREAD_TENANT_ID,
        clientId: config.env.AZUREAD_CLIENT_ID,
        clientSecret: config.env.AZUREAD_CLIENT_SECRET
      }
    })

    // Email verificaiton flag for AD/ADFS
    new Tenant(this, Utils.id(name, "tenant"), {
      sessionCookie: {
        mode: Types.TenantCookieSessionModes.persistent
      },
      flags: {
        enableAdfsWaadEmailVerification: false
      }
    })

  }
}

export default (app: App) => {
  new Stack(app, "basic-azuread");
}