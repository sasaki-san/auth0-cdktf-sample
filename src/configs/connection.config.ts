import { Fn } from "cdktf"
import { ConnectionConfig } from "../../.gen/providers/auth0"
import { Types, Utils } from "../utils"

const auth0: ConnectionConfig = {
  name: "TBD",
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
    template: Fn.file(Utils.assetPath("passwordless", "email.html")),
    disableSignup: false,
    bruteForceProtection: true,
    totp: {
      timeStep: 300,
      length: 6
    }
  }
}

const sms: ConnectionConfig = {
  name: "sms",
  strategy: Types.Strategies.sms,
  isDomainConnection: false,
  options: {
    requiresUsername: false,
    name: "sms",
    subject: "Welcome to {{ application.name }}",
    syntax: Types.TemplateSyntax.md_with_macros,
    template: Fn.file(Utils.assetPath("passwordless", "phone.md")),
    disableSignup: false,
    bruteForceProtection: true,
    totp: {
      timeStep: 180,
      length: 6
    },
    from: "TBD_FROM_PHONE",
    twilioSid: "TBD_TWILIO_SID",
    twilioToken: "TBD_TWILIO_TOKEN",
  }
}

const saml: ConnectionConfig = {
  name: "TBD",
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

const google: ConnectionConfig = {
  name: "TBD",
  strategy: Types.Strategies.google,
  isDomainConnection: false,
  options: {
  }
}

const azuread: ConnectionConfig = {
  name: "TBD",
  strategy: Types.Strategies.waad,
  isDomainConnection: false,
  showAsButton: true,
  displayName: "Azure AD",
  options: {
    domain: "TBD",
    clientId: "TBD",
    useWsfed: false,
    identityApi: "microsoft-identity-platform-v2.0",
    clientSecret: "TBD",
    tenantDomain: "TBD",
    waadProtocol: "openid-connect",
    apiEnableUsers: false,
    digestAlgorithm: Types.DigestAlg.sha256,
    protocolBinding: Types.ProtocolBindings.POST,
    signSamlRequest: true,
    signatureAlgorithm: Types.SignatureAlg.RSASHA256,
  }
}


export interface IConnectionConfig {
  auth0: ConnectionConfig
  email: ConnectionConfig
  sms: ConnectionConfig
  saml: ConnectionConfig
  google: ConnectionConfig
  azuread: ConnectionConfig
}

export const connectionConfig: IConnectionConfig = {
  auth0,
  email,
  sms,
  saml,
  google,
  azuread
}
