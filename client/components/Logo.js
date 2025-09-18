import React from 'react';
import { Image, View } from 'react-native';

export default function Logo({ size = 120 }) {
  return (
    <View style={{alignItems:'center', marginBottom: 16}}>
      <Image
        source={require('../assets/logo-assisconnect.png')}
        style={{ width: size, height: size, borderRadius: size/2 }}
        resizeMode="contain"
      />
    </View>
  );
}
