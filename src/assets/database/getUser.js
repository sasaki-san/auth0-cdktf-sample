function getUser(email, callback) {
  const request = require('request');
  const url = `https://auth0-dummy-users.yusasaki0.app/echo?email=${email}&id=id-1234`;

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err);

    const user = JSON.parse(body);

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
