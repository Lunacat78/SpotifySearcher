import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { encode as btoa } from 'base-64';
import credentials from './credentials.json';

export default function App() {
  getTSwizzle();
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const getCredentials = async () => {
  // credentials.json is a simple JSON file in the format of
  // {
  //   "clientId": "CLIENT_ID_HERE",
  //   "clientSecret": "CLIENT_SECRET_HERE"
  // }
  //
  // * It was omitted for privacy reasons

  const {
    clientId,
    clientSecret
  } = credentials;
  return { clientId, clientSecret };
}

const getToken = async () => {
  try {
    const credentials = await getCredentials()
    const credsB64 = btoa(`${credentials.clientId}:${credentials.clientSecret}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credsB64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const responseJson = await response.json();
    const {
      access_token,
      token_type,
      expires_in,
    } = responseJson;

    const expirationTime = new Date().getTime() + expires_in * 1000;
    return access_token;
  } catch (err) {
    console.error(err);
  }
}

const getTSwizzle = async () => {
  try {
    const accessToken = await getToken();
    const response = await fetch('https://api.spotify.com/v1/search?q=bob&type=artist', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      }
    }).then(response => response.json())
    .then(response => {
        console.log(response)
    }).catch((error) => {
      console.log(error);
    });
  } catch (err) {
    console.error(err);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
