import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import colors from '../../styles/colors.js';
import Logo from '../../components/Logo';
import { sanitizeCode } from '../../utils/validators';

export default function LoginSmsScreen({ navigation, route }) {
  const { cpf } = route.params || {};
  const [code, setCode] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Logo size={100} />
        <Text style={styles.title}>Bem vindo ao Assisconnect!</Text>
        <Text style={styles.subtitle}>Veja sua caixa de mensagens SMS</Text>

        <View style={{height:18}} />

        <Text style={styles.fieldLabel}>Código</Text>
        <TextInput
          value={code}
          onChangeText={(t)=>setCode(sanitizeCode(t))}
          placeholder="Digite o Código…"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.button, {opacity: code.length === 6 ? 1 : 0.6}]}
          disabled={code.length !== 6}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerLink}>Acessibilidade</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.footerLink}>Suporte</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.background },
  container: { flex:1, paddingHorizontal:24, alignItems:'center', justifyContent:'center' },
  title: { fontSize:18, fontWeight:'700', color: colors.primary, marginBottom:4 },
  subtitle: { fontSize:12, color: colors.muted },
  fieldLabel: { alignSelf:'flex-start', color: colors.muted, fontSize:12, marginBottom:6, marginTop:18 },
  input: {
    width:'100%',
    backgroundColor: colors.white,
    borderRadius:12,
    paddingHorizontal:16,
    paddingVertical:14,
    borderWidth:1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4
  },
  button: {
    width:'100%',
    backgroundColor: colors.primary,
    paddingVertical:14,
    borderRadius:12,
    marginTop:16,
    alignItems:'center',
    justifyContent:'center'
  },
  buttonText: { color: colors.white, fontWeight:'700' },
  link: { color: colors.muted, fontSize:12, marginTop:14 },
  footer: { position:'absolute', bottom:24, flexDirection:'row', alignItems:'center' },
  footerLink: { color: colors.muted, fontSize:12 },
  dot: { color: colors.muted, marginHorizontal:8 }
});
