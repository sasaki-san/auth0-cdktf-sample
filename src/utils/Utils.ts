import * as fs from "fs"
import * as path from "path"
import { GrantTypes } from "./Types"

export type AssetType =
  "rules" |
  "actions" |
  "database" |
  "aws" |
  "email" |
  "new-ul" |
  "classic-ul" |
  "passwordless"

const withMfaGrantType = () => {
  return [
    GrantTypes.mfa_oob,
    GrantTypes.mfa_otp,
    GrantTypes.mfa_recovery_code,
  ]
}

const id = (appName: string, resourceName: string) => `${appName}-${resourceName}`

const readAsset = (type: AssetType, name: string): string => {
  const text = fs.readFileSync(path.resolve(__dirname, "..", "assets", type, name), 'utf-8')
  return text.replace(/\$/g, "\$$$")
}

const Utils = {
  mfaGrantTypes: withMfaGrantType,
  id,
  readAsset
}

export default Utils
