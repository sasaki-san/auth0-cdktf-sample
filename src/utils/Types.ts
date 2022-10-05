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
  "mfa_oob" = "http://auth0.com/oauth/grant-type/mfa-oob",
  "mfa_otp" = "http://auth0.com/oauth/grant-type/mfa-otp",
  "mfa_recovery_code" = "http://auth0.com/oauth/grant-type/mfa-recovery-code",
  "password" = "password",
  "passwordRealm" = "http://auth0.com/oauth/grant-type/password-realm"
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

export enum CustomDomainTypes {
  auth0_managed_certs = "auth0_managed_certs",
  self_managed_certs = "self_managed_certs"
}

export enum PromptGroups {
  "login" = "login",
  "login-id" = "login-id",
  "login-password" = "login-password",
  "login-email-verification" = "login-email-verification",
  "signup" = "signup",
  "signup-id" = "signup-id",
  "signup-password" = "signup-password",
  "reset-password" = "reset-password",
  "consent" = "consent",
  "mfa-push" = "mfa-push",
  "mfa-otp" = "mfa-otp",
  "mfa-voice" = "mfa-voice",
  "mfa-phone" = "mfa-phone",
  "mfa-webauthn" = "mfa-webauthn",
  "mfa-sms" = "mfa-sms",
  "mfa-email" = "mfa-email",
  "mfa-recovery-code" = "mfa-recovery-code",
  "mfa" = "mfa",
  "status" = "status",
  "device-flow" = "device-flow",
  "email-verification" = "email-verification",
  "email-otp-challenge" = "email-otp-challenge",
  "organizations" = "organizations",
  "invitation" = "invitation",
  "common" = "common"
}

export enum PromptLangs {
  "ar" = "ar",
  "bg" = "bg",
  "bs" = "bs",
  "cs" = "cs",
  "da" = "da",
  "de" = "de",
  "el" = "el",
  "en" = "en",
  "es" = "es",
  "et" = "et",
  "fi" = "fi",
  "fr" = "fr",
  "fr-CA" = "fr-CA",
  "fr-FR" = "fr-FR",
  "he" = "he",
  "hi" = "hi",
  "hr" = "hr",
  "hu" = "hu",
  "id" = "id",
  "is" = "is",
  "it" = "it",
  "ja" = "ja",
  "ko" = "ko",
  "lt" = "lt",
  "lv" = "lv",
  "nb" = "nb",
  "nl" = "nl",
  "pl" = "pl",
  "pt" = "pt",
  "pt-BR" = "pt-BR",
  "pt-PT" = "pt-PT",
  "ro" = "ro",
  "ru" = "ru",
  "sk" = "sk",
  "sl" = "sl",
  "sr" = "sr",
  "sv" = "sv",
  "th" = "th",
  "tr" = "tr",
  "uk" = "uk",
  "vi" = "vi",
  "zh-CN" = "zh-CN",
  "zh-TW" = "zh-TW"
}

export enum LogStreamTypes {
  eventbridge = "eventbridge"
}

export enum LogStreamStatus {
  active = "active",
  paused = "paused",
  suspended = "suspended"
}