function login(email, password, callback) {
  const request = require('request');
  const bcrypt = require('bcrypt');

  const hashParams = {
    plainPassword: password,
  }
  const echoParams = {
    email,
    id: `id-1234-${email}`
  }
  const api = `https://auth0-dummy-users.yusasaki0.app/echo/bcrypt`;
  const joinParams = (params) => Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join("&")
  const url = `${api}?${joinParams(hashParams)}&${joinParams(echoParams)}`;

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err)
    if (response.statusCode === 401) return callback();
    const user = JSON.parse(body);

    if (!bcrypt.compareSync(password, user.password)) {
      return callback(new WrongUsernameOrPasswordError(email));
    }

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
