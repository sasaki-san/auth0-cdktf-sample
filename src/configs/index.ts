import { clientConfig, IClientConfig } from "./client.config"
import { connectionConfig, IConnectionConfig } from "./connection.config"
import { IEnvConfig, envConfig } from "./env.config"
import { apiConfig, IApiConfig } from "./api.config"
import { IUserConfig, userConfig } from "./user.config"

export interface IAuth0StackBaseConfig {
  base: {
    client: IClientConfig,
    api: IApiConfig,
    connection: IConnectionConfig
    user: IUserConfig
  }
  env: IEnvConfig
}

export const config: IAuth0StackBaseConfig = {
  base: {
    client: clientConfig,
    api: apiConfig,
    connection: connectionConfig,
    user: userConfig
  },
  env: envConfig
}
