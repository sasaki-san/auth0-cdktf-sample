import { ResourceServerConfig } from "../../.gen/providers/auth0";
import { Types } from "../utils";

const _default: ResourceServerConfig = {
  name: "CDKTF-API",
  identifier: "https://cdktf-api",
  allowOfflineAccess: false,
  skipConsentForVerifiableFirstPartyClients: true,
  tokenLifetime: 86400,
  tokenLifetimeForWeb: 7200,
  signingAlg: Types.AlgTypes.RS256,
}

export interface IApiConfig {
  default: ResourceServerConfig
}

export const apiConfig: IApiConfig = {
  default: _default
}