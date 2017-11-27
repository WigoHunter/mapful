import React from 'react';
import { StyleSheet, Button, View, TouchableOpacity, TextInput, ScrollView, Text, Alert, Image } from 'react-native';
import { Header } from 'react-native-elements';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import TimerMixin from 'react-timer-mixin';
import db from './utils/db.js';
import NowLoading from './NowLoading.js'

var CryptoJS = require('crypto-js');
const styles = StyleSheet.create({
	addbox: {
		position: 'absolute',
		left: 0,
		top: 0,
		margin: '5%',
		width: '20%',
		height: '10%',
		backgroundColor: '#F2F3F4',
    	justifyContent: 'center',
    	alignItems: 'center',
	},
	mylocation: {
		position: 'absolute',
		left: 0,
		top: '25%',
		margin: '5%',
		width: '20%',
		height: '10%',
		backgroundColor: '#F2F3F4',
    	justifyContent: 'center',
    	alignItems: 'center',
	},
	pinlocation: {
		position: 'absolute',
		left: 0,
		top: '42.7%',
		margin: '5%',
		width: '20%',
		height: '10%',
		backgroundColor: '#F2F3F4',
    	justifyContent: 'center',
    	alignItems: 'center',
	},
	delete: {
		position: 'absolute',
		top:0,
		right: '4%',
		width: '20%',
		height: '100%',
		marginRight: '5%',
		backgroundColor: '#F2F3F4',
    	justifyContent: 'center',
    	alignItems: 'center',
	},
	sharepin: {
		position: 'absolute',
		right: 0,
		top: '42.7%',
		margin: '5%',
		width: 205,
		height: '12.35%',
		backgroundColor: '#F2F3F4',
    	justifyContent: 'center',
    	alignItems: 'center',
	},
	newpost: {
		marginLeft: '5%',
		marginTop: '5%',
		fontSize: 25,
		fontWeight: 'bold',
	},
	title: {
		position: 'absolute',
		right: 0,
		top: 0,
		margin: '5%',
		paddingLeft: 10,
		width : 205, 
		height: 24, 
		borderColor: '#E5E7E9', 
		borderWidth: 1,
	},
	caption: {
		position: 'absolute',
		right: 0,
		margin: '5%',
		marginTop: '30%',
		paddingLeft: 10,
		width : 205, 
		height: 79,
		borderColor: '#E5E7E9', 
		borderWidth: 1,
	},
	picture: {
		position: 'absolute',
		left: 0,
		bottom: '3%',
		margin: '5%',
		width : '100%', 
		height: 160,
	}
});

const Marker = () => (
    <View
      style={{
        width: 24,
        height: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 0,
        backgroundColor: 'red',
        transform: [{ rotate: '45deg'}],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#FFFFFF'
        }}
      >
      </View>
    </View>
  );
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
			imgArr:[],
			loading : false
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
		this.setState({loading:true});
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
				console.log(this.state.imgArr);
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
			this.setState({imgArr:[],numImg:0,img:[],txt:'',title:'',loading:false});
			Alert.alert('Pin is shared!');
			}
				
		}.bind(this) ,1000);
		
	}
    render() {
    const { loading } = this.state;
	  if(this.state.map==false)
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
			{loading && <NowLoading/>}
				<Text style={styles.newpost}>
	        		Share new pin
	        	</Text>
				<View style={{ flex: 1, flexDirection: 'row'}}>
	        		<TouchableOpacity style={styles.addbox} onPress={this._onPressUploadImg.bind(this)}>
	        			<Icon name="plus" color="black" size={40}/>
	        		</TouchableOpacity>
	        		<TextInput style={styles.title}  placeholder="Write a title..." onChangeText={(title) => this.setState({title})} value = {this.state.title}/>
        		</View>
        		<TextInput textAlignVertical='top' multiline={true} style={styles.caption}  placeholder="Write a caption..." onChangeText={(txt) => this.setState({txt})} value = {this.state.txt}/>
	        	<TouchableOpacity style={styles.mylocation} onPress={this._onPressCurrentLocation.bind(this)}>
		        		<Icon2 name="my-location" color="black" size={40}/>
	        	</TouchableOpacity>
	        	<TouchableOpacity style={styles.pinlocation} onPress={this._onPressLocationOnMap.bind(this)}>
	        		<Icon2 name="location-on" color="red" size={40}/>
	        	</TouchableOpacity>
	        	<TouchableOpacity style={styles.sharepin} onPress={this._onPressPin.bind(this)}>
					<Text style={{fontWeight:'bold', color:'#1EE494'}}>Share</Text>
	        	</TouchableOpacity>
				<View style={styles.picture}>
					{this.state.img.map((obj,i) =>
						<View key={i}>
						<Image key={i+1000} source={{uri:obj.path}} style={{height:160,width:216,}}/>
						<TouchableOpacity key={i-2000} style={styles.delete} onPress={()=>{
						  var array = this.state.img;
						  array.splice(i, 1);
						  this.setState({img: array,numImg:this.state.numImg-1});
						  }}>
						  <Icon name="remove" color="black" size={40}/>
						</TouchableOpacity>
						</View>
					  )}
				</View>
		</View>
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
				>
				  <Marker />
				</MapView.Marker>
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