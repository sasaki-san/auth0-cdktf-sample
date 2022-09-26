import { ClientConfig, ConnectionConfig, ResourceServerConfig } from "../../.gen/providers/auth0"
import { Auth0ProviderBaseConfig, IAuth0ProviderBaseConfig } from "./Auth0Provider.config"
import { M2mClientBaseConfig, NativeClientBaseConfig, RwaClientBaseConfig, SpaClientBaseConfig } from "./Client.config"
import { ConnectionAuth0BaseConfig } from "./Connection.config"
import { ResourceServerBaseConfig } from "./ResourceServer.config"

export interface IAuth0StackBaseConfig {
  auth0Provider: IAuth0ProviderBaseConfig
  client: {
    nativeDefault: ClientConfig
    spaDefault: ClientConfig
    rwaDefault: ClientConfig
    m2mDefault: ClientConfig
  },
  api: {
    default: ResourceServerConfig

  },
  connection: {
    auth0: ConnectionConfig
  },
}

export const config: IAuth0StackBaseConfig = {
  auth0Provider: Auth0ProviderBaseConfig,
  client: {
    nativeDefault: NativeClientBaseConfig,
    spaDefault: SpaClientBaseConfig,
    rwaDefault: RwaClientBaseConfig,
    m2mDefault: M2mClientBaseConfig
  },
  api: {
    default: ResourceServerBaseConfig
  },
  connection: {
    auth0: ConnectionAuth0BaseConfig
  }
}
