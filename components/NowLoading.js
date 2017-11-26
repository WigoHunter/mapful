import React from 'react';
import { StyleSheet, Alert, Button, Text, TextInput, View, Image } from 'react-native';

const NowLoading = () => (
    <View style={{ 
			  position: 'absolute',
			  zIndex: 99999,
			  height: '100%',
			  width: '100%',
			  backgroundColor: '#40404080'
			}}>
		<View style={{
				  alignSelf: 'center',
				  position: 'absolute',
				  zIndex: 100000,
				  top: '45%'
				  
		}}>
			<Text style={{backgroundColor: '#FFF',
						  marginLeft: 20,
						  paddingLeft: 10,
					      borderWidth: 2,
						  borderColor: 'gray',
						  borderRadius: 110,
						  borderWidth: 2}}>Now Loading...</Text>
		</View>
	</View>
)
export default NowLoading;