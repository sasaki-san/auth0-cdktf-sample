function login(email, password, callback) {
  const request = require('request');
  const crypto = require('crypto');

  const hashParams = {
    plainPassword: password,
    salt: "wJuJqLoUFsdXa8k3sFhRlA==",
    encoding: "base64",
    saltEncoding: "base64",
    saltRounds: 10000,
    keylen: 32,
    digest: "sha1"
  }
  const echoParams = {
    email,
    id: `id-1234-${email}`
  }
  const api = `https://auth0-dummy-users.yusasaki0.app/echo/pbkdf2`;
  const joinParams = (params) => Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join("&")
  const url = `${api}?${joinParams(hashParams)}&${joinParams(echoParams)}`;
  console.log(url)

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err)
    if (response.statusCode === 401) return callback();
    const user = JSON.parse(body);

    let computed = crypto.pbkdf2Sync(password, Buffer.from(hashParams.salt, hashParams.saltEncoding), hashParams.saltRounds, hashParams.keylen, hashParams.digest);
    computed = Buffer.from(computed).toString(hashParams.encoding);

    if (computed !== user.password) {
      return callback(new WrongUsernameOrPasswordError(email));
    }

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
