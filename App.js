import React from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TabNavigator } from 'react-navigation';
import { Header } from 'react-native-elements';

import Home from './components/Home.js';
import Discover from './components/Discover.js';
import Profile from './components/Profile.js';
import Pin from './components/Pin.js';

const RootTabs = TabNavigator({
  Home: {
    screen: Home
  },

  Discover: {
  screen: Discover
  },

  Profile: {
    screen: Profile
  },
  
  Pin: {
	screen:  Pin,
  }
}, {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: '#1EE494',
  },
});

const stitch = require("mongodb-stitch")
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
		this.state = {username: '',pass:'', id:0,isLoggedIn:false};
		
	}
	_onPressLogin() {
		db.collection('User').find({username:this.state.username,pass:this.state.pass}).then(docs=>{docs.length?(
		 Alert.alert('Success!'),
		 this.setState({isLoggedIn:true})):(Alert.alert('Incorrect username/password!'))})
	}
	_onPressRegister() {
		this.state.username==''?(Alert.alert('Username cannot be empty.')):(this.state.pass==''?(Alert.alert('Password cannot be empty.')):(
	    db.collection('User').find({username:this.state.username}).then(docs=>docs.length?(Alert.alert('This username has been registered')):(
		db.collection('User').insert({username: this.state.username,pass:this.state.pass}).catch(err => {console.error(err)	}),
		Alert.alert('Registered successfully!')))))
	}
  render() {
	  if(!this.state.isLoggedIn){
		  return(
      <View style={{ justifyContent: 'center', }}>
		  {<Header
          outerContainerStyles={{ position: 'relative', top: 0 }}
          innerContainerStyles={{ position: 'relative', top: 0 }}
          leftComponent={{ icon: 'menu', color: '#FFF' }}
          centerComponent={{ text: '', style: { fontSize: 16, color: '#FFF' } }}
          backgroundColor="#1EE494"
		  />}
		<View style={{flexDirection: 'column',alignItems: 'center', top : 10}} >
			<Text style={{fontSize :40}}>Mapful</Text>
		</View>
		<View style={{ flexDirection: 'column', top : 80}}>
				<View style={{flexDirection: 'row', top :20,left:60}}>
						<Text>Username</Text><TextInput  maxLength = {20}  style={{left: 20, width : 150, height: 30, borderColor: 'gray', borderWidth: 2}}  placeholder=" " onChangeText={(username) => this.setState({username})}/>
				</View>
				<View style={{ flexDirection: 'row', top :40,left:60}}>
						<Text>Password</Text><TextInput secureTextEntry={true} maxLength = {20}  style={{left: 20, width : 150, height: 30, borderColor: 'gray', borderWidth: 2}}  placeholder=" " onChangeText={(pass) => this.setState({pass})}/>
				</View>
		</View>
		<View style={{flexDirection: 'row',alignItems: 'center',width:250,top:140,left:100}} >
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
	  )
	  }else {
    return (
		
      <View  style={{ justifyContent: 'center', flex:1}}>
		  {<Header
          outerContainerStyles={{ position: 'relative', top: 0 }}
          innerContainerStyles={{ position: 'relative', top: 0 }}
          leftComponent={{ icon: 'menu', color: '#FFF' }}
          centerComponent={{ text: '', style: { fontSize: 16, color: '#FFF' } }}
          backgroundColor="#1EE494"
		  />}
		  <RootTabs screenProps={{user:this.state.username}} />
      </View>
  );}
  }
}