import { ClientConfig } from "../../.gen/providers/auth0"
import { AlgTypes, AppTypes, ExpirationTypes, GrantTypes, RotationTypes, TokenEndpointAuthMethod } from "../utils/Types"

const native = {
  isTokenEndpointIpHeaderTrusted: false,
  name: "CDKTF Native Application",
  isFirstParty: true,
  oidcConformant: true,
  ssoDisabled: false,
  crossOriginAuth: false,
  refreshToken: {
    expirationType: ExpirationTypes["non-expiring"],
    leeway: 0,
    infiniteTokenLifetime: true,
    infiniteIdleTokenLifetime: true,
    tokenLifetime: 2592000,
    idleTokenLifetime: 1296000,
    rotationType: RotationTypes["non-rotating"],
  },
  jwtConfiguration: {
    alg: AlgTypes.RS256,
    lifetimeInSeconds: 36000,
    secretEncoded: false
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.none,
  appType: AppTypes.native,
  grantTypes: [
    GrantTypes.authorization_code,
    GrantTypes.implicit,
    GrantTypes.refresh_token
  ],
  customLoginPageOn: true,
}

const m2m = {
  isTokenEndpointIpHeaderTrusted: false,
  name: "CDKTF M2M Application",
  isFirstParty: true,
  oidcConformant: true,
  ssoDisabled: false,
  crossOriginAuth: false,
  refreshToken: {
    expirationType: ExpirationTypes["non-expiring"],
    leeway: 0,
    infiniteTokenLifetime: true,
    infiniteIdleTokenLifetime: true,
    tokenLifetime: 31557600,
    idleTokenLifetime: 2592000,
    rotationType: RotationTypes["non-rotating"],
  },
  jwtConfiguration: {
    alg: AlgTypes.RS256,
    lifetimeInSeconds: 36000,
    secretEncoded: false
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.client_secret_post,
  appType: AppTypes.non_interactive,
  grantTypes: [
    GrantTypes.client_credentials
  ],
  customLoginPageOn: true,
}

const rwa = {
  isTokenEndpointIpHeaderTrusted: false,
  name: "CDKTF RWA Application",
  isFirstParty: true,
  oidcConformant: true,
  ssoDisabled: false,
  crossOriginAuth: false,
  refreshToken: {
    expirationType: ExpirationTypes["non-expiring"],
    leeway: 0,
    infiniteTokenLifetime: true,
    infiniteIdleTokenLifetime: true,
    tokenLifetime: 31557600,
    idleTokenLifetime: 2592000,
    rotationType: RotationTypes["non-rotating"],
  },
  jwtConfiguration: {
    alg: AlgTypes.RS256,
    lifetimeInSeconds: 36000,
    secretEncoded: false
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.client_secret_post,
  appType: AppTypes.regular_web,
  grantTypes: [
    GrantTypes.authorization_code,
    GrantTypes.implicit,
    GrantTypes.refresh_token,
    GrantTypes.client_credentials
  ],
  customLoginPageOn: true,
}

const spa = {
  isTokenEndpointIpHeaderTrusted: false,
  name: "CDKTF SPA Application",
  isFirstParty: true,
  oidcConformant: true,
  ssoDisabled: false,
  crossOriginAuth: false,
  refreshToken: {
    expirationType: ExpirationTypes.expiring,
    leeway: 0,
    tokenLifetime: 2592000,
    idleTokenLifetime: 1296000,
    infiniteTokenLifetime: false,
    infiniteIdleTokenLifetime: false,
    rotationType: RotationTypes.rotating,
  },
  jwtConfiguration: {
    alg: AlgTypes.RS256,
    lifetimeInSeconds: 36000,
    secretEncoded: false
  },
  tokenEndpointAuthMethod: TokenEndpointAuthMethod.none,
  appType: AppTypes.spa,
  grantTypes: [
    GrantTypes.authorization_code,
    GrantTypes.implicit,
    GrantTypes.refresh_token
  ],
  customLoginPageOn: true,
}

const samlIdp = {
  ...rwa,
  name: "CDKTF SAML IDP Application",
  callbacks: ["TBD"],
  addons: {
    samlp: {
      createUpnClaim: false,
      digestAlgorithm: "sha256",
      includeAttributeNameFormat: false,
      mapIdentities: false,
      mapUnknownClaimsAsIs: false,
      mappings: {},
      nameIdentifierProbes: [],
      passthroughClaimsWithNoMapping: false,
      signResponse: false,
      signatureAlgorithm: "rsa-sha256",
      typedAttributes: false
    }
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