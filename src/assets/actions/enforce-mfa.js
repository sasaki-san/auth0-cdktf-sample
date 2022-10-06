exports.onExecutePostLogin = async (event, api) => {

  console.log(event.resource_server.identifier)

  if (
    event.resource_server &&
    event.resource_server.identifier === "%IDENTIFIER%"
  ) {
    return api.multifactor.enable('any', {
      allowRememberBrowser: false
    })
  }

  if (
    event.authentication &&
    event.authentication.methods &&
    event.authentication.methods.find(m => m.name === "mfa")
  ) {
    return;
  }

  if (
    event.transaction &&
    event.transaction.acr_values &&
    event.transaction.acr_values.includes('http://schemas.openid.net/pape/policies/2007/06/multi-factor')
  ) {
    return api.multifactor.enable('any', {
      allowRememberBrowser: false
    })
  }

};