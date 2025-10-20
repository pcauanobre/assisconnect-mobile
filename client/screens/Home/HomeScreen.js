import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import colors from '../../styles/colors.js';

//foi feito o revert da alteracao na HomeScreen
export default function HomeScreen() {
  return (
    <SafeAreaView style={{flex:1, backgroundColor: colors.background}}>
      <View style={styles.wrap}>
        <Text style={styles.h1}>Olá, Família!</Text>
        <Text style={styles.p}>Essa é só uma tela placeholder para depois do login.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex:1, alignItems:'center', justifyContent:'center' },
  h1: { fontSize: 24, fontWeight:'700', color:'#4E342E', marginBottom: 8 },
  p: { color:'#6B5E55' },
});