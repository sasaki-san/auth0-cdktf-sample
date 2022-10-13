import { ConnectionConfig } from "../../.gen/providers/auth0"
import { Types, Utils } from "../utils"

const auth0: ConnectionConfig = {
  name: "CDKTF-Auth0-Base-Connection",
  strategy: Types.Strategies.auth0,
  isDomainConnection: false,
  options: {
    mfa: {
      active: true,
      returnEnrollSettings: true
    },
    validation: {
      username: {
        max: 15,
        min: 1
      }
    },
    disableSignup: false,
    passwordPolicy: "good",
    requiresUsername: false,
    bruteForceProtection: true
  }
}

const email: ConnectionConfig = {
  name: "email",
  strategy: Types.Strategies.email,
  isDomainConnection: false,
  options: {
    requiresUsername: false,
    name: "email",
    from: `{{ application.name }} \u003cadmin@myapp.com\u003e`,
    subject: "Welcome to {{ application.name }}",
    syntax: "liquid",
    template: Utils.readAsset("passwordless", "email.html"),
    disableSignup: false,
    bruteForceProtection: true,
    totp: {
      timeStep: 300,
      length: 6
    }
  }
}

const saml: ConnectionConfig = {
  name: "CDKTF-Saml-Base-Connection",
  strategy: Types.Strategies.samlp,
  isDomainConnection: false,
  showAsButton: true,
  options: {
    digestAlgorithm: Types.DigestAlg.sha256,
    protocolBinding: Types.ProtocolBindings.POST,
    signSamlRequest: true,
    signatureAlgorithm: Types.SignatureAlg.RSASHA256,
  }
}

export interface IConnectionConfig {
  auth0: ConnectionConfig
  email: ConnectionConfig
  saml: ConnectionConfig
}

export const connectionConfig: IConnectionConfig = {
  auth0,
  email,
  saml
}
