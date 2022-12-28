function getUser(email, callback) {
  const request = require('request');
  const echoParams = {
    email,
    id: `id-1234-${email}`
  }
  const api = `https://auth0-dummy-users.yusasaki0.app/echo`;
  const joinParams = (params) => Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join("&")
  const url = `${api}?${joinParams(echoParams)}`;

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err);

    const user = JSON.parse(body);

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
