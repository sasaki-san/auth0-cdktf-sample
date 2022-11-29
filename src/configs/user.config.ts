import { UserConfig } from "../../.gen/providers/auth0/user";
import { Utils } from "../utils";

const john: UserConfig = {
  name: "John Smith",
  connectionName: "TBD",
  email: "john@gmail.com",
  emailVerified: true,
  password: "Password!",
  picture: Utils.roboHash("john")
}

const buzz: UserConfig = {
  name: "Buzz Lightyear",
  connectionName: "TBD",
  email: "buzz.lightyear@toystory.com",
  emailVerified: true,
  picture: Utils.roboHash("buzzlightyear")
}

const bo: UserConfig = {
  name: "Bo Peep",
  connectionName: "TBD",
  phoneVerified: true,
  phoneNumber: "TBD",
  picture: Utils.roboHash("bopeep")
}

export interface IUserConfig {
  john: UserConfig
  passwordless: {
    buzz: UserConfig
    bo: UserConfig
  }
}

export const userConfig: IUserConfig = {
  john,
  passwordless: {
    buzz,
    bo
  }
}