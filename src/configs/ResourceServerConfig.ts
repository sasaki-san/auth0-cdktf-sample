import { ResourceServerConfig } from "../../.gen/providers/auth0";
import { AlgTypes } from "./Types";

export const ResourceServerBaseConfig = {
  name: "CDKTF-API",
  identifier: "https://cdktf-api",
  allowOfflineAccess: false,
  skipConsentForVerifiableFirstPartyClients: true,
  tokenLifetime: 86400,
  tokenLifetimeForWeb: 7200,
  signingAlg: AlgTypes.RS256,
} as ResourceServerConfig