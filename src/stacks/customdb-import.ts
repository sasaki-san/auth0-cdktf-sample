import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider } from "../../.gen/providers/auth0/provider"
import { Client } from "../../.gen/providers/auth0/client"
import { config } from "../configs"
import { Utils, Validators } from "../utils";
import ConnectionDeployment from "../constructs/connection/connection-deployment";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly client: Client
  readonly connection: ConnectionDeployment

  constructor(scope: Construct, name: string, alg: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET"])

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

    // Create an Auth0 Connection 
    this.connection = new ConnectionDeployment(this, Utils.id(name, "connection"), {
      strategy: "auth0",
      enabledClientIds: [this.client.clientId, config.env.CLIENT_ID],
      overrides: {
        connection: {
          options: {
            importMode: true,
            enabledDatabaseCustomization: true,
            customScripts: {
              login: Fn.file(Utils.assetPath("database", `${alg}.login.js`)),
              get_user: Fn.file(Utils.assetPath("database", "getUser.js"))
            },
            ...this.getConfiguration(alg)
          }
        }
      }
    })

  }

  getConfiguration(alg: string) {

    if (alg === "mscrypt2") {
      return {
        configuration: {
          FIREBASE_APIKEY: config.env.FIREBASE_APIKEY,
          FIREBASE_AUTHDOMAIN: config.env.FIREBASE_AUTHDOMAIN,
          FIREBASE_PROJECTID: config.env.FIREBASE_PROJECTID,
        }
      }
    }

    return {}
  }
}

export default (app: App) => {
  new Stack(app, "customdb-import-bcrypt", "bcrypt");
  new Stack(app, "customdb-import-pbkdf2", "pbkdf2");

  // modified scrypt (firebase)
  new Stack(app, "customdb-import-mscrypt1", "mscrypt1");
  new Stack(app, "customdb-import-mscrypt2", "mscrypt2");
}