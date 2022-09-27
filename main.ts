import * as fs from "fs"
import { App } from "cdktf"

const SRC_STACK_PATH = "./src/stacks"

const stackFiles = fs.readdirSync(SRC_STACK_PATH)

const imports = stackFiles.map(f => import(`${SRC_STACK_PATH}/${f.replace(".ts", "")}`))

Promise.all(imports).then(stacks => {
  const app = new App();
  stacks.forEach(stack => stack.default(app));
  app.synth()
})
