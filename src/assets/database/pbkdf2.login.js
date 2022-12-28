function login(email, password, callback) {
  const request = require('request');
  const crypto = require('crypto');
  const api = `https://auth0-dummy-users.yusasaki0.app/echo/pbkdf2`;

  const pbkdf2Config = {
    salt: "wJuJqLoUFsdXa8k3sFhRlA==",
    saltEncoding: "base64",
    salt_rounds: 10000,
    key_ken: 32,
    digest: "sha1"
  };

  const dummyApiParams = `plainPassword=${password}&encoding=base64&salt=${pbkdf2Config.salt}&saltEncoding=base64&saltRounds=${pbkdf2Config.salt_rounds}&keylen=${pbkdf2Config.key_ken}&digest=${pbkdf2Config.digest}`;
  const echoParams = `email=${email}&id=id-1234`;
  const url = `${api}?${dummyApiParams}&${echoParams}`;

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err)
    if (response.statusCode === 401) return callback();
    const user = JSON.parse(body);

    let computed = crypto.pbkdf2Sync(password, Buffer.from(pbkdf2Config.salt, "base64"), pbkdf2Config.salt_rounds, pbkdf2Config.key_ken, pbkdf2Config.digest);
    computed = Buffer.from(computed).toString("base64");

    if (computed !== user.password) {
      return callback(new WrongUsernameOrPasswordError(email));
    }

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
