import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, ScrollView, Text, Image, TextInput, Button } from 'react-native';
import { Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import MapMarkerClustering  from './MapMarkerClustering'
import db from './utils/db.js';
import { mapIdToProfilePicture } from './utils/utils.js';
import DeferredImage from './DeferredRender.js';
import Profile from './Profile.js'

export default class Discover extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Discover'
  };

	constructor(props) {
    super(props);

    this.state = {
      pins: [],
	  goToProfile: ''
    };

    this.OnRegionChange = this.OnRegionChange.bind(this);
    this.updatePins = this.updatePins.bind(this);
    this.likePin = this.likePin.bind(this);
  }

  componentDidMount() {
    this.updatePins();
  }

  OnRegionChange(region) {
    this.setState({ region });
  }

  updatePins() {
    db.collection('Pins')
      .find({})
      .then(pins => this.setState({ pins }));
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

  render() {
    const { region, pins } = this.state;
	if(this.state.goToProfile=='')
    {
    return (
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
                  <Callout pin={pin} updatePins={this.updatePins} likePin={this.likePin} user={this.props.screenProps.user} userData={this.props.screenProps.userData} 
					goToProfile={(user)=>{
						db.collection('User')
						  .find({ username: user})
						  .then(docs => {(
						  console.log(docs[0]),
						this.setState({
						profileData:docs[0].profile,goToProfile:user}))})
					}}				  />
                </ScrollView>
              </MapView.Callout>
            </MapView.Marker>
          )}
        </MapMarkerClustering>
      </View>
    );}
	return(
		<Profile screenProps={{user: this.state.goToProfile,userData:this.state.profileData,callback:()=>{
		this.setState({goToProfile:''})}
			, guest:true}}/>
	)
  }
}

export class Callout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openComment: false
    }

    this.onSubmitComment = this.onSubmitComment.bind(this);
    this.toggleComment = this.toggleComment.bind(this);
  }

  onSubmitComment(txt) {
    db.collection('Pins')
      .updateOne(
        { _id: this.props.pin._id },
        { $push: { 'comments': {
            txt,
            user: this.props.user,
          }
        }}
      )
      .then(() => this.props.updatePins())
      .then(() => this.textInput.clear());
  }

  toggleComment() {
    this.setState({ openComment: !this.state.openComment });
  }

  render() {
    const { pin, updatePins, likePin, user } = this.props;
    
    return (
      <View style={{ marginTop: 5, marginBottom: 5 }}>
        <Text style={styles.title}>{pin.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.username} onPress={()=>this.props.goToProfile(pin.username)}>{pin.username}</Text>
          <Text style={styles.time}>{`${pin.time.getDate()} / ${pin.time.getMonth()} / ${pin.time.getFullYear()}`}</Text>
        </View>
        {(pin.image != null && pin.image.length > 0) &&
          <Image
            source={{
              uri: `https://res.cloudinary.com/comp33302017/image/upload/v${pin.image[0].version}/${pin.image[0].id}`
            }}
            style={{
              width: 220,
              height: 200,
              marginBottom: 10,
              marginTop: 10,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        }
        <Text style={styles.txt}>{pin.txt}</Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 5 }}
        >
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => likePin(pin._id)}>
            <Icon
              name="heart"
              color={pin.likes.includes(user) ? "red" : "#AAA"}
              style={{ marginRight: 3, fontSize: 14 }}
            />
            <Text style={{ marginRight: 14, fontSize: 14 }}>{pin.likes ? pin.likes.length : 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => this.toggleComment()}>
            <Icon name="comment-o" style={{ marginRight: 3, fontSize: 14 }} />
            <Text style={{ fontSize: 14 }}>{pin.comments.length}</Text>
          </TouchableOpacity>
        </View>
        {this.state.openComment &&
          <View style={{ flexDirection: 'column', marginTop: 5, marginBottom: 5 }}>
            {pin.comments.map((comment, i) => (
              <View style={styles.comment} key={i}>
                <DeferredImage
                  promise={mapIdToProfilePicture(comment.user)}
                  then={<View style={{ width: 20, height: 20 }} />}
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    marginRight: 3
                  }}
                />
                <Text>{comment.txt}</Text>
              </View>
            ))}
            <TextInput
              style={{ width : 220, fontSize: 14, height: 24, borderColor: '#CCC', borderWidth: 1, borderRadius: 8, paddingLeft: 5, paddingRight: 5 }}
              placeholder=""
              ref={input => { this.textInput = input }}
              onSubmitEditing={(e) => this.onSubmitComment(e.nativeEvent.text)}
            />
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  callout: {
    width: '100%',
    height: 320,
    zIndex: 100000
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 230,
  },

  username: {
    fontSize: 14,
    color: '#1EE494',
  },

  time: {
    fontSize: 12,
    color: '#AAA',
    marginLeft: 8
  },

  txt: {
    fontSize: 14,
    fontWeight: 'normal',
    width: 230,
  },

  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  }
});
