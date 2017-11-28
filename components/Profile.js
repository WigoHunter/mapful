import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { Header } from 'react-native-elements';
import MapView from 'react-native-maps';
import db from './utils/db.js';
import MapMarkerClustering  from './MapMarkerClustering';
import { Callout } from './Discover';

var CryptoJS = require('crypto-js');

const styles = StyleSheet.create({
    profilePicture: {
        alignSelf: 'center',
        height: 90,
        width: 90,
        borderRadius: 45,
        marginLeft: '10%',
    },
    profileInfo: {
        width: '70%',
        alignSelf: 'flex-end',
        height: '100%',
        marginLeft: '5%',
    },
    settings: {
        position: 'absolute',
        top: '3%',
        right: '2%',
        width: '20%',
        height: '20%',
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: 28,
        marginTop: '5%',
        width: '75%',
    },
    trafficInfo: {
        marginTop: '5%',
        marginLeft: '-8%',
        flexDirection: 'row', 
        height: '65%',
    },
    block: {
        width: '28%',
        marginLeft: '-2%',
    },
    pins: {
        textAlign: 'center',
        fontSize: 10,
        color: 'grey',
    },
    follows: {
        textAlign: 'center',
        fontSize: 10,
        color: 'grey',
    },
    categoryAmount: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '300',
    },
    bio: {
        position: 'absolute',
        bottom: 0,
        left: '8%',
        height: '52%',
        width: '80%',
    },
    callout: {
        width: '100%',
        height: 270,
        zIndex: 100000
    },
});

var pic;
export default class Profile extends React.Component {
	static navigationOptions = {
        tabBarLabel: 'Profile'
    };
  
	constructor(props) {
        super(props);
        console.log(this.props.screenProps)
        this.state = {
            pic: this.props.screenProps.userData.pic.version == ''
                ? 'http://res.cloudinary.com/comp33302017/image/upload/v1510979878/213810-200_b0flgc.png'
                : `https://res.cloudinary.com/comp33302017/image/upload/v${this.props.screenProps.userData.pic.version}/${this.props.screenProps.userData.pic.id}`,
            pins: []
        }

        this.uploadImage = this.uploadImage.bind(this);
        this.updatePins = this.updatePins.bind(this);
        this.likePin = this.likePin.bind(this);
    }

    componentWillMount() {
        this.updatePins();
    }

    updatePins() {
        db.collection('Pins')
            .find({ username: this.props.screenProps.user })
            .then(pins => {
                this.setState({ pins })
            });
    }

    likePin(id) {
        db.collection('Pins')
          .find({ _id: id })
          .then(docs => {
            docs[0].likes.includes(this.props.screenProps.user)
              ? 
                db.collection('Pins')
                  .updateOne(
                    { _id: id },
                    { $pull: { 'likes': this.props.screenProps.user } }
                  )
                  .then(() => this.updatePins())
              :
                db.collection('Pins')
                  .updateOne(
                    { _id: id },
                    { $addToSet: { 'likes': this.props.screenProps.user } }
                  )
                  .then(() => this.updatePins())
          });
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
    
    _onPressFollow(){
        /*
		db.collection('User')
      .find({ username: this.props.screenProps.user })
      .then(docs => {
        docs[0].profile.followers.includes(this.props.screenProps.guest)
          ? (
			  db.collection('User')
              .updateOne(
                { username: this.props.screenProps.guest },
                { $pull: { 'follow': this.props.screenProps.user } }
              ).then(()=>
			  db.collection('User')
              .updateOne(
                { username: this.props.screenProps.user },
                { $set: { 'followers': this.props.screenProps.guest } }
              )).then(() => this.props.screenProps.update())).then(()=>console.log('unfollowed'))
          :(db.collection('User')
      .find({ username: this.props.screenProps.guest }).then(docss=>
			docs[0].profile.followers.push(this.props.screenProps.guest),
			docss[0].profile.follow.push(this.props.screenProps.user),
		    db.collection('User')
              .updateOne(
                { username: this.props.screenProps.guest },
                { $set: { 'profile': docss[0],profile } },
				()=>console.log('error')
              ).then(()=>
            db.collection('User')
              .updateOne(
                { username: this.props.screenProps.user },
                { $set: { 'profile': docs[0].profile } },
				()=>console.log('error')
              ))).then((ret) =>{console.log(ret);
			  this.props.screenProps.update()})).then(()=>console.log('followed\n'))
      });
      */
    }
    
    render() {
        const { pic, pins } = this.state;

        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
				{this.props.screenProps.guest!="" && <View style={{ 
				  position: 'absolute',
				  zIndex: 100,
				  top: 0,
				  left: 0
				}}>
                <TouchableOpacity>
                    <Icon2 name="arrow-back" color="black" size={30} onPress= {()=>this.props.screenProps.callback()}/>
                </TouchableOpacity>				
                </View>}
                <View style={{flex : 0.4, flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flexDirection:'column', alignItems: 'center'}}>
                        <Image
                            source={{uri: pic}}
                            style={styles.profilePicture}
                        />
                        {this.props.screenProps.guest=='' && <Text style={{color:'grey', alignSelf:'center', marginTop:'8%'}} onPress={this._onPressUploadImg.bind(this)}> Change image</Text>}
						{/* this.props.screenProps.guest!='' && <Text style={{color:'grey', alignSelf:'center', marginTop:'8%'}} onPress={this._onPressFollow.bind(this)}>follow{this.props.screenProps.userData.followers.includes(this.props.screenProps.guest)?'ed':''}</Text> */}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{this.props.screenProps.user}</Text>
                        <View style={styles.trafficInfo}>
                            <View style={styles.block}>
                                <Text style={styles.categoryAmount}>{pins.length}</Text>
                                <Text style={styles.pins}>Pins</Text>
                            </View>
                            <View style={styles.block}>
                                <Text style={styles.categoryAmount}>{this.props.screenProps.userData.followers.length}</Text>
                                <Text style={styles.follows}>Followers</Text>
                            </View>
                            <View style={styles.block}>
                                <Text style={styles.categoryAmount}>{this.props.screenProps.userData.follow.length}</Text>
                                <Text style={styles.follows}>Following</Text>
                            </View>
                            <View style={styles.bio}>
                                <Text>{this.props.screenProps.userData.intro}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{
                        position: 'absolute',
                        zIndex: 100,
                        top: 20,
                        right: 20,
                    }}>
                        <Text
                            onPress={() => this.updatePins()}
                            style={{
                            paddingTop: 5,
                            paddingBottom: 5,
                            paddingRight: 8,
                            paddingLeft: 8,
                            borderRadius: 6,
                            backgroundColor: '#1EE494',
                            color: '#FFF'
                            }}
                        >
                            Update
                        </Text>
                    </View>
                    <MapMarkerClustering
                        style={{ flex: 1 }}
                        zoomOut
                    >
                        {pins.map(pin =>
                            <MapView.Marker
                                key={pin._id}
                                coordinate={{
                                    latitude: pin.location.latitude,
                                    longitude: pin.location.longitude
                                }}
                            >
                                <MapView.Callout style={{ zIndex: 100000 }}>
                                    <ScrollView style={styles.callout}>
                                        <Callout pin={pin} updatePins={this.updatePins} likePin={this.likePin} user={this.props.screenProps.user} userData={this.props.screenProps.userData} />
                                    </ScrollView>
                                </MapView.Callout>
                            </MapView.Marker>
                        )}
                    </MapMarkerClustering>
                </View>
            </View>
      );
    }
}