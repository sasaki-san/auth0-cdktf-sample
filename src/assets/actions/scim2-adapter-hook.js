exports.onExecuteCredentialsExchange = async (event, api) => {
  const client_metadata = event.client.metadata || {}
  if (client_metadata.connection) {
    api.accessToken["https://scim.adapter/connection"] = event.client.metadata.connection
  }
};