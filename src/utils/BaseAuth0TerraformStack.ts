import { Fn, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import * as fs from "fs"
import * as path from "path"

export type ScriptTypes = "rules" | "actions" | "database" | "aws"

export default abstract class BaseAuth0TerraformStack extends TerraformStack {

  constructor(scope: Construct, name: string) {
    super(scope, name)


  }

  validateParameters = () => {

  }

  protected id = (appName: string, resourceName: string) => `${appName}-${resourceName}`

  protected text = (dir: ScriptTypes, src: string): string => {
    return fs.readFileSync(path.resolve(__dirname, "..", "scripts", dir, src), 'utf-8')
  }

  protected script = (dir: ScriptTypes, src: string): string => {
    const rawScript = this.text(dir, src)
    // Apply encoding util to escape Terraform's reserved character set
    return Fn.jsondecode(Fn.jsonencode(rawScript))
  }

}