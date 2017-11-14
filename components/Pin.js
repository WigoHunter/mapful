import React from 'react';
import { StyleSheet, Button, View, TextInput,Text,Alert } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import MapView from 'react-native-maps';

const stitch = require("mongodb-stitch")
const client = new stitch.StitchClient('mapful-cffdt');
const db = client.service('mongodb', 'mongodb-atlas').db('Mapful');
client.login().then(() =>
  console.log("[MongoDB Stitch] Connected to Stitch")
).catch(err => {
  console.error(err)
});
  
export default class Pin extends React.Component {
	static navigationOptions = {
    tabBarLabel: 'Pin'
  };
	constructor(props) {
		super(props);
		this.state = {location: {
												latitude:0,
												longitude:0
												},
									txt:'',title:'',map:false};
		
	}
	_onPressCurrentLocation() {
		const Options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
		};
		navigator.geolocation.getCurrentPosition(function success(pos) {
			var crd = pos.coords;
			console.log('Your current position is:');
			console.log(`Latitude : ${crd.latitude}`);
			console.log(`Longitude: ${crd.longitude}`);
			console.log(`More or less ${crd.accuracy} meters.`);
			this.setState({location:pos.coords})
			}.bind(this), function error(err) {
			console.warn(`ERROR(${err.code}): ${err.message}`);
			Alert.alert('Cannot get your location information!')
			}, Options);
	}
	_onPressLocationOnMap() {
	this.setState({map:true});
	}
	_onPressPin() {
		if(this.state.title==''){
			Alert.alert('Title/Text cannot be empty!');
			return;
		}
		var error=false;
		db.collection('Pins').insert({username: this.props.screenProps.user, txt:this.state.txt, title:this.state.title, location:this.state.location,time:new Date()}).catch(err => {console.error(err),
			error=true;
			})
		if(error){
			Alert.alert('error!');
			return;
		}
		Alert.alert('place the pin successfully!');
		{/*debug:print all the pins on the database*/}
		db.collection('Pins').find({}).then(docs=>{console.log(docs)})
	}
	_onPressMap(e) {
		this.setState({map:false});
	}
    render() {
	  if(this.state.map==false)
      return (
        <View>
			<View style={{flexDirection: 'row'}}>
				<Text>Location: </Text>
				<Button style={{width : 40,height:40}} onPress={this._onPressCurrentLocation.bind(this)}	title="Use my current location"/>
			</View>
			<View style={{marginLeft:60,width: 240, height: 50}} >
				<Button  onPress={this._onPressLocationOnMap.bind(this)}	title="Choose a place on the map"/>
				</View>
			<View style={{flexDirection: 'row',marginLeft:60}}>
				<Text>latitude:{this.state.location.latitude} </Text>
			</View>
			<View style={{flexDirection: 'row',marginLeft:60}}>
				<Text>longitude:{this.state.location.longitude}  </Text>
			</View>
			<View style={{flexDirection: 'row',marginTop:10}}>
				<Text>Title: </Text>
				<TextInput   style={{left: 20, width : 280, height: 30, borderColor: 'gray', borderWidth: 2}}  placeholder="" onChangeText={(title) => this.setState({title})}/>
			</View>
			<View style={{flexDirection: 'row',marginTop:10}}>
				<Text>Text: </Text>
	<TextInput textAlignVertical='top' multiline={true} style={{left: 20, width : 280, height: 200, borderColor: 'gray', borderWidth: 2}}  placeholder="What are you thinking now?" onChangeText={(txt) => this.setState({txt})}/>
			</View>
			<View style={{marginLeft:120,marginTop:30,width: 100, height: 80}} >
				<Button style={{ top :150,left:100,width:10}} onPress={this._onPressPin.bind(this)}	title="Pin"/>
			</View>
        </View>
      );
	  return (
	 
        <View style={{ flex: 1, flexDirection: 'column' }}>
			<View style={{ flexDirection: 'row' }}>
				<Button style={{ top :150,left:100,width:10}} onPress= {()=>this.setState({map:false})}	title="Back"/>
				<Text>Choose a place on the map</Text>
			</View>
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
				onPress = {(e) => 
					this.setState({map:false,location:e.nativeEvent.coordinate})
					}
            />
        </View>
	  )
    }
}