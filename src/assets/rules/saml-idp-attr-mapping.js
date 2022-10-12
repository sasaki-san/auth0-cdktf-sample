function mapSamlIdpAttributes(user, context, callback) {

  context.samlConfiguration.mappings = {
    'http://schemas.my-cdktf-stack.me/claims/color':
      'user_metadata.favorite_color'
  };

  callback(null, user, context);
}