import React from 'react';
import { View, Text, Image } from 'react-native';

// Importa o asset do logo diretamente
import logoAssisConnect from '../assets/logo-assisconnect.png'; 

// O componente não precisa mais receber 'logo' como prop
export default function Appheader({ styles }) {
  return (
    <View style={styles.appHeader}>
      <Image source={logoAssisConnect} style={styles.appLogo} />
      <Text style={styles.appTitle}>Assisconnect</Text>
    </View>
  );
}
