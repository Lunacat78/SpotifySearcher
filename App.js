import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image } from 'react-native';
import { encode as btoa } from 'base-64';
import credentials from './credentials.json';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class App extends Component {
  
  // Our state data includes our current search bar
  // and the data retrieved from Spotify
  state = {
    inputValue: '',
    data:[
    ],
  };

  // Update our list when the search bar changes
  _handleTextChange = inputValue => {
    this.getArtistList(inputValue);
    this.setState({inputValue: inputValue});
  };
  
  render() {
    return (
      <View>
        <View style={{alignSelf:"center"}}>
          <TextInput
            value={this.state.inputValue}
            onChangeText={this._handleTextChange}
            style={{ width: 200, height: 40, padding: 2, borderWidth: 1, borderColor: '#ccc' }}
          />
        </View>
        <View style={styles.container}>
          <FlatList
            data={this.state.data}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={ () => alert(item.name + " with " + item.followers + " Followers")}>
                <View style={styles.listItem}>
                  <Image source={{uri:item.image}}  style={{width:60, height:60,borderRadius:30}} />
                  <Text style={styles.title}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.item}
            extraData={this.state}
          />
        </View>
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
  
  // Retrieve our OAuth token from Spotify with a POST request
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
  
      // We'll calculate expiration time and token type, but we only need to pass the access token
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
  
  // Retrieve our search term's data with a GET request to Spotify
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
        // Get top 20 results for our search term and add to the state data
        for (var i = 0; i < 20; i++) {
          this.state.data.push({name: response.artists.items[i].name, image: response.artists.items[i].images[0].url, followers: response.artists.items[i].followers.total});
        }
        // Force a state update to update the FlatList
        this.setState(this.state);
      }).catch((error) => {
        console.log(error);
      });
    } catch (err) {
      console.error(err);
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:10
  },
  listItem:{
    margin:10,
    padding:10,
    width:"90%",
    alignSelf:"center",
    flexDirection:"row",
    borderRadius:5
  }
});
