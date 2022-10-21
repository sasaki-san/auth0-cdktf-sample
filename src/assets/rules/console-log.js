function rule(user, context, callback) {
  console.log(`User: ${user.user_id} hit the rule`)
  return callback(null, user, context);
}