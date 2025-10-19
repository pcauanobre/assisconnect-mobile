import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

export default function InfoCard({ userData, idosoImage, onEditPress, styles }) {
  return (
    <>
      {/* Card com Foto, Nome e Informações */}
      <View style={styles.card}>
        <Image source={idosoImage} style={styles.avatar} />

        <Text style={styles.name}>{userData.name}</Text>

        {/* Idade e sexo — valor fixo por enquanto */}
        <Text style={styles.info}>78 anos · {userData.sex}</Text>
      </View>

      
    </>
  );
}
