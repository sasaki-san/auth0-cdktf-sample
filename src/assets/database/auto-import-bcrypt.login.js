function login(email, password, callback) {
  const request = require('request');
  const bcrypt = require('bcrypt');
  const url = `https://dummy-json.vercel.app/users-by-email/${email}?select=id,email,password_bcrypt_utf8`;

  request.get({ url }, function (err, response, body) {
    if (err) return callback(err);
    if (response.statusCode === 401) return callback();
    const user = JSON.parse(body);

    const encryptedPassword = user.password_bcrypt_utf8;
    if (!bcrypt.compareSync(password, encryptedPassword)) {
      return callback(new WrongUsernameOrPasswordError(email));
    }

    callback(null, {
      user_id: user.id.toString(),
      email: user.email
    });
  });
}
