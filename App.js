import React from 'react';
import { StyleSheet, Alert, Button, Text, TextInput, View, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { TabNavigator } from 'react-navigation';
import { Header } from 'react-native-elements';

import Home from './components/Home.js';
import Discover from './components/Discover.js';
import Profile from './components/Profile.js';
import Pin from './components/Pin.js';

import keys from './keys.json';

const RootTabs = TabNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      title: 'Home',
      tabBarIcon: <Icon name="home" color="black" />
    }
  },

  Discover: {
    screen: Discover,
    navigationOptions: {
      title: 'Discover',
      tabBarIcon: <Icon name="star" color="black" />
    }
  },

  Profile: {
    screen: Profile,
    navigationOptions: {
      title: 'Profile',
      tabBarIcon: <Icon name="face" color="black" />
    }
  },
  
  Pin: {
    screen:  Pin,
    navigationOptions: {
      title: 'Pin',
      tabBarIcon: <Icon name="my-location" color="black" />
    }
  }
}, {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: '#1EE494',
  },
});

const stitch = require("mongodb-stitch");
const client = new stitch.StitchClient('mapful-cffdt');
const db = client.service('mongodb', 'mongodb-atlas').db('Mapful');
client.login().then(() =>
  console.log("[MongoDB Stitch] Connected to Stitch")
).catch(err => {
  console.error(err)
});
  
export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      username: '',
      pass: '',
      id: 0,
      isLoggedIn: false
    };
  }
  update() {
	  console.log('receivecallback');
    db.collection('User')
      .find({ username: this.state.username, pass: this.state.pass })
      .then(docs => {(this.setState({userData:docs[0].profile}))})
  }
	_onPressLogin() {
    db.collection('User')
      .find({ username: this.state.username, pass: this.state.pass })
      .then(docs => { docs.length
        ? (this.setState({isLoggedIn:true,userData:docs[0].profile}))
        : (Alert.alert('Incorrect username/password!'))
      })
  }
  
	_onPressRegister() {
    this.state.username == ''
      ? (Alert.alert('Username cannot be empty.'))
      : (this.state.pass == ''
          ? (Alert.alert('Password cannot be empty.'))
          : (
            db.collection('User')
              .find({ username:this.state.username })
              .then(docs => docs.length
                ? (Alert.alert('This username has been registered'))
                :(
                  db.collection('User')
                    .insert({
                      username: this.state.username,
                      pass: this.state.pass,
                      profile: {
                        pic: {version:'',id:''},
                        intro: '',
                        follow: [],
                        followers: [],
                      }
                    })
                    .then(_ => {
                     this._onPressLogin(); 
                    })
                    .catch(err => { console.error(err); })
                )
              )
            )
          )
  }
  
  render() {
    const { isLoggedIn } = this.state;

	  if(!this.state.isLoggedIn){
		  return (
        <View style={{ backgroundColor: '#1EE494', flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('./img/mapful.png')}
              style={{
                width: 100,
                height: 100,
                marginBottom: 20
              }}
            />
            <Text style={{fontSize: 32, marginBottom: 25, color: '#FFF'}}>Mapful</Text>
            <View style={{ flexDirection: 'row', margin: 10, alignItems: 'center' }}>
                <Text>Username</Text><TextInput maxLength={20}  autoCorrect={false} style={styles.input}  placeholder="username" onChangeText={(username) => this.setState({username})} onSubmitEditing={(event)=>{this.refs.pass.focus()}}/>
            </View>
            <View style={{ flexDirection: 'row', margin: 10, alignItems: 'center' }}>
                <Text>Password</Text><TextInput ref='pass' secureTextEntry={true} maxLength = {20}  style={styles.input}  placeholder="password" onChangeText={(pass) => this.setState({pass})}/>
            </View>

            <View style={{flexDirection: 'row',alignItems: 'center', justifyContent: 'center', marginTop: 30 }} >
              <Button style={{ top :150,left:40,width:10}}
                onPress={ this._onPressLogin.bind(this)}
                title="Login"
              />
              <Button style={{ top :150,left:100,width:10}}
                onPress={this._onPressRegister.bind(this)}
                title="Register"
              />
            </View>
          </View>
        </View>
    )
    } else {
      return (
        <View  style={{ justifyContent: 'center', flex:1}}>
          <Header
              outerContainerStyles={{ position: 'relative', top: 0 }}
              innerContainerStyles={{ position: 'relative', top: 0 }}
              leftComponent={{ icon: 'menu', color: '#FFF' }}
              centerComponent={{ text: '', style: { fontSize: 16, color: '#FFF' } }}
              backgroundColor="#1EE494"
          />
          <RootTabs screenProps={{user: this.state.username,userData:this.state.userData,callback:this.update.bind(this)}} />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 100,
    marginLeft: 20,
    width: 150,
    height: 32,
    borderColor: '#FFF',
    borderWidth: 1,
    paddingLeft: 10
  }
})