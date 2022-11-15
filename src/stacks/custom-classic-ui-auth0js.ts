import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider, Client, Connection, GlobalClient, User } from "../../.gen/providers/auth0"
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
const shell = require('child_process').execSync

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly globalClient: GlobalClient
  readonly connection: Connection
  readonly connection2: Connection
  readonly user: User
  readonly user2: User

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
      grantTypes: [
        Types.GrantTypes.implicit, // Login with username and password
        Types.GrantTypes.authorization_code, // Login with database connection (popup)
        ...Types.passwordGrantTypes() // Login with database connection (client login)
      ],
      callbacks: [
        ...(config.base.client.rwa.callbacks || []),
        "https://yusasaki.jp.auth0.com"
      ],
      allowedLogoutUrls: [
        ...(config.base.client.rwa.allowedLogoutUrls || []),
        "https://yusasaki.jp.auth0.com"
      ],
      tokenEndpointAuthMethod: Types.TokenEndpointAuthMethod.none
    })

    // Create an Auth0 Connection
    this.connection = new Connection(this, Utils.id(name, "connection"), {
      ...config.base.connection.auth0,
      name: Utils.id(name, "connection"),
      enabledClients: [this.client.clientId, config.env.CLIENT_ID]
    })

    // Create a Passwordless - Email Connection
    this.connection2 = new Connection(this, Utils.id(name, "connection2"), {
      ...config.base.connection.email,
      enabledClients: [this.client.clientId, config.env.CLIENT_ID]
    })

    // Create a User in the created connection
    this.user = new User(this, Utils.id(name, "user-john"), {
      email: "john@gmail.com",
      password: "Password!",
      connectionName: this.connection.name,
    })

    // Create a User in the created connection
    this.user2 = new User(this, Utils.id(name, "user-john2"), {
      email: "john@gmail.com",
      connectionName: this.connection2.name,
    })

    const originalAssetPath = Utils.assetPath("classic-ul", "login.auth0js.html")
    shell(`cp ${originalAssetPath} ${originalAssetPath.replace("login.auth0js.html", "my-login.auth0js.html")}`)
    const newAssetPath = Utils.assetPath("classic-ul", "my-login.auth0js.html")
    shell(`sed -i "" "s!%CDN%!https://yusasaki.local!g" ${newAssetPath}`)

    // Update login page template
    this.globalClient = new GlobalClient(this, Utils.id(name, "globalclient"), {
      customLoginPageOn: true,
      customLoginPage: Fn.file(newAssetPath)
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-classic-ui-auth0js");
}
