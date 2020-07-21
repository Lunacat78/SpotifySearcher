import { encode as btoa } from 'base-64';

const getTokens = async () => {
  try {
    const authorizationCode = await getAuthorizationCode() //we wrote this function above
    const credentials = await getCredentials() //we wrote this function above (could also run this outside of the functions and store the credentials in local scope)
    const credsB64 = btoa(`${credentials.clientId}:${credentials.clientSecret}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credsB64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&code=${authorizationCode}&redirect_uri=${
        credentials.redirectUri
      }`,
    });
    const responseJson = await response.json();
    // destructure the response and rename the properties to be in camelCase to satisfy my linter ;)
    const {
      access_token: accessToken,
      token_type: tokenType,
      expires_in: expiresIn,
    } = responseJson;

    const expirationTime = new Date().getTime() + expiresIn * 1000;
    await setUserData('accessToken', accessToken);
    await setUserData('tokenType', tokenType);
    await setUserData('expirationTime', expirationTime);
  } catch (err) {
    console.error(err);
  }
}