import React from 'react';
import { View } from 'react-native';

const Marker = () => (
    <View
      style={{
        width: 24,
        height: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 0,
        backgroundColor: 'red',
        transform: [{ rotate: '45deg'}],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#FFFFFF'
        }}
      >
      </View>
    </View>
  );

  export default Marker;
