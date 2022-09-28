function (user, context, callback) {
  console.log(user);
  console.log(context);
  return callback(null, user, context);
}