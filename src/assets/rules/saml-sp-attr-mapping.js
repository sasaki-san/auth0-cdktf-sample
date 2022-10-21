function mapSamlSpAttributes(user, context, callback) {

  user.user_metadata = user.user_metadata || {};
  user.user_metadata.favorite_color = user.saml_profile_data_color;

  // persist the user_metadata update
  auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
    .then(function () {
      callback(null, user, context);
    })
    .catch(function (err) {
      callback(err);
    });
}