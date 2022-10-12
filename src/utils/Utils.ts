import * as fs from "fs"
import * as path from "path"

export type AssetType =
  "rules" |
  "actions" |
  "database" |
  "aws" |
  "email" |
  "new-ul" |
  "classic-ul" |
  "passwordless"

const id = (appName: string, resourceName: string) => `${appName}-${resourceName}`

const readAsset = (type: AssetType, name: string): string => {
  const text = fs.readFileSync(path.resolve(__dirname, "..", "assets", type, name), 'utf-8')
  return text.replace(/\$/g, "\$$$")
}

const roboHash = (text: string) => `https://robohash.org/${text}.png`

const auth0AuthApiDebuggerUrl = (domain: string) => `https://${domain.replace("auth0.com", "webtask.run")}/auth0-authentication-api-debugger`

const Utils = {
  id,
  readAsset,
  roboHash,
  auth0AuthApiDebuggerUrl,
}

export default Utils
