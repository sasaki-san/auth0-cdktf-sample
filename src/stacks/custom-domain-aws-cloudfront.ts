import { Construct } from "constructs";
import { App, Fn, TerraformOutput, TerraformStack } from "cdktf";
import { config } from "../configs"
import { Types, Utils, Validators } from "../utils";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider"
import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";
import { CustomDomain } from "../../.gen/providers/auth0/custom-domain";
import { CustomDomainVerificationA } from "../../.gen/providers/auth0/custom-domain-verification";
import { Auth0Provider } from "../../.gen/providers/auth0/provider";
import { CloudflareProvider } from "@cdktf/provider-cloudflare/lib/provider"
import { Record } from "@cdktf/provider-cloudflare/lib/record"

class Stack extends TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly customDomain: CustomDomain
  readonly cloudFlareProvider: CloudflareProvider
  readonly cloudFlareTxtRecord: Record
  readonly customDomainVerification: CustomDomainVerificationA
  readonly cloudFlareCNameRecord: Record

  readonly awsProvider: AwsProvider
  readonly cloudfrontDistribution: CloudfrontDistribution

  constructor(scope: Construct, name: string) {
    super(scope, name)

    Validators.validateEnvValues(["DOMAIN", "CLIENT_ID", "CLIENT_SECRET", "CUSTOM_DOMAIN", "CUSTOM_DOMAIN_ETLD", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ZONE_ID", "AWS_ACCESS_KEY_ID", "AWS_ACCESS_SECRET_KEY", "AWS_REGION", "AWS_ACM_CERT_ARN"])

    this.auth0Provider = new Auth0Provider(this, Utils.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    this.cloudFlareProvider = new CloudflareProvider(this, Utils.id(name, "cfProvider"), {
      apiToken: config.env.CLOUDFLARE_API_TOKEN,
    })

    this.awsProvider = new AwsProvider(this, Utils.id(name, "awsprovider"), {
      region: config.env.AWS_REGION,
      accessKey: config.env.AWS_ACCESS_KEY_ID,
      secretKey: config.env.AWS_ACCESS_SECRET_KEY,
    })

    // Create a custom domain entry at Auth0
    this.customDomain = new CustomDomain(this, Utils.id(name, "customDomain"), {
      provider: this.auth0Provider,
      domain: config.env.CUSTOM_DOMAIN,
      type: Types.CustomDomainTypes.self_managed_certs,
    })

    new TerraformOutput(this, "customDomain.originDomainName", {
      value: this.customDomain.originDomainName
    })

    this.cloudFlareTxtRecord = new Record(this, Utils.id(name, "cfTxtRecord"), {
      provider: this.cloudFlareProvider,
      dependsOn: [this.customDomain],
      zoneId: config.env.CLOUDFLARE_ZONE_ID,
      name: Fn.lookup(this.customDomain.verification.get(0).methods.get(0), "domain", ""),
      type: "TXT",
      value: Fn.lookup(this.customDomain.verification.get(0).methods.get(0), "record", ""),
      ttl: 1, // AUTO
      proxied: false
    })

    // Verify the domain
    this.customDomainVerification = new CustomDomainVerificationA(this, Utils.id(name, "customDomainVerification"), {
      dependsOn: [this.cloudFlareTxtRecord],
      provider: this.auth0Provider,
      customDomainId: this.customDomain.id,
      timeouts: { create: "15m" }
    })

    this.cloudfrontDistribution = new CloudfrontDistribution(this, Utils.id(name, "awscfdist"), {
      dependsOn: [this.customDomainVerification],
      provider: this.awsProvider,
      enabled: true,
      aliases: [config.env.CUSTOM_DOMAIN],
      origin: [{
        originId: Utils.id(name, `awscfdist-${config.env.AWS_ACM_CERT_ARN}`),
        domainName: this.customDomain.originDomainName,
        customHeader: [{
          name: "cname-api-key",
          value: this.customDomainVerification.cnameApiKey
        }],
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"]
        }
      }],
      viewerCertificate: {
        acmCertificateArn: config.env.AWS_ACM_CERT_ARN,
        sslSupportMethod: "sni-only"
      },
      restrictions: {
        geoRestriction: {
          restrictionType: "none"
        }
      },
      defaultCacheBehavior: {
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: Utils.id(name, `awscfdist-${config.env.AWS_ACM_CERT_ARN}`),
        forwardedValues: {
          headers: ["Accept-Language", "Authorization", "Accept", "Origin", "Referer", "User-Agent"],
          queryString: true,
          cookies: {
            forward: "all",
          }
        }
      },
    })

    new TerraformOutput(this, "cloudfrontDistribution.domainName", {
      value: this.cloudfrontDistribution.domainName
    })

    // Create a DNS entry at CloudFlare
    this.cloudFlareCNameRecord = new Record(this, Utils.id(name, "cfCnameRecord"), {
      dependsOn: [this.cloudfrontDistribution],
      provider: this.cloudFlareProvider,
      zoneId: config.env.CLOUDFLARE_ZONE_ID,
      name: config.env.CUSTOM_DOMAIN.replace(`${config.env.CUSTOM_DOMAIN_ETLD}`, ""),
      type: "CNAME",
      ttl: 1, // AUTO
      value: this.cloudfrontDistribution.domainName,
      proxied: false
    })

  }
}

export default (app: App) => {
  new Stack(app, "custom-domain-aws-cloudfront");
}