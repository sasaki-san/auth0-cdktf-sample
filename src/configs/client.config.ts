import { ClientConfig } from "../../.gen/providers/auth0"
import { AlgTypes, AppTypes, ExpirationTypes, GrantTypes, RotationTypes, TokenEndpointAuthMethod } from "../utils/Types"
import { envConfig } from "./env.config"

const common: ClientConfig = {
  name: "CDKTF Application",
  isFirstParty: true,
  logoUri: "https://raw.githubusercontent.com/sasaki-san/auth0-cdktf-sample/main/src/assets/images/terraform-logo.png",
  oidcConformant: true,
  ssoDisabled: false,
  crossOriginAuth: false,
  jwtConfiguration: {
    alg: AlgTypes.RS256,
    lifetimeInSeconds: 36000,
    secretEncoded: false
  },
  customLoginPageOn: true,
  isTokenEndpointIpHeaderTrusted: false,
  callbacks: [envConfig.PROTOCOL_DEBUGGER_CALLBACK]
}

const native: ClientConfig = {
  ...common,
  refreshToken: {
    expirationType: ExpirationTypes["non-expiring"],
    leeway: 0,
    infiniteTokenLifetime: true,
    infiniteIdleTokenLifetime: true,
    tokenLifetime: 2592000,
    idleTokenLifetime: 1296000,
    rotationType: RotationTypes["non-rotating"],
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.none,
  appType: AppTypes.native,
  grantTypes: [
    GrantTypes.authorization_code,
    GrantTypes.implicit,
    GrantTypes.refresh_token
  ],
}

const m2m: ClientConfig = {
  ...common,
  refreshToken: {
    expirationType: ExpirationTypes["non-expiring"],
    leeway: 0,
    infiniteTokenLifetime: true,
    infiniteIdleTokenLifetime: true,
    tokenLifetime: 31557600,
    idleTokenLifetime: 2592000,
    rotationType: RotationTypes["non-rotating"],
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.client_secret_post,
  appType: AppTypes.non_interactive,
  grantTypes: [
    GrantTypes.client_credentials
  ],
}

const rwa: ClientConfig = {
  ...common,
  refreshToken: {
    expirationType: ExpirationTypes["non-expiring"],
    leeway: 0,
    infiniteTokenLifetime: true,
    infiniteIdleTokenLifetime: true,
    tokenLifetime: 31557600,
    idleTokenLifetime: 2592000,
    rotationType: RotationTypes["non-rotating"],
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.client_secret_post,
  appType: AppTypes.regular_web,
  grantTypes: [
    GrantTypes.authorization_code,
    GrantTypes.implicit,
    GrantTypes.refresh_token,
    GrantTypes.client_credentials
  ],
}

const spa: ClientConfig = {
  ...common,
  refreshToken: {
    expirationType: ExpirationTypes.expiring,
    leeway: 0,
    tokenLifetime: 2592000,
    idleTokenLifetime: 1296000,
    infiniteTokenLifetime: false,
    infiniteIdleTokenLifetime: false,
    rotationType: RotationTypes.rotating,
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.none,
  appType: AppTypes.spa,
  grantTypes: [
    GrantTypes.authorization_code,
    GrantTypes.implicit,
    GrantTypes.refresh_token
  ],
}

const samlIdp: ClientConfig = {
  ...rwa,
  name: "CDKTF SAML IDP Application",
  callbacks: ["TBD"],
  addons: {
    samlp: {},
  }
}

const samlSp: ClientConfig = {
  ...rwa,
  name: "CDKTF SAML SP Application",
}

export interface IClientConfig {
  native: ClientConfig
  spa: ClientConfig
  rwa: ClientConfig
  m2m: ClientConfig
  samlIdp: ClientConfig
  samlSp: ClientConfig
}

export const clientConfig: IClientConfig = {
  native,
  spa,
  rwa,
  m2m,
  samlIdp,
  samlSp
}
