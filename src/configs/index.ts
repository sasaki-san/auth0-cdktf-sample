import { ClientConfig, ConnectionConfig, ResourceServerConfig } from "../../.gen/providers/auth0"
import { Auth0ProviderBaseConfig, IAuth0ProviderBaseConfig, SamlSpAuth0ProviderBaseConfig } from "./Auth0ProviderConfig"
import { M2mClientBaseConfig, NativeClientBaseConfig, RwaClientBaseConfig, SamlIdpBaseConfig, SamlSpBaseConfig, SpaClientBaseConfig } from "./ClientConfig"
import { ConnectionAuth0BaseConfig, ConnectionSamlBaseConfig } from "./ConnectionConfig"
import { ResourceServerBaseConfig } from "./ResourceServerConfig"

export interface IAuth0StackBaseConfig {
  auth0Provider: IAuth0ProviderBaseConfig
  samlSpAuth0Provider: IAuth0ProviderBaseConfig
  client: {
    nativeDefault: ClientConfig
    spaDefault: ClientConfig
    rwaDefault: ClientConfig
    m2mDefault: ClientConfig
    samlIdpDefault: ClientConfig
    samlSpDefault: ClientConfig
  },
  api: {
    default: ResourceServerConfig

  },
  connection: {
    auth0: ConnectionConfig
    saml: ConnectionConfig
  },
  env: {
    MOBILE_IOS_CALLBACK: string[]
    MOBILE_ANDROID_CALLBACK: string[]
    MOBILE_IOS_LOGOUT: string[]
  }
}

export const config: IAuth0StackBaseConfig = {
  auth0Provider: Auth0ProviderBaseConfig,
  samlSpAuth0Provider: SamlSpAuth0ProviderBaseConfig,
  client: {
    nativeDefault: NativeClientBaseConfig,
    spaDefault: SpaClientBaseConfig,
    rwaDefault: RwaClientBaseConfig,
    m2mDefault: M2mClientBaseConfig,
    samlIdpDefault: SamlIdpBaseConfig,
    samlSpDefault: SamlSpBaseConfig,
  },
  api: {
    default: ResourceServerBaseConfig
  },
  connection: {
    auth0: ConnectionAuth0BaseConfig,
    saml: ConnectionSamlBaseConfig
  },
  env: {
    MOBILE_IOS_CALLBACK: process.env.MOBILE_IOS_CALLBACK?.split(",") || [],
    MOBILE_ANDROID_CALLBACK: process.env.MOBILE_ANDROID_CALLBACK?.split(",") || [],
    MOBILE_IOS_LOGOUT: process.env.MOBILE_IOS_LOGOUT?.split(",") || []
  }

}