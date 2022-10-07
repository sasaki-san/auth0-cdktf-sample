import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import * as fs from "fs"
import * as path from "path"

export type AssetType =
  "rules" |
  "actions" |
  "database" |
  "aws" |
  "email" |
  "new-ul" |
  "classic-ul"

export default abstract class BaseAuth0TerraformStack extends TerraformStack {

  constructor(scope: Construct, name: string) {
    super(scope, name)
  }

  protected id = (appName: string, resourceName: string) => `${appName}-${resourceName}`

  protected readAsset = (type: AssetType, name: string): string => {
    const text = fs.readFileSync(path.resolve(__dirname, "..", "assets", type, name), 'utf-8')

    switch (type) {
      case "aws":
      case "email":
      case "new-ul":
      case "classic-ul":
        {
          return text
        }
      case "actions":
      case "database":
      case "rules":
        {
          return text.replace(/\$/g, "\$$$")
        }
      default:
        throw Error(`The type ${type} not defined`)
    }

  }
}