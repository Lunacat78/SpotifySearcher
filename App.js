import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import { encode as btoa } from 'base-64';
import credentials from './credentials.json';

export default class App extends Component {
  state = {
    inputValue: '',
    data:[
    ],
  };

  _handleTextChange = inputValue => {
    this.getArtistList(inputValue);
    this.setState({ inputValue });
  };
  
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          value={this.state.inputValue}
          onChangeText={this._handleTextChange}
          style={{ width: 200, height: 44, padding: 8, borderWidth: 1, borderColor: '#ccc' }}
        />
        <FlatList
          data={this.state.data}
          renderItem={({ item }) => <Item item={item}/>}
          keyExtractor={item => item.item}
          extraData={this.state}
        />
      </View>
    );
  }

  getCredentials = async () => {
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
  
  getToken = async () => {
    try {
      const credentials = await this.getCredentials()
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
  
  getArtistList = async (searchTerm) => {
    try {
      const accessToken = await this.getToken();
      const response = await fetch('https://api.spotify.com/v1/search?q=' + searchTerm + '&type=artist', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken,
        }
      }).then(response => response.json())
      .then(response => {
        this.state.data = [];
        for (var i = 0; i < 20; i++) {
          console.log(response.artists.items[i].name);
          this.state.data.push({name: response.artists.items[i].name, image: response.artists.items[i].images[0].url, followers: response.artists.items[i].popularity});
        }
      }).catch((error) => {
        console.log(error);
      });
    } catch (err) {
      console.error(err);
    }
  }
}


function Item({ item }) {
  return (
    <View style={styles.listItem}>
      <Image source={{uri:item.image}}  style={{width:60, height:60,borderRadius:30}} />
      <Text style={styles.title}>{item.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    marginTop:60
  },
  listItem:{
    margin:10,
    padding:10,
    backgroundColor:"#FFF",
    width:"80%",
    flex:1,
    alignSelf:"center",
    flexDirection:"row",
    borderRadius:5
  }
});
