import React from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, ScrollView, Text, TextInput, Image, RefreshControl, TouchableHighlight } from 'react-native';
import { Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import { LazyloadScrollView, LazyloadImage } from 'react-native-lazyload';
import db from './utils/db.js';
import { mapIdToProfilePicture } from './utils/utils.js';
import DeferredImage from './DeferredRender.js';
import Profile from './Profile.js'

export default class Home extends React.Component {
	static navigationOptions = {
    tabBarLabel: 'Home'
  };

  constructor(props) {
    super(props);

    this.state = {
      pins: [],
      refreshing: false,
	  goToProfile: ''
    };

    this.updatePins = this.updatePins.bind(this);
    this.likePin = this.likePin.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  componentWillMount() {
    this.updatePins();
  }

  onRefresh() {
    this.setState({ refreshing: true });
    this.updatePinsWithPromise()
      .then(() => {
        this.setState({ refreshing: false });
      });
  }

  // Same as updatePins() -> Should probably use Redux store for pins
  // But again, the query for getting pins on Home and Discover will be different
  updatePins() {
    db.collection('Pins')
      .find({})
      .then(pins => this.setState({ pins: pins.reverse() }));
  }

  updatePinsWithPromise() {
    const self = this;

    return new Promise((resolve, reject) => {
      db.collection('Pins')
        .find({})
        .then(pins => {
          self.setState({ pins: pins.reverse() });
          resolve("success");
        });
    })
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
    const { pins } = this.state;
	if(this.state.goToProfile=='')
    {return (
      <LazyloadScrollView
        style={styles.home}
        name="lazyload-scrollview"
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }
      >
        {pins.map(pin => (
          <Post
            key={pin._id}
            host="lazyload-scrollview"
            pin={pin}
            likePin={this.likePin}
            user={this.props.screenProps.user}
            updatePins={this.updatePins}
            userData={this.props.screenProps.userData}
			goToProfile={(user)=>{
				db.collection('User')
				  .find({ username: user})
				  .then(docs => {(
				  console.log(docs[0]),
				this.setState({
				profileData:docs[0].profile,goToProfile:user}))})
			}}
          />
        ))}
      </LazyloadScrollView>
	)}
	return(
		<Profile screenProps={{user: this.state.username,userData:this.state.profileData,callback:()=>{
		this.setState({goToProfile:''})}
			, guest:true}}/>
	)
  }
}

class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openComment: false,
    }

    this.toggleComment = this.toggleComment.bind(this);
    this.onSubmitComment = this.onSubmitComment.bind(this);
  }

  toggleComment() {
    this.setState({ openComment: !this.state.openComment });
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

  destoryPins() {
    db.collection('Pins')
      .deleteMany({})
      .then(() => {
        this.props.updatePins();
      });
  }

  destoryUsers() {
    db.collection('User')
      .deleteMany({})
      .then(() => {
        this.props.updatePins();
      });
  }

  render() {
    const { host, pin, likePin, user, submitComment } = this.props;
    const { openComment } = this.state;

    return (
      <View style={styles.pin}>
        <Text style={styles.title} onPress={() => this.destoryPins()}>{pin.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.username} onPress={()=>this.props.goToProfile(pin.username)}>{pin.username}</Text>
          <Text style={styles.time}>{`${pin.time.getDate()} / ${pin.time.getMonth()} / ${pin.time.getFullYear()}`}</Text>
        </View>
        {/*(pin.image != null && pin.image.length > 0) &&
          <LazyloadImage
            host={host}
            source={{ uri: `https://res.cloudinary.com/comp33302017/image/upload/v${pin.image[0].version}/${pin.image[0].id}` }}
            style={styles.img}
            resizeMode="cover"
          />
        */}

        <Text style={styles.txt} onPress={() => this.destoryUsers()}>{pin.txt}</Text>
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

        {openComment &&
          <View style={{ flexDirection: 'column', marginTop: 5, marginBottom: 5 }}>
            {pin.comments.map((comment, i) => (
              <View style={styles.comment} key={i}>
                <DeferredImage
                  promise={mapIdToProfilePicture(comment.user)}
                  then={<View style={{ width: 24, height: 24 }} />}
                  style={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    marginRight: 6
                  }}
                />
                <Text style={styles.commentText}>{comment.txt}</Text>
              </View>
            ))}
            <TextInput
              style={{ alignSelf: 'stretch', fontSize: 14, height: 24, borderColor: '#CCC', borderWidth: 1, borderRadius: 8, paddingLeft: 5, paddingRight: 5 }}
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
  home: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EFEFEF',
  },

  pin: {
    backgroundColor: '#FFF',
    flexDirection: 'column',
    alignSelf: 'stretch',
    margin: 5,
    borderRadius: 6,
    padding: 8,
  },
  
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
    marginTop: 8,
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

  img: {
    alignSelf: 'stretch',
    marginTop: 10,
    marginBottom: 10,
    minHeight: 260,
    borderRadius: 4,
  },

  txt: {
    fontSize: 14,
    fontWeight: 'normal',
    alignSelf: 'stretch',
  },

  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 8
  },

  commentText: {
    fontSize: 14
  }
});