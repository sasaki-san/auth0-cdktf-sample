import { ConnectionConfig } from "../../.gen/providers/auth0"
import { DigestAlg, ProtocolBindings, SignatureAlg, Strategies } from "./types/Enums"

export const ConnectionAuth0BaseConfig = {
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
    strategyVersion: 2,
    requiresUsername: false,
    bruteForceProtection: true
  }
} as ConnectionConfig

export const ConnectionSamlBaseConfig = {
  name: "CDKTF-Saml-Base-Connection",
  strategy: Strategies.samlp,
  isDomainConnection: false,
  showAsButton: true,
  options: {
    bruteForceProtection: true,
    digestAlgorithm: DigestAlg.sha256,
    protocolBinding: ProtocolBindings.POST,
    signSamlRequest: true,
    signatureAlgorithm: SignatureAlg.RSASHA256,
    strategyVersion: 0,
  }
} as ConnectionConfig
