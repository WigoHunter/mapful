import React from 'react';
import { StyleSheet, Button, View, TextInput, ScrollView, Text, Alert, Image } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import MapView from 'react-native-maps';
import TimerMixin from 'react-timer-mixin';
import db from './utils/db.js';

var CryptoJS = require('crypto-js');
export default class Pin extends React.Component {
	static navigationOptions = {
		tabBarLabel: 'Pin'
	};
	constructor(props) {
		super(props);
		this.state = {
			location: {
				latitude:0,
				longitude:0
			},
			txt:'',
			title:'',
			numImg:0,
			img:[],
			map:false,
			imgArr:[]
		};
		
		this._onPressCurrentLocation();
	}

	uploadImage(uri) {
		  let timestamp = (Date.now() / 1000 | 0).toString();
		  let api_key = '688836837148262'
		  let api_secret = '2f36uDR5j3c5AG3TgFVbG9PMpE8'
		  let cloud = 'comp33302017'
		  let hash_string = 'timestamp=' + timestamp + api_secret
		  let signature = CryptoJS.SHA1(hash_string).toString();
		  let upload_url = 'https://api.cloudinary.com/v1_1/' + cloud + '/image/upload'

		  let xhr = new XMLHttpRequest();
		  xhr.open('POST', upload_url);
		  xhr.onload = () => {
			var res=JSON.parse(xhr._response);
			console.log(xhr._response);
			var tem ={
				version:res.version,
				id:res.public_id
			}
			this.setState({imgArr:[...this.state.imgArr, tem]})
		  };
		  let formdata = new FormData();
		  formdata.append('file', uri);
		  formdata.append('timestamp', timestamp);
		  formdata.append('api_key', api_key);
		  formdata.append('signature', signature);
		  xhr.send(formdata);
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
	async _onPressUploadImg() {
			var res=await Expo.ImagePicker.launchImageLibraryAsync({base64:true});
			if(res.cancelled==false){
				this.setState({img:[...this.state.img, {path:res.uri,base64:res.base64}],numImg:(this.state.numImg+1)})
			}
	}
	 _onPressPin() {
		if(this.state.title==''){
			Alert.alert('Title/Text cannot be empty!');
			return;
		}
		if(this.state.numImg>0){
			console.log('start uploading images');
			{this.state.img.map(async (obj,i) =>{
						var url= 'data:image/jpeg;base64,'+obj.base64
						this.uploadImage(url)
			}
			)}
			console.log('uploading finished, waiting for response from the server');
		}
		var error=false;
		var tid = setInterval(function(){
			if(this.state.imgArr.length>=this.state.img.length){
				clearInterval(tid);
				console.log('start uploading data');
				db.collection('Pins').insert({
					username: this.props.screenProps.user,
					txt:this.state.txt, 
					title:this.state.title, 
					location:this.state.location,
					time:new Date(),
					comments:[],
					likes: [],
					image:this.state.imgArr}).catch(err => {console.error(err),
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
				
		}.bind(this) ,1000);
		
	}
    render() {
	  if(this.state.map==false)
      return (
        <ScrollView>
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
			<View style={{flexDirection: 'row',marginLeft:60}}>
				<Button  onPress={this._onPressUploadImg.bind(this)}	title="Upload Image"/>
			</View>
			<View style={{flexDirection: 'row',marginLeft:60,marginRight:60, flexWrap: 'wrap', alignItems: 'flex-start'}}>
				{this.state.img.map((obj,i) =>
					<View key={i}style={{flexDirection:'column'}}>
					<Image key={i+1000} source={{uri:obj.path}} style={{
																								height:100,
																								width:100,
																																}}/>
					<Text key={i-2000} style={{color:'blue',alignSelf:'center',textDecorationLine:'underline'}} onPress={()=>{
					  var array = this.state.img;
					  array.splice(i, 1);
					  this.setState({img: array,numImg:this.state.numImg-1});
					  }}
						>Delete</Text>
					</View>
				  )}
			</View>
			<View style={{flexDirection: 'row',marginTop:10}}>
				<Text>Title: </Text>
				<TextInput   style={{left: 20, width : 280, height: 30, borderColor: 'gray', borderWidth: 2}}  placeholder="" onChangeText={(title) => this.setState({title})}/>
			</View>
			<View style={{flexDirection: 'row',marginTop:10}}>
				<Text>Text: </Text>
	<TextInput textAlignVertical='top' multiline={true} style={{left: 20, width : 280, height: 150, borderColor: 'gray', borderWidth: 2}}  placeholder="What are you thinking now?" onChangeText={(txt) => this.setState({txt})}/>
			</View>
			<View style={{marginLeft:120,marginTop:30,width: 100, height: 80}} >
				<Button style={{ top :150,left:100,width:10}} onPress={this._onPressPin.bind(this)}	title="Pin"/>
			</View>
        </ScrollView>
      );
	  return (
	 
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: this.state.location.latitude,
                    longitude: this.state.location.longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5,
                }}
				onPress = {(e) => 
					this.setState({location:e.nativeEvent.coordinate})
					}
            >
				<MapView.Marker
				  coordinate={{
					latitude: this.state.location.latitude,
					longitude: this.state.location.longitude
				  }}
				/>
			</MapView>
			<View style={{ 
			  position: 'absolute',
			  zIndex: 100,
			  top: 10,
			  left: 10
			}}>
				<Button style={{width:10}} onPress= {()=>this.setState({map:false})}	title="Back"/>
			</View>
			<View style={{ 
				
			  position: 'absolute',
			  zIndex: 100,
			  top: 60,
			  alignSelf: 'center'
			}}>
				<Text style = {{color:'green'}}>Choose a place on the map</Text>
			</View>
			<View style={{
			  position: 'absolute',
			  zIndex: 100,
			  bottom: 50,
			  alignSelf: 'center'
			}}>
				<Text style={{borderColor: '#FFFFFF',
							  borderWidth: 1,
							  borderRadius: 110,
							  backgroundColor: '#FFFFFF'}}>
					latitude:{this.state.location.latitude.toFixed(3)} longitude:{this.state.location.longitude.toFixed(3)}</Text>
			</View>
        </View>
	  )
    }
}