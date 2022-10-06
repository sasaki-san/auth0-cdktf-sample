import { Construct } from "constructs";
import { App } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider"
import { CloudwatchEventBus } from "@cdktf/provider-aws/lib/cloudwatch-event-bus"
import { CloudwatchEventRule } from "@cdktf/provider-aws/lib/cloudwatch-event-rule"
import { CloudwatchEventTarget } from "@cdktf/provider-aws/lib/cloudwatch-event-target"
import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group"
import { Auth0Provider, LogStream } from "../../.gen/providers/auth0"
import { config } from "../configs"
import BaseAuth0TerraformStack from "../utils/BaseAuth0TerraformStack";
import { LogStreamStatus, LogStreamTypes } from "../utils/Types";

class Stack extends BaseAuth0TerraformStack {

  readonly auth0Provider: Auth0Provider
  readonly awsProvider: AwsProvider
  readonly logStream: LogStream
  readonly awsEventBus: CloudwatchEventBus
  readonly awsEventRule: CloudwatchEventRule
  readonly awsCloudwatchLogGroup: CloudwatchLogGroup
  readonly awsEventTarget: CloudwatchEventTarget

  constructor(scope: Construct, name: string) {
    super(scope, name)

    this.auth0Provider = new Auth0Provider(this, this.id(name, "auth0provider"), {
      domain: config.env.DOMAIN,
      clientId: config.env.CLIENT_ID,
      clientSecret: config.env.CLIENT_SECRET
    })

    this.logStream = new LogStream(this, this.id(name, "logstream"), {
      provider: this.auth0Provider,
      name: name,
      type: LogStreamTypes.eventbridge,
      status: LogStreamStatus.active,
      sink: {
        awsAccountId: config.env.LOG_STREAM_AWS_ACCOUNT_ID,
        awsRegion: config.env.LOG_STREAM_AWS_REGION
      }
    })

    this.awsProvider = new AwsProvider(this, this.id(name, "awsProvider"), {
      region: config.env.LOG_STREAM_AWS_REGION,
      accessKey: config.env.LOG_STREAM_AWS_ACCESS_KEY,
      secretKey: config.env.LOG_STREAM_AWS_SECRET_KEY,
    })

    this.awsEventBus = new CloudwatchEventBus(this, this.id(name, "aws-event-bus"), {
      provider: this.awsProvider,
      dependsOn: [this.logStream],
      name: this.logStream.sink.awsPartnerEventSource,
      eventSourceName: this.logStream.sink.awsPartnerEventSource
    })

    this.awsEventRule = new CloudwatchEventRule(this, this.id(name, "aws-event-rule"), {
      provider: this.awsProvider,
      dependsOn: [this.awsEventBus],
      name: this.id(name, "aws-event-rule"),
      description: "Auth0 Log Streaming",
      eventBusName: this.awsEventBus.name,
      eventPattern: this.readAsset("aws", "eventbridge-rule.json")
    })

    this.awsCloudwatchLogGroup = new CloudwatchLogGroup(this, this.id(name, "aws-cloudwatch-loggroup"), {
      provider: this.awsProvider,
      name: `/aws/events/auth0-${name}`,
    })

    this.awsEventTarget = new CloudwatchEventTarget(this, this.id(name, "aws-event-target"), {
      provider: this.awsProvider,
      dependsOn: [this.awsCloudwatchLogGroup, this.awsEventRule],
      rule: this.awsEventRule.name,
      eventBusName: this.awsEventBus.name,
      targetId: "send-logs-to-cloudwatch",
      arn: this.awsCloudwatchLogGroup.arn
    })
  }
}

export default (app: App) => {
  new Stack(app, "log-stream-aws");
}