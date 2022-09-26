import { App } from "cdktf";
import Stacks from "./src/stacks"

const app = new App();
for(let createStack of Stacks) {
  createStack(app)
}
app.synth();