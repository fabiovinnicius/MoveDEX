import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { POKEMON_LIST, Pokemon } from './pokemon';

export default function App() {
  const [activeTab, setActiveTab] = useState('Pokemons');

  return (
    <View style={[styles.safeArea, activeTab === 'Dex' && { backgroundColor: '#E4B688' }]}>
      {activeTab === 'Pokemons' && <HomeScreen />}
      {activeTab === 'Dex' && <DexScreen />}
      
      <View style={styles.navWrapper}>
        <BottomNavigation activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>
    </View>
  );
}

function HomeScreen() {
  const [query, setQuery] = useState('');

  const filteredList = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return POKEMON_LIST;
    return POKEMON_LIST.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MoveDex</Text>
        <Text style={styles.subtitle}>Listagem de informações</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#333" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar Pokémon"
          placeholderTextColor="#888888"
          style={styles.searchInput}
        />
        <Ionicons name="mic-outline" size={20} color="#333" />
      </View>

      <Text style={styles.sectionLabel}>Pokémons</Text>

      <View style={[styles.listContainer, { marginBottom: 110 }]}>
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PokemonRow pokemon={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

function DexScreen() {
  return (
    <View style={styles.dexContainer}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.dexScrollView}>
        
        <View style={styles.dexScrollHeader}>
          <View style={styles.dexHeaderRow}>
            <View />
            <View style={styles.favoriteCircle}>
              <Ionicons name="star" size={18} color="#000" />
            </View>
          </View>
          
          <View style={styles.dexImageWrapper}>
            <Image 
              source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' }} 
              style={styles.dexMainImage} 
            />
          </View>
          
          <View style={styles.dexTitleContainer}>
            <Text style={styles.dexTitle}>Charmander</Text>
            <Text style={styles.dexId}>#004</Text>
          </View>
        </View>
        
        <View style={styles.dexCard}>
          <Text style={styles.dexSectionTitle}>Descrição da Pokedex</Text>
          <Text style={styles.dexDescription}>
            Charmander é um Pokémon bípede do tipo Fogo, conhecido pela chama em sua cauda. Ele mede 0,6 metros e pesa 8,5 kg. A chama em sua cauda nasce com ele e indica a sua saúde e o seu humor. Se a chama apagar, sua vida chegará ao fim.
          </Text>

          <View style={styles.dexTypesRow}>
            <View style={styles.dexTypeCol}>
              <Text style={styles.dexSectionTitle}>Ideal contra</Text>
              <View style={styles.badgesRow}>
                <Badge label="Planta" color="#4CAF50" />
                <Badge label="Gelo" color="#00BCD4" />
                <Badge label="Inseto" color="#8BC34A" />
                <Badge label="Aço" color="#9E9E9E" />
              </View>
            </View>
            <View style={styles.dexTypeCol}>
              <Text style={styles.dexSectionTitle}>Fraco contra</Text>
              <View style={styles.badgesRow}>
                <Badge label="Água" color="#2196F3" />
                <Badge label="Pedra" color="#795548" />
                <Badge label="Terrestre" color="#8D6E63" />
              </View>
            </View>
          </View>

          <Text style={styles.dexSectionTitle}>Linha evolutiva</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evolutionsContainer}>
            <EvolutionCard name="Charmeleon" id="#005" image="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png" />
            <EvolutionCard name="Charizard" id="#006" image="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" />
          </ScrollView>

          <Text style={styles.dexSectionTitle}>Movimentos mais utilizados</Text>
          <Text style={styles.dexSubTitle}>Pokemon Black and White</Text>
          
          <MoveCard type="Fogo" typeColor="#FF9800" name="Flamethrower" pp="15/15" power="90" accuracy="100" />
          <MoveCard type="Fogo" typeColor="#FF9800" name="Fire Blast" pp="5/5" power="110" accuracy="85" />
          <MoveCard type="Fogo" typeColor="#FF9800" name="Overheat" pp="5/5" power="130" accuracy="90" />
          
          <Text style={styles.dexSubTitle}>Pokemon Heart and Gold</Text>
          <MoveCard type="Dragão" typeColor="#3F51B5" name="Dragon Pulse" pp="10/10" power="85" accuracy="100" />
        </View>
      </ScrollView>
    </View>
  );
}

function Badge({ label, color }: { label: string, color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function EvolutionCard({ name, id, image }: any) {
  return (
    <View style={styles.evoCard}>
      <Image source={{ uri: image }} style={styles.evoImage} />
      <Text style={styles.evoName}>{name}</Text>
      <Text style={styles.evoId}>{id}</Text>
    </View>
  );
}

function MoveCard({ type, typeColor, name, pp, power, accuracy }: any) {
  return (
    <View style={styles.moveCard}>
      <View style={styles.moveHeaderRow}>
        <Badge label={type} color={typeColor} />
        <Text style={styles.moveName}>{name}</Text>
      </View>
      <Text style={styles.moveStats}>PP: {pp}  POWER: {power}  ACCURACY: {accuracy}</Text>
    </View>
  );
}

function BottomNavigation({ activeTab, onChangeTab }: any) {
  return (
    <BlurView intensity={90} tint="light" style={styles.navContainer}>
      <TouchableOpacity 
        style={activeTab === 'Pokemons' ? styles.navItemActive : styles.navItem}
        onPress={() => onChangeTab('Pokemons')}
      >
        <Ionicons 
          name={activeTab === 'Pokemons' ? 'list' : 'list-outline'} 
          size={24} 
          color={activeTab === 'Pokemons' ? '#007AFF' : '#000'} 
        />
        <Text style={activeTab === 'Pokemons' ? styles.navTextActive : styles.navText}>Pokemons</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={activeTab === 'Dex' ? styles.navItemActive : styles.navItem}
        onPress={() => onChangeTab('Dex')}
      >
        <Ionicons 
          name={activeTab === 'Dex' ? 'book' : 'book-outline'} 
          size={24} 
          color={activeTab === 'Dex' ? '#007AFF' : '#000'} 
        />
        <Text style={activeTab === 'Dex' ? styles.navTextActive : styles.navText}>Dex</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={activeTab === 'Profile' ? styles.navItemActive : styles.navItem}
        onPress={() => onChangeTab('Profile')}
      >
        <Ionicons 
          name={activeTab === 'Profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeTab === 'Profile' ? '#007AFF' : '#000'} 
        />
        <Text style={activeTab === 'Profile' ? styles.navTextActive : styles.navText}>Profile</Text>
      </TouchableOpacity>
    </BlurView>
  );
}

function PokemonRow({ pokemon }: { pokemon: Pokemon }) {
  return (
    <View style={styles.row}>
      <View style={styles.spriteContainer}>
        <Image source={{ uri: pokemon.spriteUrl }} style={styles.sprite} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.pokemonName}>{pokemon.name}</Text>
        <Text style={styles.pokemonId}>#{pokemon.id}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9E8DA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  header: {
    marginTop: 65, 
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2B2B2B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A4A4A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3D8C3',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 24,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2B2B2B',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 12,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 110,
  },
  listContent: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  spriteContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  sprite: {
    width: 48,
    height: 48,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  pokemonName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2B2B2B',
    marginBottom: 4,
  },
  pokemonId: {
    fontSize: 14,
    color: '#999999',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 16,
    marginRight: 16,
  },
  dexContainer: {
    flex: 1,
  },
  dexScrollView: {
    flex: 1,
  },
  dexScrollHeader: {
    paddingHorizontal: 22,
    paddingTop: 55, 
    paddingBottom: 20,
  },
  dexHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dexImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  dexMainImage: {
    width: 220,
    height: 220,
  },
  dexTitleContainer: {
    marginTop: 10,
  },
  dexTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  dexId: {
    fontSize: 16,
    color: '#333333',
    marginTop: 4,
  },
  dexCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    marginHorizontal: 22,
    paddingTop: 32,
    paddingHorizontal: 22,
    paddingBottom: 160,
  },
  dexSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  dexDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    marginBottom: 24,
  },
  dexTypesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dexTypeCol: {
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  evolutionsContainer: {
    marginBottom: 24,
    height: 155, 
  },
  evoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 140,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  evoImage: {
    width: 70,
    height: 70,
    marginBottom: 6,
  },
  evoName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  evoId: {
    fontSize: 12,
    color: '#999999',
  },
  dexSubTitle: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 12,
    marginTop: 8,
  },
  moveCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  moveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  moveName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  moveStats: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  navWrapper: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    height: 76,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85, 
    height: 60,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DEDEDE',
    width: 85, 
    height: 60,
    borderRadius: 30,
  },
  navText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
});