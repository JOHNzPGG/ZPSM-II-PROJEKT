import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'; // Dodaj useRouter
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors, globalStyles } from '../constants/globalStyles';
import { MOCK_COMPONENTS } from './components';

export default function ConfigsScreen() {
  const { openId } = useLocalSearchParams();
  const router = useRouter(); // Inicjalizacja routera
  const [allConfigs, setAllConfigs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  
  // Stany Modali
  const [modalVisible, setModalVisible] = useState(false); // Tworzenie nowego zestawu
  const [detailsModalVisible, setDetailsModalVisible] = useState(false); // Podgląd szczegółów
  const [addPartModalVisible, setAddPartModalVisible] = useState(false); // Wybór części do dodania
  
  // Stany danych
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [tempSelectedItems, setTempSelectedItems] = useState<any[]>([]);
  const [newConfigName, setNewConfigName] = useState('');

  const getUserKey = (name: string) => `configs_${name.trim().toLowerCase()}`;

  const loadConfigs = async () => {
    try {
      const name = await AsyncStorage.getItem('username');
      if (name) {
        setCurrentUser(name);
        const saved = await AsyncStorage.getItem(getUserKey(name));
        const configs = saved ? JSON.parse(saved) : [];
        setAllConfigs(configs);

        // Sprawdzamy, czy mamy parametr openId
        if (openId) {
          const configToOpen = configs.find((c: any) => c.id === openId);
          if (configToOpen) {
            setSelectedConfig(configToOpen);
            setDetailsModalVisible(true);
            
            // KLUCZOWA POPRAWKA: Czyścimy parametr z adresu URL, 
            // aby przy następnym wejściu modal sam się nie otworzył.
            router.setParams({ openId: undefined });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(useCallback(() => { loadConfigs(); }, [openId]));

  // FUNKCJA: Zapisywanie zmian w AsyncStorage
  const syncWithStorage = async (updatedList: any[]) => {
    setAllConfigs(updatedList);
    await AsyncStorage.setItem(getUserKey(currentUser), JSON.stringify(updatedList));
  };

  // FUNKCJA: Dodawanie części do ISTNIEJĄCEGO zestawu
  const addPartToCurrentConfig = async (part: any) => {
    if (!selectedConfig) return;
    
    const updatedParts = [...selectedConfig.parts, part];
    const updatedConfig = { ...selectedConfig, parts: updatedParts };
    const updatedList = allConfigs.map(c => c.id === selectedConfig.id ? updatedConfig : c);

    setSelectedConfig(updatedConfig);
    await syncWithStorage(updatedList);
    setAddPartModalVisible(false);
  };

  // FUNKCJA: Usuwanie części z ISTNIEJĄCEGO zestawu
  const removePartFromConfig = async (partId: string) => {
    if (!selectedConfig) return;
    
    const updatedParts = selectedConfig.parts.filter((p: any) => p.id !== partId);
    
    if (updatedParts.length === 0) {
      Alert.alert("Błąd", "Zestaw nie może być pusty. Usuń całą konfigurację przyciskiem na dole.");
      return;
    }

    const updatedConfig = { ...selectedConfig, parts: updatedParts };
    const updatedList = allConfigs.map(c => c.id === selectedConfig.id ? updatedConfig : c);

    setSelectedConfig(updatedConfig);
    await syncWithStorage(updatedList);
  };

  // FUNKCJA: Tworzenie całkowicie nowego zestawu
  const saveNewConfig = async () => {
    if (!newConfigName.trim() || tempSelectedItems.length === 0) {
      Alert.alert("Błąd", "Wprowadź nazwę i wybierz części.");
      return;
    }
    const newEntry = { id: Date.now().toString(), title: newConfigName, parts: tempSelectedItems };
    await syncWithStorage([...allConfigs, newEntry]);
    setModalVisible(false);
    setNewConfigName('');
    setTempSelectedItems([]);
  };

  const deleteEntireConfig = async (id: string) => {
    const filtered = allConfigs.filter(c => c.id !== id);
    await syncWithStorage(filtered);
    setDetailsModalVisible(false);
  };

  return (
    <View style={[globalStyles.container, globalStyles.safeArea]}>
      <Text style={globalStyles.headerTitle}>Twoje Zestawy</Text>
      
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {allConfigs.map((config) => (
          <TouchableOpacity 
            key={config.id} 
            style={globalStyles.configCard} 
            onPress={() => { setSelectedConfig(config); setDetailsModalVisible(true); }}
          >
            <View style={globalStyles.configHeader}>
              <Text style={globalStyles.configTitle}>{config.title}</Text>
              <MaterialCommunityIcons name="eye-outline" size={24} color={colors.primary} />
            </View>
            
            <View style={{ gap: 4, marginTop: 5 }}>
              {config.parts.slice(0, 3).map((part: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={part.icon} size={14} color={colors.primary} />
                  <Text style={{ marginLeft: 8, color: colors.textDark, fontSize: 13 }}>{part.name}</Text>
                </View>
              ))}
              {config.parts.length > 3 && (
                <Text style={{ fontSize: 11, color: colors.gray, marginLeft: 22 }}>
                  + {config.parts.length - 3} więcej...
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={globalStyles.mainAddButton} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle" size={50} color={colors.white} />
          <Text style={[globalStyles.buttonText, { marginLeft: 10 }]}>STWÓRZ NOWY</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL 1: SZCZEGÓŁY KONFIGURACJI */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            {selectedConfig && (
              <>
                <View style={[globalStyles.configHeader, { borderBottomWidth: 2 }]}>
                  <Text style={[globalStyles.configTitle, { fontSize: 20 }]}>{selectedConfig.title}</Text>
                  <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                    <MaterialCommunityIcons name="close-circle" size={30} color={colors.gray} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 300, marginVertical: 10 }}>
                  {selectedConfig.parts.map((part: any, idx: number) => (
                    <View key={idx} style={[globalStyles.card, { marginHorizontal: 0, padding: 10, marginBottom: 8 }]}>
                      <MaterialCommunityIcons name={part.icon} size={24} color={colors.primary} />
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{part.name}</Text>
                        <Text style={{ color: colors.primary, fontSize: 12 }}>{part.price}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removePartFromConfig(part.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={{ padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10, marginBottom: 15 }}>
                  <Text style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 16 }}>
                    Suma: {selectedConfig.parts.reduce((acc: number, curr: any) => acc + parseInt(curr.price.replace(' zł', '')), 0)} zł
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[globalStyles.buttonPrimary, { backgroundColor: '#4CAF50', marginBottom: 10 }]} 
                  onPress={() => setAddPartModalVisible(true)}
                >
                  <Text style={globalStyles.buttonText}>+ DODAJ CZĘŚĆ</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[globalStyles.buttonPrimary, { backgroundColor: colors.error }]} 
                  onPress={() => deleteEntireConfig(selectedConfig.id)}
                >
                  <Text style={globalStyles.buttonText}>USUŃ CAŁY ZESTAW</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: DODAWANIE CZĘŚCI DO ISTNIEJĄCEGO ZESTAWU */}
      <Modal visible={addPartModalVisible} animationType="fade" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={[globalStyles.modalContent, { height: '70%' }]}>
            <Text style={[globalStyles.headerText, { color: colors.textDark, marginBottom: 15 }]}>Wybierz podzespół</Text>
            <FlatList
              data={MOCK_COMPONENTS}
              keyExtractor={(item) => "add_" + item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={globalStyles.modalItem} onPress={() => addPartToCurrentConfig(item)}>
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={colors.primary} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                    <Text style={{ color: colors.gray, fontSize: 12 }}>{item.price}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={[globalStyles.buttonPrimary, { backgroundColor: colors.gray, marginTop: 10 }]} 
              onPress={() => setAddPartModalVisible(false)}
            >
              <Text style={globalStyles.buttonText}>ANULUJ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: TWORZENIE NOWEGO ZESTAWU */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={globalStyles.modalOverlay}>
          <View style={globalStyles.modalContent}>
            <Text style={[globalStyles.headerText, { color: colors.textDark, marginTop: 0 }]}>Nowa Konfiguracja</Text>
            <TextInput 
              style={globalStyles.input} 
              placeholder="Nazwa zestawu..." 
              value={newConfigName} 
              onChangeText={setNewConfigName} 
            />
            <FlatList
              data={MOCK_COMPONENTS}
              keyExtractor={(item) => "new_" + item.id}
              renderItem={({ item }) => {
                const isSelected = tempSelectedItems.find(i => i.id === item.id);
                return (
                  <TouchableOpacity 
                    style={[globalStyles.modalItem, isSelected && { backgroundColor: '#f9f9f9' }]} 
                    onPress={() => {
                      isSelected 
                        ? setTempSelectedItems(tempSelectedItems.filter(i => i.id !== item.id)) 
                        : setTempSelectedItems([...tempSelectedItems, item]);
                    }}
                  >
                    <MaterialCommunityIcons name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={colors.primary} />
                    <Text style={{ marginLeft: 10 }}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity style={[globalStyles.buttonPrimary, { backgroundColor: colors.gray, flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={globalStyles.buttonText}>ANULUJ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.buttonPrimary, { flex: 1 }]} onPress={saveNewConfig}>
                <Text style={globalStyles.buttonText}>ZAPISZ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}