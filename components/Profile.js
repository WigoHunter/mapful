import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import MapView from 'react-native-maps';

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

export default class Profile extends React.Component {
    render() {
    let pic = {
      uri: 'http://assets.nydailynews.com/polopoly_fs/1.2181344.1428731676!/img/httpImage/image.jpg_gen/derivatives/article_750/bigbang11n-2-web.jpg'
    };
      return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{flex : 0.4, flexDirection: 'row', backgroundColor: '#F2F4F4'}}>
                <Image source={pic} style={styles.profilePicture}/>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>Dinesh Chugtai</Text>
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