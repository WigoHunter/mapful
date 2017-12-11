import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import { Header } from 'react-native-elements';
import MapView from 'react-native-maps';
import db from './utils/db.js';
import MapMarkerClustering  from './MapMarkerClustering';
import { Callout } from './Discover';
import EditPin from './EditPin';
import UserList from './UserList';
import Prompt from 'react-native-prompt';

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

        this.state = {
            pic: this.props.screenProps.userData.pic.version == ''
                ? 'http://res.cloudinary.com/comp33302017/image/upload/v1510979878/213810-200_b0flgc.png'
                : `https://res.cloudinary.com/comp33302017/image/upload/v${this.props.screenProps.userData.pic.version}/${this.props.screenProps.userData.pic.id}`,
            pins: [],
		    goToProfile: '',
			edit:null,
			showFollower:false,
			showFollowing:false,
			promptVisible:false
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
            docs[0].likes.includes(this.props.screenProps.guest)
              ? 
                db.collection('Pins')
                  .updateOne(
                    { _id: id },
                    { $pull: { 'likes': this.props.screenProps.guest } }
                  )
                  .then(() => this.updatePins())
              :
                db.collection('Pins')
                  .updateOne(
                    { _id: id },
                    { $addToSet: { 'likes': this.props.screenProps.guest } }
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
			var tem = this.props.screenProps.userData;
			tem.pic.version = res.version;
			tem.pic.id=res.public_id;
            db.collection('User')
                .updateOne({ 'username': this.props.screenProps.user  }, { $set: { 'profile': tem } })
                .then(() => this.props.screenProps.callback())
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
            var url= 'data:image/jpeg;base64,'+res.base64;
            this.uploadImage(url);
        }
    }
    
    _onPressFollow(){
		db.collection('User')
            .find({ username: this.props.screenProps.user })
            .then(docs => {
		        db.collection('User')
                    .find({ username: this.props.screenProps.guest }).then(docss=>{
                        docs[0].profile.followers.includes(this.props.screenProps.guest)
                        ? (
                            docs[0].profile.followers.splice(docs[0].profile.followers.indexOf(this.props.screenProps.guest),1),
                            docss[0].profile.follow.splice(docss[0].profile.follow.indexOf(this.props.screenProps.user),1),
                            db.collection('User')
                            .updateOne(
                                { username: this.props.screenProps.guest },
                                { $set: { 'profile': docss[0].profile } },
                                ()=>console.log('error')
                            )
                            .then(()=>
                                db.collection('User')
                                    .updateOne(
                                        { username: this.props.screenProps.user },
                                        { $set: { 'profile': docs[0].profile } },
                                        ()=>console.log('error')
                                    ))
                            .then((ret) => {
                                this.props.screenProps.callback()})	
                        ) : (
                            docs[0].profile.followers.push(this.props.screenProps.guest),
                            docss[0].profile.follow.push(this.props.screenProps.user),
                            db.collection('User')
                            .updateOne(
                                { username: this.props.screenProps.guest },
                                { $set: { 'profile': docss[0].profile } },
                                ()=>console.log('error')
                            )
                            .then(()=>
                                db.collection('User')
                                    .updateOne(
                                        { username: this.props.screenProps.user },
                                        { $set: { 'profile': docs[0].profile } },
                                        ()=>console.log('error')
                                    )
                                )
                            .then((ret) => {
                                this.props.screenProps.callback()
                                })
                        )
                    }
                )
            }
        );
    }

    render() {
        const { pic, pins } = this.state;

        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
				<Prompt
					title="Write down something about you"
					placeholder=""
					defaultValue={this.props.screenProps.userData.intro}
					visible={ this.state.promptVisible }
					onCancel={() => this.setState({ promptVisible: false })}
					onSubmit={(value) =>{
					    this.setState({promptVisible: false})
					    var tem = this.props.screenProps.userData
					    if(tem.intro==value) return;
					    tem.intro=value
                        db.collection('User')
                        .updateOne(
                            { username: this.props.screenProps.user },
                            { $set: { 'profile': tem } },
                            ()=>console.log('error')
                        ).then((ret) => {
                            this.props.screenProps.callback()
                        })
                    }
	            }/>
				{this.props.screenProps.back != null &&
                    <View style={{ 
                        position: 'absolute',
                        zIndex: 100,
                        top: 0,
                        left: 0
                    }}>
                        <TouchableOpacity>
                            <Icon2 name="arrow-back" color="black" size={30} onPress= {()=>this.props.screenProps.back()}/>
                        </TouchableOpacity>				
                    </View>
                }
                <View style={{flex : 0.4, flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flexDirection:'column', alignItems: 'center'}}>
                        <Image
                            source={{uri: pic}}
                            style={styles.profilePicture}
                        />
                        {this.props.screenProps.guest==this.props.screenProps.user&& <Text style={{color:'grey', alignSelf:'center', marginTop:'8%'}} onPress={this._onPressUploadImg.bind(this)}> Change image</Text>}
						{this.props.screenProps.guest!=this.props.screenProps.user && <Text style={{color:'grey', alignSelf:'center', marginTop:'8%'}} onPress={this._onPressFollow.bind(this)}>follow{this.props.screenProps.userData.followers.includes(this.props.screenProps.guest)?'ed':''}</Text> }
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{this.props.screenProps.user}</Text>
                        <View style={styles.trafficInfo}>
                            <View style={styles.block}>
                                <Text style={styles.categoryAmount}>{pins.length}</Text>
                                <Text style={styles.pins}>Pins</Text>
                            </View>
                            <View style={styles.block}>
                                <Text style={styles.categoryAmount} onPress={()=>this.setState({showFollower:true})}>{this.props.screenProps.userData.followers.length}</Text>
                                <Text style={styles.follows}>Followers</Text>
                            </View>
                            <View style={styles.block}>
                                <Text style={styles.categoryAmount} onPress={()=>this.setState({showFollowing:true})}>{this.props.screenProps.userData.follow.length}</Text>
                                <Text style={styles.follows}>Following</Text>
                            </View>
                            <View style={styles.bio}>
								{this.props.screenProps.guest!=this.props.screenProps.user?(
									<Text style = {{color:this.props.screenProps.userData.intro==''?'#ddd':'#000'}}>
										{this.props.screenProps.userData.intro==''?'Nothing is written':this.props.screenProps.userData.intro}
									</Text>):(
									<Text style = {{color:this.props.screenProps.userData.intro==''?'#ddd':'#000'}} onPress={()=>this.setState({promptVisible:true})}>
										{this.props.screenProps.userData.intro==''?'Write down something about you!':this.props.screenProps.userData.intro}
									</Text>)
								}
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
                                        <Callout pin={pin} updatePins={this.updatePins} likePin={this.likePin} user={this.props.screenProps.guest} userData={this.props.screenProps.userData} goToProfile={(user)=>{
											db.collection('User')
											  .find({ username: user})
											  .then(docs => {(
											this.setState({
											profileData:docs[0].profile,goToProfile:user}))})
										}}
										editPin={()=>this.setState({edit:pin})}
										/>
                                    </ScrollView>
                                </MapView.Callout>
                            </MapView.Marker>
                        )}
                    </MapMarkerClustering>
                </View>
				{this.state.goToProfile!=''&&
                    <View style={{
                        position: 'absolute',
                        flex: 1,
                        zIndex: 1000,
                        backgroundColor:'white',
                        height: '100%',
                        width: '100%'
                    }}>
                        <Profile screenProps={{
                            user: this.state.goToProfile,
                            userData: this.state.profileData,
                            back:() => {
                                this.setState({goToProfile:''})}
                            ,
                            guest: this.props.screenProps.guest,
                            callback:()=>{
                                db.collection('User')
                                    .find({ username: this.state.goToProfile})
                                    .then(docs => this.setState({ profileData:docs[0].profile}));
                                this.props.screenProps.callback()}
                            }}
                        />
                    </View>
				}
				{this.state.edit!=null &&
                    <View style={{ 
                        position: 'absolute',
                        flex: 1,
                        zIndex: 1000,
                        backgroundColor:'white',
                        height: '100%',
                        width: '100%'
                    }}>
				        <EditPin
                            pin={this.state.edit}
                            callback={()=>
                                this.setState({edit:null})
                            }
                        />		
                    </View>
                }
				{this.state.showFollower &&
                    <View style={{ 
                        position: 'absolute',
                        flex: 1,
                        zIndex: 1000,
                        backgroundColor:'white',
                        height: '100%',
                        width: '100%'
                    }}>
                        <UserList
                            title='followers'
                            list={this.props.screenProps.userData.followers}
                            user={this.props.screenProps.guest}
                            back={()=>
                                this.setState({showFollower:false})}
                            callback={() => this.props.screenProps.callback()}
                        />
                    </View>
                }
				{this.state.showFollowing &&
                    <View style={{ 
                        position: 'absolute',
                        flex: 1,
                        zIndex: 1000,
                        backgroundColor:'white',
                        height: '100%',
                        width: '100%'
				    }}>
				        <UserList
                            title='following'
                            list={this.props.screenProps.userData.follow}
                            user={this.props.screenProps.guest}
                            back={() => this.setState({showFollowing:false})}
				            callback={()=> this.props.screenProps.callback()}
                        />		
                    </View>
                }
            </View>
        );
    }
}