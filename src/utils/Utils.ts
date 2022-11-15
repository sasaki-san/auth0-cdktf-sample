import * as path from "path"

export type AssetType =
  "rules" |
  "actions" |
  "database" |
  "aws" |
  "email" |
  "new-ul" |
  "classic-ul" |
  "passwordless" | 
  "apns" | 
  "errors"

const id = (appName: string, resourceName: string) => `${appName}-${resourceName}`

const assetPath = (type: AssetType, name: string): string => {
  return path.resolve(__dirname, "..", "assets", type, name)
}

const roboHash = (text: string) => `https://robohash.org/${text}.png`

const auth0AuthApiDebuggerUrl = (domain: string) => `https://${domain.replace("auth0.com", "webtask.run")}/auth0-authentication-api-debugger`

const appleLogoUri = `https://openmoji.org/data/color/svg/F8FF.svg`

const androidLogoUri = `https://openmoji.org/data/color/svg/E047.svg`

const Utils = {
  id,
  assetPath,
  roboHash,
  auth0AuthApiDebuggerUrl,
  logUris: {
    apple: appleLogoUri,
    android: androidLogoUri
  }
}

export default Utils
