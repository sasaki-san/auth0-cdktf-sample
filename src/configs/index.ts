import { clientConfig, IClientConfig } from "./client.config"
import { connectionConfig, IConnectionConfig } from "./connection.config"
import { IEnvConfig, envConfig } from "./env.config"
import { apiConfig, IApiConfig } from "./api.config"

export interface IAuth0StackBaseConfig {
  client: IClientConfig,
  api: IApiConfig,
  connection: IConnectionConfig
  env: IEnvConfig
}

export const config: IAuth0StackBaseConfig = {
  client: clientConfig,
  api: apiConfig,
  connection: connectionConfig,
  env: envConfig
}
