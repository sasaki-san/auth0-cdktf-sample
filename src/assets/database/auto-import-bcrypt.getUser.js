function getUser(email, callback) {
  const request = require('request');
  const url = `https://dummy-json.vercel.app/users-by-email/${email}?select=id,email`;

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err);

    const user = JSON.parse(body);

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
