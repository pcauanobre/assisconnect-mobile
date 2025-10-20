import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import rgImg from '../../assets/rg.jpeg';
import vacinaImg from '../../assets/vacina.png';
import susImg from '../../assets/sus.webp';

// Estilos externos existentes
import styles from '../../styles/perfilIdosoStyles';

export default function ElderProfileScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false); // editar dados
  const [activeTab, setActiveTab] = useState('contatos');

  const [documentModalVisible, setDocumentModalVisible] = useState(false); // preview doc
  const [currentDocument, setCurrentDocument] = useState(null);

  const [linkedModalVisible, setLinkedModalVisible] = useState(false); // idosos vinculados

  // Fluxo documentos
  const [selectDocModalVisible, setSelectDocModalVisible] = useState(false); // escolher qual doc
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false); // modal bonitinho
  const [uploadNote, setUploadNote] = useState('');

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
    { id: '1', name: 'RG', description: 'Registro Geral do Idoso', icon: 'id-card', type: 'image', source: rgImg },
    { id: '2', name: 'Carteira de Vacinação', description: 'Histórico de vacinas', icon: 'syringe', type: 'image', source: vacinaImg },
    { id: '3', name: 'Cartão do SUS', description: 'Número do SUS', icon: 'medkit', type: 'image', source: susImg },
  ];

  const handleSave = (updatedData) => setUserData(updatedData);

  const handleViewDocument = (doc) => {
    setCurrentDocument(doc);
    setDocumentModalVisible(true);
  };

  const handleDownloadDocument = (doc) => {
    Alert.alert('Download', `Simulando download do documento: ${doc.name}`, [{ text: 'OK' }]);
  };

  const selectLinkedElder = (elder) => {
    setUserData(elder);
    setLinkedModalVisible(false);
  };

  const selectedDoc = documentsData.find((d) => d.id === selectedDocId) || null;

  const handleSolicitarAlteracao = () => {
    if (activeTab === 'documentos') {
      setSelectedDocId(null);
      setSelectDocModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const proceedAfterDocSelection = () => {
    if (!selectedDocId) return;
    setSelectDocModalVisible(false);
    setUploadModalVisible(true);
  };

  const submitUpload = () => {
    setUploadModalVisible(false);
    setUploadNote('');
    setSelectedDocId(null);
    Alert.alert('Solicitação enviada', 'Sua solicitação de alteração com documentos foi enviada para análise.', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF6ED' }} edges={['top','left','right']}>
      {/* Header fixo com logo (na área segura) */}
      <Appheader styles={styles} />

      {/* Botão MARROM (fill) com texto BRANCO */}
      <TouchableOpacity style={topBtn.container} onPress={() => setLinkedModalVisible(true)}>
        <Text style={topBtn.text}>Idosos Vinculados</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pessoa Idosa</Text>
          <Text style={styles.headerSubtitle}>Visualize informações pessoais do Idoso</Text>
        </View>

        {/* CARD: perfil */}
        <View style={shadowCard.card}>
          <InfoCard
            userData={userData}
            idosoImage={userData.photo}
            onEditPress={() => setModalVisible(true)}
            styles={styles}
          />
        </View>

        {/* CARD: informações pessoais */}
        <View style={shadowCard.card}>
          <PersonalInfoForm userData={userData} styles={styles} />
        </View>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'documentos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('documentos')}
          >
            <FontAwesome name="folder-open" size={14} color={activeTab === 'documentos' ? '#fff' : '#3E2723'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'documentos' && styles.tabButtonTextActive]}>Documentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'contatos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('contatos')}
          >
            <FontAwesome name="phone" size={14} color={activeTab === 'contatos' ? '#fff' : '#3E2723'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabButtonText, activeTab === 'contatos' && styles.tabButtonTextActive]}>Contatos</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das abas em card branco */}
        {activeTab === 'contatos' && (
          <View style={shadowCard.card}>
            <Text style={styles.label}>Telefone da Pessoa Idosa</Text>
            <TextInput style={styles.personalInfoInput} value={userData.phone} editable={false} />

            <Text style={styles.label}>Preferência de Contato</Text>
            <TextInput style={styles.personalInfoInput} value="WhatsApp (08h-18h)" editable={false} />
          </View>
        )}

        {activeTab === 'documentos' && (
          <View style={shadowCard.card}>
            <FlatList
              data={documentsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={docRow.row}>
                  <FontAwesome5 name={item.icon} size={22} color="#4B2E0F" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: 'bold', color: '#4B2E0F' }}>{item.name}</Text>
                    <Text style={{ color: '#3E2723', fontSize: 12 }}>{item.description}</Text>
                  </View>

                  <TouchableOpacity style={docRow.action} onPress={() => handleViewDocument(item)}>
                    <FontAwesome name="eye" size={16} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity style={docRow.action} onPress={() => handleDownloadDocument(item)}>
                    <FontAwesome name="download" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled
            />
          </View>
        )}

        {/* CARD: Feedback SEMPRE visível */}
        <View style={shadowCard.card}>
          <View style={{ height: 1, backgroundColor: '#CBBBA0', marginBottom: 12 }} />
          <Text style={{ color: '#7A6A59', textAlign: 'center', marginBottom: 10 }}>
            Tem algum dado errado?
          </Text>
          <TouchableOpacity style={primaryBtn.centered} onPress={handleSolicitarAlteracao}>
            <Text style={primaryBtn.text}>Solicitar Alteração</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de pré-visualização de documento */}
      {currentDocument && (
        <Modal
          visible={documentModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDocumentModalVisible(false)}
        >
          <View style={overlayStyles.overlay}>
            <View style={previewStyles.card}>
              {currentDocument.type === 'image' ? (
                <Image source={currentDocument.source} style={previewStyles.media} resizeMode="contain" />
              ) : (
                <WebView source={{ uri: currentDocument.source }} style={previewStyles.media} />
              )}

              <TouchableOpacity style={primaryBtn.centered} onPress={() => setDocumentModalVisible(false)}>
                <Text style={primaryBtn.text}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* 1) Modal para ESCOLHER qual documento */}
      <Modal
        visible={selectDocModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectDocModalVisible(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={selectDocStyles.card}>
            <Text style={selectDocStyles.title}>Qual documento você quer alterar?</Text>
            {documentsData.map((doc) => {
              const selected = selectedDocId === doc.id;
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[selectDocStyles.item, selected && selectDocStyles.itemSelected]}
                  onPress={() => setSelectedDocId(doc.id)}
                >
                  <View style={selectDocStyles.radioOuter}>
                    {selected && <View style={selectDocStyles.radioInner} />}
                  </View>
                  <Text style={selectDocStyles.itemText}>{doc.name}</Text>
                </TouchableOpacity>
              );
            })}

            <View style={selectDocStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setSelectDocModalVisible(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[primaryBtn.centered, { alignSelf: 'flex-start', paddingHorizontal: 18 }]}
                onPress={proceedAfterDocSelection}
                disabled={!selectedDocId}
              >
                <Text style={primaryBtn.text}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2) Modal bonitinho de envio/observações */}
      <Modal
        visible={uploadModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={uploadStyles.modalCard}>
            <Text style={uploadStyles.title}>
              {selectedDoc ? `Solicitar alteração de ${selectedDoc.name}` : 'Solicitar alteração'}
            </Text>
            <Text style={uploadStyles.subtitle}>
              Anexe fotos/PDFs (opcional) e descreva a alteração desejada.
            </Text>

            <View style={uploadStyles.uploadRow}>
              <TouchableOpacity style={uploadStyles.uploadBox}>
                <FontAwesome name="camera" size={20} color="#4B2E0F" />
                <Text style={uploadStyles.uploadText}>Tirar/Anexar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={uploadStyles.uploadBox}>
                <FontAwesome name="file-pdf-o" size={20} color="#4B2E0F" />
                <Text style={uploadStyles.uploadText}>Anexar PDF/Imagem</Text>
              </TouchableOpacity>
            </View>

            <Text style={uploadStyles.label}>Observações</Text>
            <TextInput
              style={uploadStyles.textarea}
              multiline
              numberOfLines={4}
              placeholder={
                selectedDoc
                  ? `Ex.: Atualizar ${selectedDoc.name} com nova imagem...`
                  : 'Descreva a alteração desejada...'
              }
              placeholderTextColor="#9c8c7a"
              value={uploadNote}
              onChangeText={setUploadNote}
            />

            <View style={uploadStyles.actions}>
              <TouchableOpacity style={outlinedBtnSmall.container} onPress={() => setUploadModalVisible(false)}>
                <Text style={outlinedBtnSmall.text}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={primaryBtn.centered} onPress={submitUpload}>
                <Text style={primaryBtn.text}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal padrão (editar dados) */}
      <UpdateProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        userData={userData}
      />

      {/* Modal Idosos Vinculados */}
      <Modal
        visible={linkedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLinkedModalVisible(false)}
      >
        <View style={overlayStyles.overlay}>
          <View style={linkedStyles.popup}>
            <Text style={linkedStyles.title}>Idosos Vinculados</Text>

            {linkedElders.map((elder) => (
              <TouchableOpacity key={elder.id} style={linkedStyles.item} onPress={() => selectLinkedElder(elder)}>
                <Image source={elder.photo} style={linkedStyles.avatar} />
                <Text style={linkedStyles.name}>{elder.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={primaryBtn.centered} onPress={() => setLinkedModalVisible(false)}>
              <Text style={primaryBtn.text}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* BOTÃO DO TOPO – marrom cheio, texto branco */
const topBtn = StyleSheet.create({
  container: {
    backgroundColor: '#4b2e1e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  text: { color: '#fff', fontWeight: 'bold' },
});

/* ---- Cards brancos com sombra ---- */
const shadowCard = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});

/* ---- Row da lista de documentos ---- */
const docRow = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  action: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#4b2e1e',
    borderRadius: 8,
    marginLeft: 6,
  },
});

/* ---- Overlay base para modais ---- */
const overlayStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

/* ---- Modal de preview de documentos ---- */
const previewStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    width: '92%',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  media: {
    width: '100%',
    height: 420,
    borderRadius: 10,
    marginBottom: 10,
  },
});

/* ---- Modal: escolher documento ---- */
const selectDocStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    width: '92%',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E0F',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E7DAC8',
    backgroundColor: '#fff',
  },
  itemSelected: {
    borderColor: '#C7A98D',
    backgroundColor: '#FCF9F4',
  },
  itemText: {
    color: '#4B2E0F',
    fontSize: 15,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4B2E0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4B2E0F',
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});

/* ---- Modal bonitinho de envio/observações ---- */
const uploadStyles = StyleSheet.create({
  modalCard: {
    backgroundColor: '#fff',
    width: '92%',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E0F',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#7A6A59',
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  uploadBox: {
    flex: 1,
    height: 90,
    borderWidth: 1.5,
    borderColor: '#C7A98D',
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  uploadText: {
    marginTop: 6,
    color: '#4B2E0F',
    fontWeight: '600',
    fontSize: 12,
  },
  label: {
    color: '#4B2E0F',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#C7A98D',
    borderRadius: 12,
    padding: 12,
    color: '#4B2E0F',
    textAlignVertical: 'top',
    minHeight: 90,
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});

/* ---- Modal de Idosos Vinculados ---- */
const linkedStyles = StyleSheet.create({
  popup: {
    backgroundColor: '#fff',
    width: '92%',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2E0F',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CBBBA0',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, color: '#4B2E0F' },
});

/* ---- Botões ---- */
const primaryBtn = StyleSheet.create({
  centered: {
    backgroundColor: '#4b2e1e',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  text: { color: '#fff', fontWeight: 'bold' },
});

/* Botão outline pequeno (usado nos modais) */
const outlinedBtnSmall = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderColor: '#4b2e1e',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  text: { color: '#4b2e1e', fontWeight: 'bold' },
});
