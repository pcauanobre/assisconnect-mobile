import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import colors from '../../styles/colors.js';
import Logo from '../../components/Logo';
import { sanitizeCpfRg } from '../../utils/validators';

export default function LoginCPFScreen({ navigation }) {
  const [cpf, setCpf] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Logo size={130} />

        <Text style={styles.title}>Bem vindo ao Assisconnect!</Text>
        <Text style={styles.subtitle}>Acesse sua conta</Text>

        <View style={{height:18}} />

        <Text style={styles.fieldLabel}>CPF/RG</Text>
        <TextInput
          value={cpf}
          onChangeText={(t)=>setCpf(sanitizeCpfRg(t))}
          placeholder="Digite o CPF ou RG da pessoa idosa"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, {opacity: cpf.length >= 5 ? 1 : 0.6}]}
          disabled={cpf.length < 5}
          onPress={() => navigation.navigate('LoginSms', { cpf })}
        >
          <Text style={styles.buttonText}>Próximo</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>Esqueceu a senha?</Text>
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
