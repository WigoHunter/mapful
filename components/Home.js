import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import MapView from 'react-native-maps';

export default class Home extends React.Component {
	static navigationOptions = {
    tabBarLabel: 'Home'
  };
    render() {
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
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