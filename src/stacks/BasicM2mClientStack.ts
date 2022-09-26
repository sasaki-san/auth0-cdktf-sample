import { Construct } from "constructs";
import { App } from "cdktf";
import { Auth0Provider, Client, ClientGrant, ResourceServer } from "../../.gen/providers/auth0"
import { config } from "../configurations"
import BaseAuth0TerraformStack from "./BaseAuth0TerraformStack";

class BasicM2mClientStack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly resourceServer: ResourceServer
  readonly clientGrants: ClientGrant

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.auth0Provider.domain,
      clientId: config.auth0Provider.clientId,
      clientSecret: config.auth0Provider.clientSecret
    })

    // Create an Auth0 Application - Machine to Machine
    this.client = new Client(this, this.id(name, "client"), {
      ...config.client.m2mDefault,
      name: this.id(name, "client")
    })

    // Create an Auth0 API 
    this.resourceServer = new ResourceServer(this, this.id(name, "api"), {
      ...config.api.default,
      name: this.id(name, "api"),
      identifier: `https://${name}`,
      scopes: [{ value: "transfer:funds", description: "Transfer funds" }]
    })

    // Grant API permissions to the Applicaiton
    this.clientGrants = new ClientGrant(this, this.id(name, "client-grants"), {
      clientId: this.client.clientId,
      audience: this.resourceServer.identifier,
      scope: ["transfer:funds"]
    })

  }
}

export const CreateBasicM2mClientStack = (app: App) => {
  new BasicM2mClientStack(app, "basic-m2m-client");
}