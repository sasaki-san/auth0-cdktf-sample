import { TerraformStack } from "cdktf";
import * as fs from "fs"
import * as path from "path"

export default abstract class BaseAuth0TerraformStack extends TerraformStack {

  protected id = (appName: string, resourceName: string) => `${appName}-${resourceName}`

  protected script = (dir: "rules" | "actions", src: string) => fs.readFileSync(path.resolve(__dirname, "..", "scripts", dir, src), 'utf-8')

}