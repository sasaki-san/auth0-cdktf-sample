import { SnsPlatformApplication, SnsPlatformApplicationConfig } from "@cdktf/provider-aws/lib/sns-platform-application";
import { SnsTopic, SnsTopicConfig } from "@cdktf/provider-aws/lib/sns-topic";
import { SnsTopicSubscription, SnsTopicSubscriptionConfig } from "@cdktf/provider-aws/lib/sns-topic-subscription";
import { Construct } from "constructs";

export interface AwsSnsPlatformAppDeploymentConfig {
  platform: "GCM" | "APNS_SANDBOX"
  overrides: {
    snsTopic?: Partial<SnsTopicConfig>
    snsTopicSubscription: Partial<SnsTopicSubscriptionConfig>
    snsPlatformApp: Partial<SnsPlatformApplicationConfig>
  }
}

export default class AwsSnsPlatformAppDeployment extends Construct {

  readonly snsTopic: SnsTopic
  readonly snsTopicSubscription: SnsTopicSubscription
  readonly snsPlatformApp: SnsPlatformApplication

  get dependables() { return [this.snsPlatformApp] }

  constructor(scope: Construct, name: string, constructConfig: AwsSnsPlatformAppDeploymentConfig) {
    super(scope, name)

    // Create a topic to subscribe SNS events
    this.snsTopic = new SnsTopic(this, `${name}-snstopic`, {
      name,
      ...constructConfig.overrides.snsTopic
    })

    this.snsTopicSubscription = new SnsTopicSubscription(this, `${name}-topicsubscription`, {
      dependsOn: [this.snsTopic],
      topicArn: this.snsTopic.arn,
      endpointAutoConfirms: true,
      protocol: constructConfig.overrides.snsTopicSubscription.protocol!,
      endpoint: constructConfig.overrides.snsTopicSubscription.endpoint!,
      ...constructConfig.overrides?.snsTopicSubscription
    })

    this.snsPlatformApp = new SnsPlatformApplication(this, `${name}-snsplatformapp`, {
      dependsOn: [this.snsTopic],
      name,
      platform: constructConfig.platform,
      eventDeliveryFailureTopicArn: this.snsTopic.arn,
      eventEndpointCreatedTopicArn: this.snsTopic.arn,
      eventEndpointDeletedTopicArn: this.snsTopic.arn,
      eventEndpointUpdatedTopicArn: this.snsTopic.arn,
      platformCredential: "TBD",
      ...constructConfig.overrides.snsPlatformApp
    })

  }

}

