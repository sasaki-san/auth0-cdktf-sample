export enum AppTypes {
  "spa" = "spa",
  "regular_web" = "regular_web",
  "non_interactive" = "non_interactive",
  "native" = "native"
}

export enum TokenEndpointAuthMethod {
  "client_secret_post" = "client_secret_post",
  "none" = "none"
}

export enum AlgTypes {
  "RS256" = "RS256"
}

export enum GrantTypes {
  "authorization_code" = "authorization_code",
  "implicit" = "implicit",
  "refresh_token" = "refresh_token",
  "client_credentials" = "client_credentials",
}

export enum RotationTypes {
  "non-rotating" = "non-rotating",
  "rotating" = "rotating"
}

export enum ExpirationTypes {
  "non-expiring" = "non-expiring",
  "expiring" = "expiring"
}

export enum NodeRuntime {
  "node12" = "node12",
  "node16" = "node16"
}

export enum Strategies {
  "auth0" = "auth0",
  "samlp" = "samlp"
}

export enum DigestAlg {
  "sha256" = "sha256"
}

export enum ProtocolBindings {
  "POST" = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"

}

export enum SignatureAlg {
  "RSASHA256" = "rsa-sha256"
}

export enum Policies {
  "Never" = "never",
  "AdaptiveMFA" = "confidence-score",
  "Always" = "all-applications"
}