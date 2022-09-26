import { ConnectionConfig } from "../../.gen/providers/auth0"

export const ConnectionAuth0BaseConfig = {
  name: "CDKTF-Auth0-Base-Connection",
  strategy: "auth0",
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
