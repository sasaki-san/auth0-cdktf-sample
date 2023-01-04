async function login(email, password, callback) {
  const request = require('request');
  const firebase = require("firebase-scrypt")

  const hashParams = {
    plainPassword: password,
    salt: "Ctkzla5ZrMWjMA==",
    memCost: 14,
    saltRounds: 8,
    saltSeparator: "Bw==",
    // This signer key is for a test project
    signerKey: "ewjcFY/Vguy7cC9PE8C+2waKIrYkg2C40AL3oGs7WAvffBiZVr/RqM98t7wlViX5sgQXApxKYF3KL3LiuLjo5w=="
  }
  const echoParams = {
    email,
    id: `id-1234-${email}`
  }
  const api = `https://auth0-dummy-users.yusasaki0.app/echo/scryptFirebase`;
  const joinParams = (params) => Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join("&")
  const url = `${api}?${joinParams(hashParams)}&${joinParams(echoParams)}`;

  request.get({ url }, async function (err, response, body) {
    if (err) return callback(err)
    if (response.statusCode === 401) return callback();
    const user = JSON.parse(body);

    const scrypt = new firebase.FirebaseScrypt({
      memCost: hashParams.memCost,
      rounds: hashParams.saltRounds,
      saltSeparator: hashParams.saltSeparator,
      signerKey: hashParams.signerKey
    })
    const isValid = await scrypt.verify(password, hashParams.salt, user.password);
    if (!isValid) {
      return callback(new WrongUsernameOrPasswordError(email));
    }

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
