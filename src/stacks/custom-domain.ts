import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Auth0Provider, CustomDomain, CustomDomainVerification, CustomDomainVerificationA } from "../../.gen/providers/auth0"
import { CloudflareProvider, Record } from "../../.gen/providers/cloudflare"
import { config } from "../configs"
import { CustomDomainTypes } from "../utils/Types";
import Utils from "../utils/Utils";

interface CloudflareDnsConfig {
  eTLD: string
  name: string
}

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly customDomain: CustomDomain
  readonly cloudFlareProvider: CloudflareProvider
  readonly cloudFlareRecord: Record
  readonly customDomainVerification: CustomDomainVerification

  constructor(scope: Construct, name: string, dnsConfig: CloudflareDnsConfig) {
    super(scope, name)

    if (config.env.CLOUDFLARE_API_TOKEN === undefined || config.env.CLOUDFLARE_ZONE_ID === undefined) {
      throw Error(`CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID must be set`)
    }

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
      domain: `${dnsConfig.name}.${dnsConfig.eTLD}`,
      type: CustomDomainTypes.auth0_managed_certs,
    })

    // Create a DNS entry at CloudFlare
    this.cloudFlareRecord = new Record(this, Utils.id(name, "cfRecord"), {
      provider: this.cloudFlareProvider,
      dependsOn: [this.customDomain],
      zoneId: config.env.CLOUDFLARE_ZONE_ID,
      name: dnsConfig.name,
      type: "CNAME",
      ttl: 1, // AUTO
      value: this.customDomain.verification.get(0).methods.get(0).lookup("record"),
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
  new Stack(app, "custom-domain", {
    eTLD: "yusasaki0.app",
    name: "hello-world"
  });
}