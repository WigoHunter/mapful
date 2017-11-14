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
    db.collection('Pins').find({}).then(docs=>{console.log(docs)});
  }

  render() {
    return (
      <View style={{ flex: 1 }}>


      </View>
    );
  }
}