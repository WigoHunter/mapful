import React from 'react';
import { StyleSheet, Alert, Button, Text, TextInput, View, Image } from 'react-native';

const NowLoading = () => (
    <View style={{ 
		position: 'absolute',
		zIndex: 99999,
		height: '100%',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#40404080'
	}}>
		<Text style={{
			backgroundColor: '#FFF',
			paddingLeft: 10,
			paddingRight: 10,
			borderWidth: 2,
			borderColor: 'gray',
			borderRadius: 3
		}}>
			Connecting to the server, please wait...
		</Text>
	</View>
)
export default NowLoading;