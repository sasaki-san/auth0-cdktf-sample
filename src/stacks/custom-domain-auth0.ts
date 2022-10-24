import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { Auth0Provider, CustomDomain, CustomDomainVerificationA } from "../../.gen/providers/auth0"
import { CloudflareProvider, Record } from "../../.gen/providers/cloudflare"
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly customDomain: CustomDomain
  readonly cloudFlareProvider: CloudflareProvider
  readonly cloudFlareRecord: Record
  readonly customDomainVerification: CustomDomainVerificationA

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "CUSTOM_DOMAIN", "CUSTOM_DOMAIN_ETLD", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ZONE_ID"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    this.cloudFlareProvider = new CloudflareProvider(this, Utils.id(name, "cfProvider"), {
      apiToken: config.env.CLOUDFLARE_API_TOKEN,
    })

    // Create a custom domain entry at Auth0
    this.customDomain = new CustomDomain(this, Utils.id(name, "customDomain"), {
      provider: this.auth0Provider,
      domain: config.env.CUSTOM_DOMAIN,
      type: Types.CustomDomainTypes.auth0_managed_certs,
    })

    // Create a DNS entry at CloudFlare
    this.cloudFlareRecord = new Record(this, Utils.id(name, "cfRecord"), {
      provider: this.cloudFlareProvider,
      dependsOn: [this.customDomain],
      zoneId: config.env.CLOUDFLARE_ZONE_ID,
      name: config.env.CUSTOM_DOMAIN.replace(`${config.env.CUSTOM_DOMAIN_ETLD}`, ""),
      type: "CNAME",
      ttl: 1, // AUTO
      value: Fn.lookup(Fn.element(this.customDomain.verification.get(0).methods, 0), "record", "FAILED_TO_GET_RECORD"),
      proxied: false
    })

    // Verify the domain
    this.customDomainVerification = new CustomDomainVerificationA(this, Utils.id(name, "customDomainVerification"), {
      provider: this.auth0Provider,
      dependsOn: [this.cloudFlareRecord],
      customDomainId: this.customDomain.id,
      timeouts: { create: "15m" }
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-domain-auth0");
}