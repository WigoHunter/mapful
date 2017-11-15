import React from 'react';
import { StyleSheet, View, ScrollView, Text, Image } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import MapView from 'react-native-maps';

const stitch = require("mongodb-stitch");
const client = new stitch.StitchClient('mapful-cffdt');
const db = client.service('mongodb', 'mongodb-atlas').db('Mapful');

client.login().then(() =>
  console.log("[MongoDB Stitch] Connected to Stitch")
).catch(err => {
  console.error(err)
});

export default class Discover extends React.Component {
	constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: 32.282462956240902,
        longitude: 114.1280245223424,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      pins: [],
    };

    this.OnRegionChange = this.OnRegionChange.bind(this);
    this.updatePins = this.updatePins.bind(this);
  }

  componentDidMount() {
    const Options = {
      enableHighAccuracy: false,
      timeout: 1000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(pos => {
      this.setState({
        region: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }
      });
    }, Options);

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

  render() {
    const { region, pins } = this.state;

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
        <MapView
          style={{ flex: 1 }}
          region={region}
          showsCompass={false}
          onRegionChange={this.onRegionChange}
        >
          {pins.map(pin =>
            <MapView.Marker
              key={pin._id}
              coordinate={{
                latitude: pin.location.latitude,
                longitude: pin.location.longitude
              }}
            >
              <MapView.Callout style={{ zIndex: 10000 }}>
                <Callout pin={pin} />
              </MapView.Callout>
            </MapView.Marker>
          )}
        </MapView>
      </View>
    );
  }
}

const Callout = ({ pin }) => (
  <ScrollView contentContainerStyle={styles.callout}>
    <Text style={styles.title}>{pin.title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.username}>{pin.username}</Text>
      <Text style={styles.time}>{`${pin.time.getDate()} / ${pin.time.getMonth()} / ${pin.time.getFullYear()}`}</Text>
    </View>
    {(pin.image != null && pin.image.length > 0) &&
      <Image
        source={{
          uri: `https://res.cloudinary.com/comp33302017/image/upload/v${pin.image[0].version}/${pin.image[0].id}`
        }}
        style={{
          width: 200,
          height: 200,
          marginBottom: 10,
          marginTop: 10,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    }
    <Text style={styles.txt}>{pin.txt}</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  callout: {
    width: '100%',
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
  }
});
