import { UserConfig } from "../../.gen/providers/auth0";

const john: UserConfig = {
  name: "John Smith",
  connectionName: "TBD",
  email: "john@gmail.com",
  emailVerified: true,
  password: "Password!"
}

export interface IUserConfig {
  john: UserConfig
}

export const userConfig: IUserConfig = {
  john
}