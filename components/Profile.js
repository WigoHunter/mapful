import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import MapView from 'react-native-maps';

const stitch = require("mongodb-stitch")
const client = new stitch.StitchClient('mapful-cffdt');
const db = client.service('mongodb', 'mongodb-atlas').db('Mapful');
var CryptoJS = require('crypto-js');
client.login().catch(err => {
  console.error(err)
});
const styles = StyleSheet.create({
    profilePicture: {
        alignSelf: 'center',
        height:100,
        width:100,
        borderRadius: 50,
        marginLeft: '5%',
    },
    profileInfo: {
        width: '70%',
        alignSelf: 'flex-end',
        height: '100%',
        marginLeft: '5%',
    },
    trafficInfo: {
        marginTop: '5%',
        flexDirection: 'row', 
        backgroundColor: '#000000',
        height: '50%',
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: '10%',
    },
    block: {
        backgroundColor: '#85929E',
        width: '25%',
        height: '80%',
    },
    pins: {
        textAlign: 'center',
        fontSize: 20,
    },
    followers: {

    },
    following: {

    },
});

var pic;
export default class Profile extends React.Component {
	static navigationOptions = {
    tabBarLabel: 'Profile'
  };
  
	constructor(props) {
		super(props);
		if(this.props.screenProps.userData.pic.version==''	){
			this.state={pic : 'http://res.cloudinary.com/comp33302017/image/upload/v1510979878/213810-200_b0flgc.png'};
		}else{
			this.state={pic :  `https://res.cloudinary.com/comp33302017/image/upload/v${this.props.screenProps.userData.pic.version}/${this.props.screenProps.userData.pic.id}`};
		}console.log(this.state.pic);
		
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
			var tem = this.props.screenProps.userData;
			tem.pic.version = res.version;
			tem.pic.id=res.public_id;
			console.log('update database')
			db.collection('User').updateOne({ 'username': this.props.screenProps.user  }, { $set: { 'profile': tem } }).then(response=>console.log(response)).then(
			()=>this.props.screenProps.callback())
			this.setState({pic :  `https://res.cloudinary.com/comp33302017/image/upload/v${res.version}/${res.public_id}`})
			
		  };
		  let formdata = new FormData();
		  formdata.append('file', uri);
		  formdata.append('timestamp', timestamp);
		  formdata.append('api_key', api_key);
		  formdata.append('signature', signature);
		  xhr.send(formdata);
	}
	async _onPressUploadImg() {
			var res=await Expo.ImagePicker.launchImageLibraryAsync({base64:true});
			if(res.cancelled==false){
						console.log('Uploading the image...')
						var url= 'data:image/jpeg;base64,'+res.base64;
						this.uploadImage(url);
			}
	}
    render() {
       return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{flex : 0.4, flexDirection: 'row', backgroundColor: '#F2F4F4'}}>
				<View style={{flexDirection:'column' ,top:10}}>
					<Image source={{uri:this.state.pic}} style={styles.profilePicture}/>
					<Text style={{color:'blue',alignSelf:'center',textDecorationLine:'underline'}} onPress={this._onPressUploadImg.bind(this)}>Update profile image</Text>
				</View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{this.props.screenProps.user}</Text>
                    <View style={styles.trafficInfo}>
                        <View style={styles.block}>
                            <Text style={styles.pins}>Pins </Text>
                        </View>
                        {/*<View style={styles.block}>
                            <Text style={styles.followers}>Followers</Text>
                        </View>
                        <View style={styles.block}>
                            <Text style={styles.following}>Following</Text>
                        </View> */}
                    </View>
                </View>
            </View>
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />
        </View>
      );
    }
}