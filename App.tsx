import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POKEMON_LIST, Pokemon } from './pokemon';

export default function App() {
  const [query, setQuery] = useState('');

  const filteredList = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return POKEMON_LIST;
    return POKEMON_LIST.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
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
            placeholder=""
            style={styles.searchInput}
          />
          <Ionicons name="mic-outline" size={20} color="#333" />
        </View>

        <Text style={styles.sectionLabel}>Pokémons</Text>

        <View style={styles.listContainer}>
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
    </SafeAreaView>
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
    marginTop: 20,
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
    marginBottom: 20,
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
});