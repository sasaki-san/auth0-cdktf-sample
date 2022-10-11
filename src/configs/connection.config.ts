import { ConnectionConfig } from "../../.gen/providers/auth0"
import { DigestAlg, ProtocolBindings, SignatureAlg, Strategies } from "../utils/Types"
import Utils from "../utils/Utils"

const auth0: ConnectionConfig = {
  name: "CDKTF-Auth0-Base-Connection",
  strategy: Strategies.auth0,
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
  strategy: Strategies.email,
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
    passwordPolicy: "good",
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
  strategy: Strategies.samlp,
  isDomainConnection: false,
  showAsButton: true,
  options: {
    digestAlgorithm: DigestAlg.sha256,
    protocolBinding: ProtocolBindings.POST,
    signSamlRequest: true,
    signatureAlgorithm: SignatureAlg.RSASHA256,
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
