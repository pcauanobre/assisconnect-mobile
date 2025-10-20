import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

// Componentes
import UpdateProfileModal from '../../components/UpdateProfileModal';
import Appheader from '../../components/Appheader';
import InfoCard from '../../components/InfoCard';
import PersonalInfoForm from '../../components/PersonalInfoForm';

// Assets
import idosoImg from '../../assets/idoso.jpeg';
import idosaImg from '../../assets/idosa.jpg';
import logoAssisConnect from '../../assets/logo-assisconnect.png';
import rgImg from '../../assets/rg.jpeg';
import vacinaImg from '../../assets/vacina.png';
import susImg from '../../assets/sus.webp';

// Estilos
import styles from '../../styles/perfilIdosoStyles';

export default function ElderProfileScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('contatos');
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [linkedModalVisible, setLinkedModalVisible] = useState(false);

  // Perfis vinculados
  const linkedElders = [
    {
      id: '1',
      name: 'Almir Benedito da Silva',
      sex: 'Masculino',
      birthDate: '01/06/1949',
      maritalStatus: 'Divorciado',
      rg: '12.345.678-9',
      cpf: '123.456.789-00',
      email: 'almir.silva@email.com',
      phone: '(99) 99999-9999',
      photo: idosoImg,
    },
    {
      id: '2',
      name: 'Maria de Souza',
      sex: 'Feminino',
      birthDate: '15/03/1952',
      maritalStatus: 'Viúva',
      rg: '98.765.432-1',
      cpf: '987.654.321-00',
      email: 'maria.souza@email.com',
      phone: '(99) 98888-8888',
      photo: idosaImg,
    },
  ];

  const [userData, setUserData] = useState(linkedElders[0]); // Perfil inicial

  const documentsData = [
    {
      id: '1',
      name: 'RG',
      description: 'Registro Geral do Idoso',
      icon: 'id-card',
      type: 'image',
      source: rgImg,
    },
    {
      id: '2',
      name: 'Carteira de Vacinação',
      description: 'Histórico de vacinas',
      icon: 'syringe',
      type: 'image',
      source: vacinaImg,
    },
    {
      id: '3',
      name: 'Cartão do SUS',
      description: 'Número do SUS',
      icon: 'medkit',
      type: 'image',
      source: susImg,
    },
  ];

  const handleSave = (updatedData) => setUserData(updatedData);

  const handleViewDocument = (doc) => {
    setCurrentDocument(doc);
    setDocumentModalVisible(true);
  };

  const handleDownloadDocument = (doc) => {
    Alert.alert('Download', `Simulando download do documento: ${doc.name}`, [
      { text: 'OK' },
    ]);
  };

  const selectLinkedElder = (elder) => {
    setUserData(elder);
    setLinkedModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header fixo com logo */}
      <Appheader logo={logoAssisConnect} styles={styles} />

      {/* Botão para abrir modal de idosos vinculados */}
      <TouchableOpacity
        style={{
          backgroundColor: '#4b2e1e',
          padding: 12,
          borderRadius: 10,
          margin: 12,
          alignItems: 'center',
        }}
        onPress={() => setLinkedModalVisible(true)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Idosos Vinculados</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Text style={styles.headerSubtitle}>
            Visualize informações pessoais do Idoso
          </Text>
        </View>

        <InfoCard
          userData={userData}
          idosoImage={userData.photo} // Atualiza a foto ao mudar de perfil
          onEditPress={() => setModalVisible(true)}
          styles={styles}
        />

        <PersonalInfoForm userData={userData} styles={styles} />

        {/* --- Abas --- */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'documentos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('documentos')}
          >
            <FontAwesome
              name="folder-open"
              size={14}
              color={activeTab === 'documentos' ? '#fff' : '#3E2723'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'documentos' && styles.tabButtonTextActive,
              ]}
            >
              Documentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'contatos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('contatos')}
          >
            <FontAwesome
              name="phone"
              size={14}
              color={activeTab === 'contatos' ? '#fff' : '#3E2723'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'contatos' && styles.tabButtonTextActive,
              ]}
            >
              Contatos
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- Conteúdo das Abas --- */}
        {activeTab === 'contatos' && (
          <View style={styles.contactSection}>
            <Text style={styles.label}>Telefone da Pessoa Idosa</Text>
            <TextInput
              style={styles.personalInfoInput}
              value={userData.phone}
              editable={false}
            />

            <Text style={styles.label}>Preferência de Contato</Text>
            <TextInput
              style={styles.personalInfoInput}
              value="WhatsApp (08h-18h)"
              editable={false}
            />

            <View
              style={{
                borderBottomColor: '#CBBBA0',
                borderBottomWidth: 1,
                marginTop: 16,
              }}
            />

            <Text style={styles.feedbackText}>Tem algum dado errado?</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.editButtonText}>Solicitar Alteração</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'documentos' && (
          <View style={{ marginTop: 16, paddingHorizontal: 10 }}>
            <FlatList
              data={documentsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: '#F9F7F3',
                    borderRadius: 10,
                    marginBottom: 10,
                    elevation: 2,
                  }}
                >
                  <FontAwesome5 name={item.icon} size={24} color="#4b2e1e" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: 'bold', color: '#4b2e1e' }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: '#3E2723', fontSize: 12 }}>
                      {item.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      padding: 8,
                      backgroundColor: '#4b2e1e',
                      borderRadius: 6,
                      marginLeft: 6,
                    }}
                    onPress={() => handleViewDocument(item)}
                  >
                    <FontAwesome name="eye" size={16} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      padding: 8,
                      backgroundColor: '#4b2e1e',
                      borderRadius: 6,
                      marginLeft: 6,
                    }}
                    onPress={() => handleDownloadDocument(item)}
                  >
                    <FontAwesome name="download" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {/* --- Modal de visualização de documentos --- */}
      {currentDocument && (
        <Modal
          visible={documentModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setDocumentModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {currentDocument.type === 'image' ? (
              <Image
                source={currentDocument.source}
                style={{ width: '90%', height: '70%', borderRadius: 12 }}
                resizeMode="contain"
              />
            ) : (
              <WebView
                source={{ uri: currentDocument.source }}
                style={{ width: '90%', height: '70%', borderRadius: 12 }}
              />
            )}

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: '#fff',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
              onPress={() => setDocumentModalVisible(false)}
            >
              <Text style={{ color: '#4b2e1e', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* --- Modal para editar dados do idoso --- */}
      <UpdateProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        userData={userData}
      />

      {/* --- Modal Idosos Vinculados --- */}
      <Modal
        visible={linkedModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLinkedModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              width: '100%',
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              Idosos Vinculados
            </Text>

            {linkedElders.map((elder) => (
              <TouchableOpacity
                key={elder.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#CBBBA0',
                }}
                onPress={() => selectLinkedElder(elder)}
              >
                <Image
                  source={elder.photo}
                  style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
                />
                <Text style={{ fontSize: 16, color: '#4b2e1e' }}>{elder.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={{
                marginTop: 12,
                alignSelf: 'center',
                backgroundColor: '#4b2e1e',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
              onPress={() => setLinkedModalVisible(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
