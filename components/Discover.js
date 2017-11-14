import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
      latitude: 22.28240357248325,
      longitude: 114.12782309587497,
      pins: [],
    };
  }

  componentDidMount() {
    const Options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(pos => {
      this.setState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
    }, Options);

    db.collection('Pins')
      .find({})
      .then(pins => this.setState({ pins }));
  }

  render() {
    const { latitude, longitude, pins } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {pins.map(pin =>
            <MapView.Marker
              key={pin._id}
              coordinate={{
                latitude: pin.location.latitude,
                longitude: pin.location.longitude
              }}
              title={pin.title}
              description={pin.txt}
            />
          )}
        </MapView>
      </View>
    );
  }
}