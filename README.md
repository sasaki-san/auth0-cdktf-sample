# auth0-cdktf-sample

A list of [CDK for Terraform](https://www.terraform.io/cdktf) sample implementions using [Auth0 Terraform Provider](https://registry.terraform.io/providers/auth0/auth0/latest/docs).

## Prerequisites
- Instsall CDK for Terraform [doc](https://learn.hashicorp.com/tutorials/terraform/cdktf-install?in=terraform/cdktf)


## Setup
- Clone the repository
- Run `npm install` to install dependencies
- Run `cdktf get` to generate typescript definitions from `auth0 provider`
- Copy `.env.sample` to `.env`, and populate the values for your tenant configurations 
  - `DOMAIN` - Your domain
  - `CLIENT_ID` - Your deployment (machine to machine) client ID
  - `CLIENT_SECRET` - Your deployment (machine to machine) client secret

## Usage
- Deploy stacks `cdktf deploy stack-name1 stack-name2 ...`
- Destroy stacks `cdktf destroy stack-name1 stack-name2 ...`

## To Create Your Own Stack
- Create a `your-stack.ts` file under `src/stacks` folder
- Define your stack
- Run `cdktf deploy` (Any stack definitions under `src/stacks/*` are dynamically loaded)

## Sample Stacks
The following are the sample stacks available from this repository.

### Machine to Machine
```shell
cdktf deploy basic-m2m
```

Deploys a stack containing the following resources
- A Machine-to-Machine client
- An API
- Client Grants

### Native 
```shell
cdktf deploy basic-native
```

- A Native client
- An API
- Client Grants
- A connection
- A user

### Regular Web Application
```shell
cdktf deploy basic-rwa
```

- A Regular Web App client
- An API
- Client Grants
- A connection
- A user

### Single Page Application
```shell
cdktf deploy basic-spa
```

- A Single Page Application client
- An API
- Client Grants
- A connection
- A user

### Actions
```shell
cdktf deploy actions
```
Deploys a stack containing the following resources
- Actions
  - `src/scripts/actions/console-log.js` as `Console Log Action 1`
  - `src/scripts/actions/console-log.js` as `Console Log Action 2`

### Rules
```shell
cdktf deploy rules
```
Deploys a stack containing the following resources
- Rules
  - `src/scripts/rules/console-log.js` as `Console Log Rule 1`
  - `src/scripts/rules/console-log.js` as `Console Log Rule 2`

### Custom Database Scripts
```shell
cdktf deploy auto-import-bcrypt-pw
```
Deploys a stack containing the following resources
- A SAP client
- An API
- A connection
- Custom database scripts 
  - `src/scripts/database/auto-import-bcrypt.login.js`
  - `src/scripts/database/auto-import-bcrypt.getUser.js`

### (WIP) SAML SP and IDP
```shell
cdktf deploy basic-saml-idp basic-saml-sp
```
`basic-saml-idp` deploys a stack containing the following resources
- A Regular Web App client with SAML support
- A datbase connection
- A user

`basic-saml-sp` deploys a stack containing the following resources
- A Regular Web App client
- A SAML connection

The SP must be dployed in a different tenant than the IDP's.
Required `.env` parameters:
- `SAML_SP_DOMAIN`
- `SAML_SP_CLIENT_ID` 
- `SAML_SP_CLIENT_SECRET`

### Native with Android configuration
```shell
cdktf deploy basic-mobile-android
```

Required `.env` parameters:
- `MOBILE_ANDROID_CALLBACK`

### Native with iOS configuration
```shell
cdktf deploy basic-mobile-ios
```

Required `.env` parameters:
- `MOBILE_IOS_CALLBACK`
- `MOBILE_IOS_LOGOUT`


### (WIP) Guardian SDK Android Application
```shell
cdktf deploy guardian-android-app
```
> Important: Currently Auth0 Terraform Provider does not support updating Guardian resources

Required `.env` parameters:
- `GUARDIAN_AWS_ACCESS_KEY_ID`
- `GUARDIAN_AWS_ACCESS_SECRET_KEY` 
- `GUARDIAN_AWS_REGION` 
- `GUARDIAN_SNS_GCM_PLATFORM_APP_ARN` (if using FCM)
- `GUARDIAN_SNS_APNS_PLATFORM_APP_ARN` (if using APNS)

### Custom Domain with Cloudflare
```shell
cdktf deploy custom-domain
```
Deploys a stack containing the following resources
- Custom Domain with Auth0 Managed Certificate
- CName Record (at Cloudflare)

Required `.env` parameters:
- `CLOUDFLARE_API_TOKEN` API Token at Cloudflare
- `CLOUDFLARE_ZONE_ID` Zone ID at Cloudflare
