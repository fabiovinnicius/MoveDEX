import React, { useMemo, useState, useEffect, useCallback, createContext, useContext } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const typeTranslations: any = {
  grass: 'Planta', poison: 'Venenoso', fire: 'Fogo', water: 'Água',
  bug: 'Inseto', flying: 'Voador', normal: 'Normal', electric: 'Elétrico',
  ground: 'Terrestre', fairy: 'Fada', fighting: 'Lutador', psychic: 'Psíquico',
  rock: 'Pedra', steel: 'Aço', ice: 'Gelo', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio'
};

const ptColors: any = {
  Planta: '#4CAF50', Venenoso: '#9C27B0', Fogo: '#F44336', Água: '#2196F3',
  Inseto: '#8BC34A', Voador: '#03A9F4', Normal: '#9E9E9E', Elétrico: '#FFEB3B',
  Terrestre: '#795548', Fada: '#E91E63', Lutador: '#FF5722', Psíquico: '#E040FB',
  Pedra: '#795548', Aço: '#9E9E9E', Gelo: '#00BCD4', Fantasma: '#673AB7', Dragão: '#3F51B5', Sombrio: '#212121'
};

const bgColors: any = {
  Planta: '#A5D6A7', Venenoso: '#CE93D8', Fogo: '#EF9A9A', Água: '#90CAF9',
  Inseto: '#C5E1A5', Voador: '#B3E5FC', Normal: '#EEEEEE', Elétrico: '#FFF59D',
  Terrestre: '#BCAAA4', Fada: '#F8BBD0', Lutador: '#FFAB91', Psíquico: '#CE93D8',
  Pedra: '#D7CCC8', Aço: '#CFD8DC', Gelo: '#B2EBF2', Fantasma: '#B39DDB', Dragão: '#9FA8DA', Sombrio: '#BDBDBD'
};

const POKEMON_TYPES = [
  { id: 'fire', label: 'Fogo', color: '#F44336' },
  { id: 'water', label: 'Água', color: '#2196F3' },
  { id: 'grass', label: 'Planta', color: '#4CAF50' },
  { id: 'electric', label: 'Elétrico', color: '#FFEB3B' },
  { id: 'normal', label: 'Normal', color: '#9E9E9E' },
  { id: 'ice', label: 'Gelo', color: '#00BCD4' },
  { id: 'fighting', label: 'Lutador', color: '#FF5722' },
  { id: 'poison', label: 'Venenoso', color: '#9C27B0' },
  { id: 'ground', label: 'Terrestre', color: '#795548' },
  { id: 'flying', label: 'Voador', color: '#03A9F4' },
  { id: 'psychic', label: 'Psíquico', color: '#E040FB' },
  { id: 'bug', label: 'Inseto', color: '#8BC34A' },
  { id: 'rock', label: 'Pedra', color: '#795548' },
  { id: 'ghost', label: 'Fantasma', color: '#673AB7' },
  { id: 'dragon', label: 'Dragão', color: '#3F51B5' },
  { id: 'dark', label: 'Sombrio', color: '#212121' },
  { id: 'steel', label: 'Aço', color: '#9E9E9E' },
  { id: 'fairy', label: 'Fada', color: '#E91E63' },
];

type FavoriteItem = { id: number; name: string; image: string };

const FavoritesContext = createContext<{
  favorites: FavoriteItem[];
  toggleFavorite: (pokemon: FavoriteItem) => void;
  isFavorite: (id: number) => boolean;
}>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
});

export const FavoritesProvider = ({ children }: any) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const stored = await AsyncStorage.getItem('@pokedex_favorites');
        if (stored) setFavorites(JSON.parse(stored));
      } catch (e) { console.error(e); }
    }
    loadFavorites();
  }, []);

  const toggleFavorite = async (pokemon: FavoriteItem) => {
    let newFavorites;
    if (favorites.find(f => f.id === pokemon.id)) {
      newFavorites = favorites.filter(f => f.id !== pokemon.id);
    } else {
      newFavorites = [...favorites, pokemon];
    }
    setFavorites(newFavorites);
    try {
      await AsyncStorage.setItem('@pokedex_favorites', JSON.stringify(newFavorites));
    } catch (e) { console.error(e); }
  };

  const isFavorite = (id: number) => favorites.some(f => f.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

const REGIONS = [
  { id: '1', name: 'Kanto', desc: 'Pokémon Red/Blue/Yellow', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: '2', name: 'Johto', desc: 'Pokémon Gold/Silver/Crystal', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png' },
  { id: '3', name: 'Hoenn', desc: 'Pokémon Ruby/Sapphire/Emerald', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png' },
  { id: '4', name: 'Sinnoh', desc: 'Pokémon Diamond/Pearl', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/393.png' },
  { id: '5', name: 'Unova', desc: 'Pokémon Black/White', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/495.png' },
  { id: '6', name: 'Galar', desc: 'Sword/Shield', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png' },
];

const img = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const mv = (type: string, name: string, stats: string) => ({ type, typeColor: ptColors[type], name, stats });

const loreleiTeam = [
  { name: 'Dewgong', id: '#087', image: img(87), moves: [mv('Água', 'Aurora Beam', 'PP: 20 PWR: 65 ACC: 100'), mv('Normal', 'Take Down', 'PP: 20 PWR: 90 ACC: 85'), mv('Gelo', 'Rest', 'PP: 10 PWR: - ACC: -')] },
  { name: 'Cloyster', id: '#091', image: img(91), moves: [mv('Água', 'Clamp', 'PP: 10 PWR: 35 ACC: 75'), mv('Gelo', 'Aurora Beam', 'PP: 20 PWR: 65 ACC: 100'), mv('Normal', 'Supersonic', 'PP: 20 PWR: - ACC: 55')] },
  { name: 'Slowbro', id: '#080', image: img(80), moves: [mv('Água', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100'), mv('Psíquico', 'Amnesia', 'PP: 20 PWR: - ACC: -'), mv('Normal', 'Growl', 'PP: 40 PWR: - ACC: 100')] },
  { name: 'Jynx', id: '#124', image: img(124), moves: [mv('Gelo', 'Ice Punch', 'PP: 15 PWR: 75 ACC: 100'), mv('Normal', 'Thrash', 'PP: 20 PWR: 90 ACC: 100'), mv('Normal', 'Doubleslap', 'PP: 10 PWR: 15 ACC: 85')] },
  { name: 'Lapras', id: '#131', image: img(131), moves: [mv('Gelo', 'Blizzard', 'PP: 5 PWR: 120 ACC: 90'), mv('Água', 'Hydro Pump', 'PP: 5 PWR: 120 ACC: 80'), mv('Normal', 'Body Slam', 'PP: 15 PWR: 85 ACC: 100')] }
];
const brunoTeam = [
  { name: 'Onix', id: '#095', image: img(95), moves: [mv('Pedra', 'Rock Throw', 'PP: 15 PWR: 50 ACC: 65'), mv('Normal', 'Rage', 'PP: 20 PWR: 20 ACC: 100')] },
  { name: 'Hitmonchan', id: '#107', image: img(107), moves: [mv('Fogo', 'Fire Punch', 'PP: 15 PWR: 75 ACC: 100'), mv('Gelo', 'Ice Punch', 'PP: 15 PWR: 75 ACC: 100'), mv('Elétrico', 'Thunder Punch', 'PP: 15 PWR: 75 ACC: 100')] },
  { name: 'Hitmonlee', id: '#106', image: img(106), moves: [mv('Lutador', 'Jump Kick', 'PP: 25 PWR: 70 ACC: 95'), mv('Lutador', 'Double Kick', 'PP: 30 PWR: 30 ACC: 100'), mv('Lutador', 'Rolling Kick', 'PP: 15 PWR: 60 ACC: 85')] },
  { name: 'Onix', id: '#095', image: img(95), moves: [mv('Normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('Pedra', 'Rock Throw', 'PP: 15 PWR: 50 ACC: 65')] },
  { name: 'Machamp', id: '#068', image: img(68), moves: [mv('Lutador', 'Karate Chop', 'PP: 25 PWR: 50 ACC: 100'), mv('Lutador', 'Submission', 'PP: 20 PWR: 80 ACC: 80')] }
];
const agathaTeam = [
  { name: 'Gengar', id: '#094', image: img(94), moves: [mv('Fantasma', 'Confuse Ray', 'PP: 10 PWR: - ACC: 100'), mv('Psíquico', 'Dream Eater', 'PP: 15 PWR: 100 ACC: 100')] },
  { name: 'Golbat', id: '#042', image: img(42), moves: [mv('Voador', 'Wing Attack', 'PP: 35 PWR: 35 ACC: 100'), mv('Gelo', 'Haze', 'PP: 30 PWR: - ACC: -')] },
  { name: 'Haunter', id: '#093', image: img(93), moves: [mv('Fantasma', 'Night Shade', 'PP: 15 PWR: - ACC: 100'), mv('Psíquico', 'Hypnosis', 'PP: 20 PWR: - ACC: 60')] },
  { name: 'Arbok', id: '#024', image: img(24), moves: [mv('Normal', 'Wrap', 'PP: 20 PWR: 15 ACC: 85'), mv('Normal', 'Glare', 'PP: 30 PWR: - ACC: 75'), mv('Venenoso', 'Acid', 'PP: 30 PWR: 40 ACC: 100')] },
  { name: 'Gengar', id: '#094', image: img(94), moves: [mv('Venenoso', 'Toxic', 'PP: 10 PWR: - ACC: 85'), mv('Fantasma', 'Night Shade', 'PP: 15 PWR: - ACC: 100'), mv('Psíquico', 'Dream Eater', 'PP: 15 PWR: 100 ACC: 100')] }
];
const lanceTeam = [
  { name: 'Gyarados', id: '#130', image: img(130), moves: [mv('Água', 'Hydro Pump', 'PP: 5 PWR: 120 ACC: 80'), mv('Dragão', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100'), mv('Normal', 'Bite', 'PP: 25 PWR: 60 ACC: 100')] },
  { name: 'Dragonair', id: '#148', image: img(148), moves: [mv('Normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('Dragão', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100')] },
  { name: 'Dragonair', id: '#148', image: img(148), moves: [mv('Normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('Dragão', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100')] },
  { name: 'Aerodactyl', id: '#142', image: img(142), moves: [mv('Normal', 'Hyper Beam', 'PP: 5 PWR: 150 ACC: 90'), mv('Normal', 'Bite', 'PP: 25 PWR: 60 ACC: 100')] },
  { name: 'Dragonite', id: '#149', image: img(149), moves: [mv('Normal', 'Hyper Beam', 'PP: 5 PWR: 150 ACC: 90'), mv('Normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('Psíquico', 'Barrier', 'PP: 30 PWR: - ACC: -')] }
];

const KANTO_CHARACTERS = [
  { 
    id: '1', name: 'Brock', role: 'gym_leader', desc: 'Cidade de Pewter', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png', color: '#D4C294',
    about: 'Brock é o líder de academia do Pewter City Gym e é especialista em Pokémon do tipo Pedra. Ele dá a Insígnia da Rocha aos treinadores que o derrotam.',
    mainType: { label: 'Pedra', color: '#795548' },
    weaknesses: [{ label: 'Água', color: '#2196F3' }, { label: 'Planta', color: '#4CAF50' }, { label: 'Lutador', color: '#FF5722' }],
    reward: { badgeName: 'Insígnia da Rocha', badgeDesc: 'Pokémons até o nível 20 obedecem suas ordens', tmType: 'Pedra', tmTypeColor: '#795548', tmName: 'TM34 Bide', tmStats: 'PP: 10/10' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Geodude', id: '#074', image: img(74), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Pedra', 'Bide', 'PP: 10 PWR: - ACC: 100')] },
        { name: 'Onix', id: '#095', image: img(95), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Pedra', 'Bide', 'PP: 10 PWR: - ACC: 100'), mv('Normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85')] }
      ],
      'yellow': [
        { name: 'Geodude', id: '#074', image: img(74), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100')] },
        { name: 'Onix', id: '#095', image: img(95), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Pedra', 'Bide', 'PP: 10 PWR: - ACC: 100'), mv('Normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85'), mv('Normal', 'Screech', 'PP: 40 PWR: - ACC: 85')] }
      ]
    }
  },
  { 
    id: '2', name: 'Misty', role: 'gym_leader', desc: 'Cidade de Cerulean', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png', color: '#92D2EF',
    about: 'Misty é a líder de academia do Cerulean City Gym e é especialista em Pokémon do tipo Água. Ela dá o Distintivo Cascade aos treinadores que a derrotam.',
    mainType: { label: 'Água', color: '#2196F3' },
    weaknesses: [{ label: 'Planta', color: '#4CAF50' }, { label: 'Elétrico', color: '#FFEB3B' }],
    reward: { badgeName: 'Insígnia da Cascata', badgeDesc: 'Pokémons até o nível 30 obedecem suas ordens', tmType: 'Água', tmTypeColor: '#2196F3', tmName: "TM03 Water Pulse", tmStats: 'PP: 20/20' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Staryu', id: '#120', image: img(120), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Água', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100')] },
        { name: 'Starmie', id: '#121', image: img(121), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Água', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100'), mv('Água', 'Bubble Beam', 'PP: 20 PWR: 65 ACC: 100')] }
      ],
      'yellow': [
        { name: 'Staryu', id: '#120', image: img(120), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Água', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100')] },
        { name: 'Starmie', id: '#121', image: img(121), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Água', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100'), mv('Água', 'Bubble Beam', 'PP: 20 PWR: 65 ACC: 100'), mv('Normal', 'Harden', 'PP: 30 PWR: - ACC: -')] }
      ]
    }
  },
  { 
    id: '3', name: 'Lt. Surge', role: 'gym_leader', desc: 'Cidade de Vermilion', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png', color: '#FFF59D',
    about: 'Conhecido como o Raio Americano, Lt. Surge é um veterano durão que usa Pokémons elétricos para paralisar seus oponentes.',
    mainType: { label: 'Elétrico', color: '#FFEB3B' },
    weaknesses: [{ label: 'Terrestre', color: '#795548' }],
    reward: { badgeName: 'Insígnia do Trovão', badgeDesc: 'Aumenta a Velocidade dos seus Pokémons', tmType: 'Elétrico', tmTypeColor: '#FFEB3B', tmName: "TM24 Thunderbolt", tmStats: 'PP: 15/15' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Voltorb', id: '#100', image: img(100), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Normal', 'Screech', 'PP: 40 PWR: - ACC: 85'), mv('Normal', 'Sonic Boom', 'PP: 20 PWR: - ACC: 90')] },
        { name: 'Pikachu', id: '#025', image: img(25), moves: [mv('Normal', 'Growl', 'PP: 40 PWR: - ACC: 100'), mv('Normal', 'Quick Attack', 'PP: 30 PWR: 40 ACC: 100'), mv('Elétrico', 'Thunder Wave', 'PP: 20 PWR: - ACC: 100')] },
        { name: 'Raichu', id: '#026', image: img(26), moves: [mv('Elétrico', 'Thunderbolt', 'PP: 15 PWR: 90 ACC: 100'), mv('Normal', 'Growl', 'PP: 40 PWR: - ACC: 100')] }
      ],
      'yellow': [
        { name: 'Raichu', id: '#026', image: img(26), moves: [mv('Elétrico', 'Thunderbolt', 'PP: 15 PWR: 90 ACC: 100'), mv('Normal', 'Mega Punch', 'PP: 20 PWR: 80 ACC: 85'), mv('Normal', 'Mega Kick', 'PP: 5 PWR: 120 ACC: 75'), mv('Normal', 'Growl', 'PP: 40 PWR: - ACC: 100')] }
      ]
    }
  },
  { 
    id: '4', name: 'Erika', role: 'gym_leader', desc: 'Cidade de Celadon', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/erika.png', color: '#A5D6A7',
    about: 'Erika ama a natureza e ensina arranjos de flores. Ela usa Pokémons do tipo Planta, drenando a energia dos adversários.',
    mainType: { label: 'Planta', color: '#4CAF50' },
    weaknesses: [{ label: 'Fogo', color: '#F44336' }, { label: 'Voador', color: '#03A9F4' }, { label: 'Gelo', color: '#00BCD4' }],
    reward: { badgeName: 'Insígnia do Arco-Íris', badgeDesc: 'Pokémons até o nível 50 obedecem suas ordens', tmType: 'Planta', tmTypeColor: '#4CAF50', tmName: "TM21 Mega Drain", tmStats: 'PP: 15/15' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Victreebel', id: '#071', image: img(71), moves: [mv('Planta', 'Razor Leaf', 'PP: 25 PWR: 55 ACC: 95'), mv('Venenoso', 'Poison Powder', 'PP: 35 PWR: - ACC: 75'), mv('Planta', 'Sleep Powder', 'PP: 15 PWR: - ACC: 75')] },
        { name: 'Tangela', id: '#114', image: img(114), moves: [mv('Normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85'), mv('Normal', 'Constrict', 'PP: 35 PWR: 10 ACC: 100')] },
        { name: 'Vileplume', id: '#045', image: img(45), moves: [mv('Planta', 'Petal Dance', 'PP: 20 PWR: 70 ACC: 100'), mv('Planta', 'Mega Drain', 'PP: 10 PWR: 40 ACC: 100'), mv('Planta', 'Sleep Powder', 'PP: 15 PWR: - ACC: 75')] }
      ],
      'yellow': [
        { name: 'Tangela', id: '#114', image: img(114), moves: [mv('Normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85'), mv('Planta', 'Vine Whip', 'PP: 10 PWR: 35 ACC: 100')] },
        { name: 'Weepinbell', id: '#070', image: img(70), moves: [mv('Planta', 'Razor Leaf', 'PP: 25 PWR: 55 ACC: 95'), mv('Planta', 'Sleep Powder', 'PP: 15 PWR: - ACC: 75')] },
        { name: 'Gloom', id: '#044', image: img(44), moves: [mv('Planta', 'Petal Dance', 'PP: 20 PWR: 70 ACC: 100'), mv('Planta', 'Mega Drain', 'PP: 10 PWR: 40 ACC: 100')] }
      ]
    }
  },
  { 
    id: '5', name: 'Koga', role: 'gym_leader', desc: 'Cidade de Fuchsia', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/koga.png', color: '#CE93D8',
    about: 'Koga é um mestre ninja que utiliza táticas de envenenamento e confusão com seus Pokémons do tipo Venenoso.',
    mainType: { label: 'Venenoso', color: '#9C27B0' },
    weaknesses: [{ label: 'Terrestre', color: '#795548' }, { label: 'Psíquico', color: '#E040FB' }],
    reward: { badgeName: 'Insígnia da Alma', badgeDesc: 'Aumenta a Defesa dos seus Pokémons', tmType: 'Venenoso', tmTypeColor: '#9C27B0', tmName: "TM06 Toxic", tmStats: 'PP: 10/10' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Koffing', id: '#109', image: img(109), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Venenoso', 'Smog', 'PP: 20 PWR: 20 ACC: 70')] },
        { name: 'Muk', id: '#089', image: img(89), moves: [mv('Normal', 'Disable', 'PP: 20 PWR: - ACC: 100'), mv('Venenoso', 'Poison Gas', 'PP: 40 PWR: - ACC: 55'), mv('Venenoso', 'Sludge', 'PP: 20 PWR: 65 ACC: 100')] },
        { name: 'Koffing', id: '#109', image: img(109), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Normal', 'Smokescreen', 'PP: 20 PWR: - ACC: 100')] },
        { name: 'Weezing', id: '#110', image: img(110), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Venenoso', 'Toxic', 'PP: 10 PWR: - ACC: 85'), mv('Venenoso', 'Sludge', 'PP: 20 PWR: 65 ACC: 100')] }
      ],
      'yellow': [
        { name: 'Venonat', id: '#048', image: img(48), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Venenoso', 'Poison Powder', 'PP: 35 PWR: - ACC: 75'), mv('Planta', 'Sleep Powder', 'PP: 15 PWR: - ACC: 75')] },
        { name: 'Venonat', id: '#048', image: img(48), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Venenoso', 'Poison Powder', 'PP: 35 PWR: - ACC: 75'), mv('Normal', 'Supersonic', 'PP: 20 PWR: - ACC: 55')] },
        { name: 'Venonat', id: '#048', image: img(48), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Venenoso', 'Poison Powder', 'PP: 35 PWR: - ACC: 75')] },
        { name: 'Venomoth', id: '#049', image: img(49), moves: [mv('Normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('Venenoso', 'Toxic', 'PP: 10 PWR: - ACC: 85'), mv('Psíquico', 'Psybeam', 'PP: 20 PWR: 65 ACC: 100')] }
      ]
    }
  },
  { 
    id: '6', name: 'Sabrina', role: 'gym_leader', desc: 'Cidade de Saffron', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/sabrina.png', color: '#F8BBD0',
    about: 'Sabrina possui poderes psíquicos desde criança. Ela e seus Pokémons enxergam o futuro durante as batalhas.',
    mainType: { label: 'Psíquico', color: '#E040FB' },
    weaknesses: [{ label: 'Inseto', color: '#8BC34A' }, { label: 'Fantasma', color: '#673AB7' }],
    reward: { badgeName: 'Insígnia do Pântano', badgeDesc: 'Pokémons até o nível 70 obedecem suas ordens', tmType: 'Psíquico', tmTypeColor: '#E040FB', tmName: "TM46 Psywave", tmStats: 'PP: 15/15' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Kadabra', id: '#064', image: img(64), moves: [mv('Normal', 'Disable', 'PP: 20 PWR: - ACC: 100'), mv('Psíquico', 'Psybeam', 'PP: 20 PWR: 65 ACC: 100'), mv('Normal', 'Recover', 'PP: 20 PWR: - ACC: -')] },
        { name: 'Mr. Mime', id: '#122', image: img(122), moves: [mv('Psíquico', 'Confusion', 'PP: 25 PWR: 50 ACC: 100'), mv('Psíquico', 'Barrier', 'PP: 30 PWR: - ACC: -'), mv('Normal', 'Doubleslap', 'PP: 10 PWR: 15 ACC: 85')] },
        { name: 'Venomoth', id: '#049', image: img(49), moves: [mv('Venenoso', 'Poison Powder', 'PP: 35 PWR: - ACC: 75'), mv('Inseto', 'Leech Life', 'PP: 15 PWR: 20 ACC: 100'), mv('Psíquico', 'Psybeam', 'PP: 20 PWR: 65 ACC: 100')] },
        { name: 'Alakazam', id: '#065', image: img(65), moves: [mv('Psíquico', 'Psywave', 'PP: 15 PWR: - ACC: 80'), mv('Normal', 'Recover', 'PP: 20 PWR: - ACC: -'), mv('Psíquico', 'Reflect', 'PP: 20 PWR: - ACC: -')] }
      ],
      'yellow': [
        { name: 'Abra', id: '#063', image: img(63), moves: [mv('Normal', 'Flash', 'PP: 20 PWR: - ACC: 70')] },
        { name: 'Kadabra', id: '#064', image: img(64), moves: [mv('Psíquico', 'Psywave', 'PP: 15 PWR: - ACC: 80'), mv('Normal', 'Recover', 'PP: 20 PWR: - ACC: -')] },
        { name: 'Alakazam', id: '#065', image: img(65), moves: [mv('Psíquico', 'Psywave', 'PP: 15 PWR: - ACC: 80'), mv('Normal', 'Recover', 'PP: 20 PWR: - ACC: -')] }
      ]
    }
  },
  { 
    id: '7', name: 'Blaine', role: 'gym_leader', desc: 'Ilha Cinnabar', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/blaine.png', color: '#EF9A9A',
    about: 'Um brilhante cientista apaixonado por charadas. Blaine incinera os desafiantes com Pokémons do tipo Fogo.',
    mainType: { label: 'Fogo', color: '#F44336' },
    weaknesses: [{ label: 'Água', color: '#2196F3' }, { label: 'Terrestre', color: '#795548' }, { label: 'Pedra', color: '#795548' }],
    reward: { badgeName: 'Insígnia do Vulcão', badgeDesc: 'Aumenta o Special Attack', tmType: 'Fogo', tmTypeColor: '#F44336', tmName: "TM38 Fire Blast", tmStats: 'PP: 5/5' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Growlithe', id: '#058', image: img(58), moves: [mv('Normal', 'Bite', 'PP: 25 PWR: 60 ACC: 100'), mv('Normal', 'Take Down', 'PP: 20 PWR: 90 ACC: 85'), mv('Psíquico', 'Agility', 'PP: 30 PWR: - ACC: -')] },
        { name: 'Ponyta', id: '#077', image: img(77), moves: [mv('Normal', 'Tail Whip', 'PP: 30 PWR: - ACC: 100'), mv('Fogo', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] },
        { name: 'Rapidash', id: '#078', image: img(78), moves: [mv('Normal', 'Stomp', 'PP: 20 PWR: 65 ACC: 100'), mv('Normal', 'Growl', 'PP: 40 PWR: - ACC: 100'), mv('Fogo', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] },
        { name: 'Arcanine', id: '#059', image: img(59), moves: [mv('Normal', 'Take Down', 'PP: 20 PWR: 90 ACC: 85'), mv('Fogo', 'Fire Blast', 'PP: 5 PWR: 120 ACC: 85')] }
      ],
      'yellow': [
        { name: 'Ninetales', id: '#038', image: img(38), moves: [mv('Normal', 'Tail Whip', 'PP: 30 PWR: - ACC: 100'), mv('Fogo', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] },
        { name: 'Rapidash', id: '#078', image: img(78), moves: [mv('Normal', 'Stomp', 'PP: 20 PWR: 65 ACC: 100'), mv('Fogo', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] },
        { name: 'Arcanine', id: '#059', image: img(59), moves: [mv('Fogo', 'Fire Blast', 'PP: 5 PWR: 120 ACC: 85'), mv('Normal', 'Take Down', 'PP: 20 PWR: 90 ACC: 85')] }
      ]
    }
  },
  { 
    id: '8', name: 'Giovanni', role: 'gym_leader', desc: 'Cidade de Viridian', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png', color: '#BCAAA4',
    about: 'O chefe misterioso da Equipe Rocket. Ele utiliza força esmagadora com Pokémons do tipo Terrestre.',
    mainType: { label: 'Terrestre', color: '#795548' },
    weaknesses: [{ label: 'Água', color: '#2196F3' }, { label: 'Planta', color: '#4CAF50' }, { label: 'Gelo', color: '#00BCD4' }],
    reward: { badgeName: 'Insígnia da Terra', badgeDesc: 'Todos os Pokémons te obedecerão', tmType: 'Terrestre', tmTypeColor: '#795548', tmName: "TM27 Fissure", tmStats: 'PP: 5/5' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [
        { name: 'Rhyhorn', id: '#111', image: img(111), moves: [mv('Normal', 'Stomp', 'PP: 20 PWR: 65 ACC: 100'), mv('Normal', 'Horn Drill', 'PP: 5 PWR: - ACC: 30')] },
        { name: 'Dugtrio', id: '#051', image: img(51), moves: [mv('Terrestre', 'Dig', 'PP: 10 PWR: 80 ACC: 100'), mv('Normal', 'Slash', 'PP: 20 PWR: 70 ACC: 100')] },
        { name: 'Nidoqueen', id: '#031', image: img(31), moves: [mv('Normal', 'Body Slam', 'PP: 15 PWR: 85 ACC: 100'), mv('Venenoso', 'Poison Sting', 'PP: 35 PWR: 15 ACC: 100')] },
        { name: 'Nidoking', id: '#034', image: img(34), moves: [mv('Normal', 'Thrash', 'PP: 20 PWR: 90 ACC: 100'), mv('Normal', 'Horn Attack', 'PP: 25 PWR: 65 ACC: 100')] },
        { name: 'Rhydon', id: '#112', image: img(112), moves: [mv('Terrestre', 'Fissure', 'PP: 5 PWR: - ACC: 30'), mv('Normal', 'Horn Drill', 'PP: 5 PWR: - ACC: 30')] }
      ],
      'yellow': [
        { name: 'Dugtrio', id: '#051', image: img(51), moves: [mv('Terrestre', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100'), mv('Normal', 'Slash', 'PP: 20 PWR: 70 ACC: 100')] },
        { name: 'Persian', id: '#053', image: img(53), moves: [mv('Normal', 'Screech', 'PP: 40 PWR: - ACC: 85'), mv('Normal', 'Fury Swipes', 'PP: 15 PWR: 18 ACC: 80')] },
        { name: 'Nidoqueen', id: '#031', image: img(31), moves: [mv('Terrestre', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100'), mv('Normal', 'Body Slam', 'PP: 15 PWR: 85 ACC: 100')] },
        { name: 'Nidoking', id: '#034', image: img(34), moves: [mv('Terrestre', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100'), mv('Normal', 'Thrash', 'PP: 20 PWR: 90 ACC: 100')] },
        { name: 'Rhydon', id: '#112', image: img(112), moves: [mv('Terrestre', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100'), mv('Elétrico', 'Thunder', 'PP: 10 PWR: 110 ACC: 70')] }
      ]
    }
  },
  { 
    id: '9', name: 'Lorelei', role: 'elite_four', desc: 'Planalto Índigo (1/4)', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/lorelei.png', color: '#B2EBF2',
    about: 'Lorelei é a primeira membro da Elite dos Quatro de Kanto. Ela é uma mestra fria e calculista do tipo Gelo.',
    mainType: { label: 'Gelo', color: '#00BCD4' },
    weaknesses: [{ label: 'Fogo', color: '#F44336' }, { label: 'Lutador', color: '#FF5722' }, { label: 'Elétrico', color: '#FFEB3B' }],
    reward: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso ao próximo membro da Elite', tmType: 'Gelo', tmTypeColor: '#00BCD4', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': loreleiTeam }
  },
  { 
    id: '10', name: 'Bruno', role: 'elite_four', desc: 'Planalto Índigo (2/4)', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/bruno.png', color: '#FFAB91',
    about: 'O segundo membro da Elite dos Quatro. Bruno treina exaustivamente com seus Pokémons do tipo Lutador nas montanhas.',
    mainType: { label: 'Lutador', color: '#FF5722' },
    weaknesses: [{ label: 'Voador', color: '#03A9F4' }, { label: 'Psíquico', color: '#E040FB' }],
    reward: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso ao próximo membro da Elite', tmType: 'Lutador', tmTypeColor: '#FF5722', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': brunoTeam }
  },
  { 
    id: '11', name: 'Agatha', role: 'elite_four', desc: 'Planalto Índigo (3/4)', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/agatha.png', color: '#B39DDB',
    about: 'Uma idosa ranzinza que foi rival do Prof. Carvalho no passado. Ela aterroriza adversários com o tipo Fantasma.',
    mainType: { label: 'Fantasma', color: '#673AB7' },
    weaknesses: [{ label: 'Psíquico', color: '#E040FB' }, { label: 'Fantasma', color: '#673AB7' }],
    reward: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso ao último membro da Elite', tmType: 'Fantasma', tmTypeColor: '#673AB7', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': agathaTeam }
  },
  { 
    id: '12', name: 'Lance', role: 'elite_four', desc: 'Planalto Índigo (4/4)', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png', color: '#9FA8DA',
    about: 'O líder da Elite dos Quatro de Kanto. Lance comanda Pokémons Dragões lendários e implacáveis.',
    mainType: { label: 'Dragão', color: '#3F51B5' },
    weaknesses: [{ label: 'Gelo', color: '#00BCD4' }, { label: 'Dragão', color: '#3F51B5' }],
    reward: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso à batalha contra o Campeão', tmType: 'Dragão', tmTypeColor: '#3F51B5', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': lanceTeam }
  },
  { 
    id: '13', name: 'Avaliador de Nomes', role: 'useful_npc', desc: 'Cidade de Lavender', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/gentleman.png', color: '#EEEEEE',
    about: 'O Avaliador de Nomes (Name Rater) tem o poder de mudar os apelidos que você deu aos seus Pokémons.',
    npcInfo: { location: 'Fica numa casa ao sul na Cidade de Lavender.', cost: 'Gratuito', service: 'Renomear Pokémons capturados originalmente por você.' }
  },
  { 
    id: '14', name: 'Apagador de Golpes', role: 'useful_npc', desc: 'Cidade de Fuchsia', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/supernerd.png', color: '#EEEEEE',
    about: 'O Apagador de Golpes (Move Deleter) é o único NPC do jogo capaz de fazer o seu Pokémon esquecer habilidades de HMs (como Surf ou Cut).',
    npcInfo: { location: 'Fuchsia City, na casa bem ao lado do Centro Pokémon.', cost: 'Gratuito', service: 'Apagar qualquer movimento, incluindo HMs permanentes.' }
  },
  { 
    id: '15', name: 'Criador Pokémon (Daycare)', role: 'useful_npc', desc: 'Rota 5', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/pokefanf.png', color: '#EEEEEE',
    about: 'O homem do Daycare cuida do seu Pokémon enquanto você viaja, aumentando a experiência dele a cada passo que você dá no jogo.',
    npcInfo: { location: 'Casa isolada na Rota 5, abaixo da Cidade de Cerulean.', cost: '100 Pokédolares + 100 por Nível Subido', service: 'Treinamento passivo de experiência.' }
  },
];

const Tab = createBottomTabNavigator();
const PokemonStack = createNativeStackNavigator();
const LeaderStack = createNativeStackNavigator();

function PokemonStackScreen() {
  return (
    <PokemonStack.Navigator screenOptions={{ headerShown: false }}>
      <PokemonStack.Screen name="Home" component={HomeScreen} />
      <PokemonStack.Screen name="Dex" component={DexScreen} />
    </PokemonStack.Navigator>
  );
}

function LeaderStackScreen() {
  return (
    <LeaderStack.Navigator screenOptions={{ headerShown: false }}>
      <LeaderStack.Screen name="LideresList" component={LideresScreen} />
      <LeaderStack.Screen name="LeaderDetail" component={LeaderDetailScreen} />
    </LeaderStack.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <View style={styles.safeArea}>
        <NavigationContainer>
          <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
            <Tab.Screen name="PokemonsTab" component={PokemonStackScreen} />
            <Tab.Screen name="DexTab" component={DexScreen} />
            <Tab.Screen name="LideresTab" component={LeaderStackScreen} />
            <Tab.Screen name="AjustesTab" component={AjustesScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </FavoritesProvider>
  );
}

function HomeScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [fullFilteredList, setFullFilteredList] = useState<any[]>([]);
  const [allPokemonCache, setAllPokemonCache] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const LIMIT = 20;

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
      .then(res => res.json())
      .then(data => {
        const parsed = data.results.map((item: any) => {
          const urlParts = item.url.split('/');
          const id = parseInt(urlParts[urlParts.length - 2], 10);
          return {
            id: id.toString().padStart(3, '0'), 
            rawId: id,
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1), 
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            types: null 
          };
        });
        setAllPokemonCache(parsed);
      })
      .catch(console.error);
  }, []);

  const fetchPokemons = async (reset = false) => {
    if (isLoadingMore && !reset) return;
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setIsLoading(true);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let batchToFetchDetails = [];
      let newHasMore = true;

      if (activeFilter) {
        let fullList = fullFilteredList;
        if (reset) {
          const res = await fetch(`https://pokeapi.co/api/v2/type/${activeFilter}`);
          const data = await res.json();
          fullList = data.pokemon.map((p: any) => {
             const urlParts = p.pokemon.url.split('/');
             const id = parseInt(urlParts[urlParts.length - 2], 10);
             return { name: p.pokemon.name, url: p.pokemon.url, rawId: id };
          });
          setFullFilteredList(fullList);
        }
        
        const nextBatch = fullList.slice(currentOffset, currentOffset + LIMIT);
        batchToFetchDetails = nextBatch.map(p => p.url);
        newHasMore = currentOffset + LIMIT < fullList.length;
      } else {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${LIMIT}`);
        const data = await response.json();
        batchToFetchDetails = data.results.map((item: any) => item.url);
        newHasMore = data.next !== null;
      }

      const detailedPromises = batchToFetchDetails.map((url: string) => fetch(url).then(res => res.json()));
      const detailedResults = await Promise.all(detailedPromises);
      
      const formattedList = detailedResults.map((detail: any) => {
        return {
          id: detail.id.toString().padStart(3, '0'), 
          rawId: detail.id,
          name: detail.name.charAt(0).toUpperCase() + detail.name.slice(1), 
          spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
          types: detail.types.map((t: any) => t.type.name),
        };
      });

      if (reset) {
        setPokemonList(formattedList);
      } else {
        setPokemonList(prev => [...prev, ...formattedList]);
      }
      
      setOffset(currentOffset + LIMIT);
      setHasMore(newHasMore);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPokemons(true);
  }, [activeFilter]);

  const loadMore = () => {
    if (!isLoadingMore && hasMore && query.trim() === '') {
      fetchPokemons(false);
    }
  };

  const filteredList = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    
    if (normalized) {
      const results = allPokemonCache.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(normalized)
      );
      
      if (activeFilter && fullFilteredList.length > 0) {
        const filteredIds = new Set(fullFilteredList.map(p => p.rawId));
        return results.filter(p => filteredIds.has(p.rawId));
      }
      return results;
    }
    
    return pokemonList;
  }, [query, pokemonList, allPokemonCache, activeFilter, fullFilteredList]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MoveDex</Text>
        <Text style={styles.subtitle}>Listagem de informações</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#333" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar Pokémon (Todos)" placeholderTextColor="#888888" style={styles.searchInput} />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="mic-outline" size={20} color="#333" />
        )}
      </View>

      <Text style={styles.sectionLabel}>Filtros por Tipo</Text>
      <View style={{ height: 44, marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 22 }}>
          <TouchableOpacity style={[styles.filterPill, activeFilter === null && styles.filterPillActive, { backgroundColor: activeFilter === null ? '#333' : '#F0F0F0' }]} onPress={() => setActiveFilter(null)}>
            <Text style={[styles.filterPillText, activeFilter === null && styles.filterPillTextActive]}>Todos</Text>
          </TouchableOpacity>
          {POKEMON_TYPES.map(type => {
            const isActive = activeFilter === type.id;
            return (
              <TouchableOpacity key={type.id} style={[styles.filterPill, isActive ? { backgroundColor: type.color, borderColor: type.color } : {}]} onPress={() => setActiveFilter(type.id)}>
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{type.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Pokémons</Text>
        {activeFilter && <Text style={{ fontSize: 12, color: '#888' }}>{fullFilteredList.length} resultados</Text>}
      </View>

      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => <PokemonRow pokemon={item} onPress={() => navigation.navigate('Dex', { pokemonId: item.rawId })} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => isLoadingMore ? <ActivityIndicator size="small" color="#888" style={{ marginVertical: 20 }} /> : null}
          />
        )}
      </View>
    </View>
  );
}

function DexScreen({ route, navigation }: any) {
  const [randomId, setRandomId] = useState(() => Math.floor(Math.random() * 151) + 1);
  const pokemonId = route?.params?.pokemonId || randomId;
  const [pokemonDetails, setPokemonDetails] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const isFav = isFavorite(pokemonId);

  useFocusEffect(
    useCallback(() => {
      if (!route?.params?.pokemonId) setRandomId(Math.floor(Math.random() * 151) + 1);
    }, [route?.params?.pokemonId])
  );

  useEffect(() => {
    async function fetchData() {
      if (!pokemonId) return;
      setIsLoading(true);
      try {
        const resBasic = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const dataBasic = await resBasic.json();
        const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const dataSpecies = await resSpecies.json();
        
        let flavorTextEntry = dataSpecies.flavor_text_entries.find((entry: any) => entry.language.name === 'es');
        if (!flavorTextEntry) flavorTextEntry = dataSpecies.flavor_text_entries.find((entry: any) => entry.language.name === 'en');
        const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'Nenhuma descrição encontrada.';
        
        const relationsMap: any = {
          grass: { weak: ['Fogo', 'Voador', 'Inseto'], ideal: ['Água', 'Terrestre', 'Pedra'] },
          fire: { weak: ['Água', 'Terrestre', 'Pedra'], ideal: ['Planta', 'Gelo', 'Inseto', 'Aço'] },
          water: { weak: ['Planta', 'Elétrico'], ideal: ['Fogo', 'Terrestre', 'Pedra'] },
          bug: { weak: ['Fogo', 'Voador', 'Pedra'], ideal: ['Planta', 'Psíquico'] },
          normal: { weak: ['Lutador'], ideal: [] },
          poison: { weak: ['Terrestre', 'Psíquico'], ideal: ['Planta', 'Fada'] },
          electric: { weak: ['Terrestre'], ideal: ['Água', 'Voador'] },
          ground: { weak: ['Água', 'Planta', 'Gelo'], ideal: ['Fogo', 'Elétrico', 'Pedra', 'Venenoso'] },
          fairy: { weak: ['Venenoso', 'Aço'], ideal: ['Lutador', 'Dragão', 'Sombrio'] },
          fighting: { weak: ['Voador', 'Psíquico', 'Fada'], ideal: ['Normal', 'Gelo', 'Pedra', 'Sombrio'] },
          psychic: { weak: ['Inseto', 'Fantasma', 'Sombrio'], ideal: ['Lutador', 'Venenoso'] },
          rock: { weak: ['Água', 'Planta', 'Lutador', 'Terrestre'], ideal: ['Fogo', 'Gelo', 'Voador', 'Inseto'] },
          ghost: { weak: ['Fantasma', 'Sombrio'], ideal: ['Fantasma', 'Psíquico'] },
          dragon: { weak: ['Gelo', 'Dragão', 'Fada'], ideal: ['Dragão'] },
        };

        const primaryPtName = typeTranslations[dataBasic.types[0].type.name] || 'Normal';
        const types = dataBasic.types.map((t: any) => {
          const ptName = typeTranslations[t.type.name] || t.type.name;
          return { name: ptName, color: ptColors[ptName] || '#888888' };
        });

        const primaryTypeStr = dataBasic.types[0].type.name;
        const rels = relationsMap[primaryTypeStr] || { weak: ['Desconhecido'], ideal: ['Desconhecido'] };
        const weaknesses = rels.weak.map((w: string) => ({ name: w, color: ptColors[w] || '#999' }));
        const strengths = rels.ideal.map((s: string) => ({ name: s, color: ptColors[s] || '#999' }));
        const rawMoves = dataBasic.moves;
        const gamesSet = new Set<string>();
        rawMoves.forEach((m: any) => m.version_group_details.forEach((vgd: any) => gamesSet.add(vgd.version_group.name)));
        
        const availableGames = Array.from(gamesSet).map(gameStr => ({
          id: gameStr, name: gameStr.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }));

        const allMovesParsed = rawMoves.map((m: any) => ({
          name: m.move.name.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          versions: m.version_group_details.map((vgd: any) => vgd.version_group.name),
          type: typeTranslations[dataBasic.types[0].type.name] || 'Normal', 
          typeColor: ptColors[typeTranslations[dataBasic.types[0].type.name]] || '#9E9E9E'
        }));

        setPokemonDetails({
          name: dataBasic.name.charAt(0).toUpperCase() + dataBasic.name.slice(1),
          description, types, weaknesses, strengths, allMoves: allMovesParsed, availableGames,
          bgColor: bgColors[primaryPtName] || '#E8E8E8'
        });

        const defaultGame = availableGames.find(g => g.id === 'black-white')?.id || availableGames[0]?.id;
        setSelectedGame(defaultGame);

        const resEvo = await fetch(dataSpecies.evolution_chain.url);
        const dataEvo = await resEvo.json();
        const evoList = [];
        let currentEvo = dataEvo.chain;
        
        while (currentEvo && currentEvo.species) {
          const name = currentEvo.species.name;
          const urlParts = currentEvo.species.url.split('/');
          const id = parseInt(urlParts[urlParts.length - 2], 10);
          evoList.push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            id: `#${id.toString().padStart(3, '0')}`,
            rawId: id,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
          });
          currentEvo = currentEvo.evolves_to[0]; 
        }
        setEvolutions(evoList);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [pokemonId]);

  const { topMoves, bottomMoves } = useMemo(() => {
    if (!pokemonDetails?.allMoves || !selectedGame) return { topMoves: [], bottomMoves: [] };
    const movesForGame = pokemonDetails.allMoves.filter((m: any) => m.versions.includes(selectedGame));
    const top = movesForGame.slice(0, 4);
    let bottom = [];
    if (movesForGame.length > 4) bottom = movesForGame.slice(4).slice(-4).reverse();
    return { topMoves: top, bottomMoves: bottom };
  }, [pokemonDetails, selectedGame]);

  const bgColor = pokemonDetails?.bgColor || '#E8E8E8';

  const handleToggleFavorite = () => toggleFavorite({
    id: pokemonId, name: pokemonDetails?.name || 'Desconhecido', image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
  });

  return (
    <View style={[styles.dexContainer, { backgroundColor: bgColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.dexScrollView}>
        <View style={styles.dexScrollHeader}>
          <View style={styles.dexHeaderRow}>
            {route?.params?.pokemonId ? (
              <TouchableOpacity style={styles.backButtonCircle} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={26} color="#000" />
              </TouchableOpacity>
            ) : <View />}
            <TouchableOpacity style={styles.favoriteCircle} onPress={handleToggleFavorite}>
              <Ionicons name={isFav ? "star" : "star-outline"} size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.dexImageWrapper}>
            <Image source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png` }} style={styles.dexMainImage} />
          </View>
          <View style={styles.dexTitleContainer}>
            <Text style={styles.dexTitle}>{pokemonDetails ? pokemonDetails.name : 'Carregando...'}</Text> 
            <Text style={styles.dexId}>#{pokemonId.toString().padStart(3, '0')}</Text>
          </View>
        </View>
        <View style={styles.dexCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
          ) : (
            <>
              <Text style={styles.dexSectionTitle}>Descrição da Pokedex</Text>
              <Text style={styles.dexDescription}>{pokemonDetails?.description}</Text>
              <Text style={styles.dexSectionTitle}>Tipo</Text>
              <View style={[styles.badgesRow, { marginBottom: 24 }]}>
                {pokemonDetails?.types?.map((t: any, index: number) => <Badge key={`type-${index}`} label={t.name} color={t.color} />)}
              </View>
              <View style={styles.dexTypesRow}>
                <View style={styles.dexTypeCol}>
                  <Text style={styles.dexSectionTitle}>Ideal contra</Text>
                  <View style={styles.badgesRow}>
                    {pokemonDetails?.strengths.map((s: any, index: number) => <Badge key={`strength-${index}`} label={s.name} color={s.color} />)}
                  </View>
                </View>
                <View style={styles.dexTypeCol}>
                  <Text style={styles.dexSectionTitle}>Fraco contra</Text>
                  <View style={styles.badgesRow}>
                    {pokemonDetails?.weaknesses.map((w: any, index: number) => <Badge key={`weak-${index}`} label={w.name} color={w.color} />)}
                  </View>
                </View>
              </View>
              <Text style={styles.dexSectionTitle}>Linha evolutiva</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evolutionsContainer}>
                {evolutions.map((evo, index) => (
                  <TouchableOpacity 
                    key={index} activeOpacity={0.7}
                    onPress={() => { if (navigation.push) navigation.push('Dex', { pokemonId: evo.rawId }); else navigation.setParams({ pokemonId: evo.rawId }); }}
                  >
                    <EvolutionCard name={evo.name} id={evo.id} image={evo.image} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.dexSectionTitle}>Movimentos mais utilizados</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesScrollView}>
                {pokemonDetails?.availableGames?.map((game: any) => {
                  const isSelected = selectedGame === game.id;
                  return (
                    <TouchableOpacity key={game.id} style={[styles.gamePill, isSelected && styles.gamePillActive]} onPress={() => setSelectedGame(game.id)}>
                      <Text style={[styles.gamePillText, isSelected && styles.gamePillTextActive]}>Pokémon {game.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.rewardCard}>
                {topMoves?.map((move: any, index: number) => (
                  <View key={`top-${index}`} style={{ marginBottom: index === topMoves.length - 1 ? 0 : 12 }}>
                    <View style={styles.rewardMoveRow}>
                      <Badge label={move.type} color={move.typeColor} />
                      <Text style={styles.rewardMoveName}>{move.name}</Text>
                    </View>
                    {index < topMoves.length - 1 && <View style={[styles.horizontalSeparator, { marginTop: 12 }]} />}
                  </View>
                ))}
                {topMoves?.length === 0 && <Text style={{color: '#888'}}>Nenhum golpe encontrado.</Text>}
              </View>
              {bottomMoves?.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.dexSectionTitle}>Movimentos menos utilizados</Text>
                  <View style={styles.rewardCard}>
                    {bottomMoves?.map((move: any, index: number) => (
                      <View key={`bottom-${index}`} style={{ marginBottom: index === bottomMoves.length - 1 ? 0 : 12 }}>
                        <View style={styles.rewardMoveRow}>
                          <Badge label={move.type} color={move.typeColor} />
                          <Text style={styles.rewardMoveName}>{move.name}</Text>
                        </View>
                        {index < bottomMoves.length - 1 && <View style={[styles.horizontalSeparator, { marginTop: 12 }]} />}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function LideresScreen({ navigation }: any) {
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [query, setQuery] = useState('');
  const data = selectedRegion ? KANTO_CHARACTERS : REGIONS;
  
  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter(item => item.name.toLowerCase().includes(normalized));
  }, [query, data]);

  const renderSectionHeader = (title: string) => <Text style={[styles.sectionLabel, { marginTop: 16, marginBottom: 12 }]}>{title}</Text>;

  const renderRegionContent = () => {
    if (!selectedRegion) {
      return (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GenericRow title={item.name} subtitle={item.desc} imageUrl={item.image} onPress={() => setSelectedRegion(item)} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      );
    }
    if (selectedRegion.name !== 'Kanto') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <Ionicons name="construct-outline" size={48} color="#CCCCCC" />
          <Text style={{ fontSize: 18, color: '#888', marginTop: 12 }}>Em Construção</Text>
        </View>
      );
    }
    const gymLeaders = filteredData.filter(item => item.role === 'gym_leader');
    const eliteFour = filteredData.filter(item => item.role === 'elite_four');
    const usefulNpcs = filteredData.filter(item => item.role === 'useful_npc');
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {gymLeaders.length > 0 && (
          <>
            {renderSectionHeader('Líderes de Ginásio')}
            {gymLeaders.map(item => <GenericRow key={item.id} title={item.name} subtitle={item.desc} imageUrl={item.image} onPress={() => navigation.navigate('LeaderDetail', { leader: item })} />)}
          </>
        )}
        {eliteFour.length > 0 && (
          <>
            {renderSectionHeader('Elite dos Quatro')}
            {eliteFour.map(item => <GenericRow key={item.id} title={item.name} subtitle={item.desc} imageUrl={item.image} onPress={() => navigation.navigate('LeaderDetail', { leader: item })} />)}
          </>
        )}
        {usefulNpcs.length > 0 && (
          <>
            {renderSectionHeader('NPCs Úteis')}
            {usefulNpcs.map(item => <GenericRow key={item.id} title={item.name} subtitle={item.desc} imageUrl={item.image} onPress={() => navigation.navigate('LeaderDetail', { leader: item })} />)}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MoveDex</Text>
        <Text style={styles.subtitle}>Listagem de informações</Text>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#333" />
        <TextInput value={query} onChangeText={setQuery} placeholder={selectedRegion ? "Buscar Personagem" : "Buscar Região"} placeholderTextColor="#888888" style={styles.searchInput} />
        <Ionicons name="mic-outline" size={20} color="#333" />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        {selectedRegion && (
          <TouchableOpacity onPress={() => setSelectedRegion(null)} style={[styles.backButtonCircle, { marginRight: 12 }]}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
        )}
        <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>{selectedRegion ? selectedRegion.name : 'Regiões'}</Text>
      </View>
      <View style={[styles.listContainer, { marginBottom: 110 }]}>
        {renderRegionContent()}
      </View>
    </View>
  );
}

function LeaderDetailScreen({ route, navigation }: any) {
  const { leader } = route.params;
  const isNpc = leader.role === 'useful_npc';
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  useEffect(() => {
    if (leader.availableGames && leader.availableGames.length > 0) {
      setSelectedGame(leader.availableGames[0].id);
    }
  }, [leader]);

  const currentTeam = (leader.teams && selectedGame) ? leader.teams[selectedGame] : [];

  if (!leader.about) {
    return (
      <View style={{ flex: 1, backgroundColor: leader.color || '#92D2EF' }}>
        <TouchableOpacity style={[styles.backButtonCircle, { position: 'absolute', top: 55, left: 22, zIndex: 10 }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Detalhes em construção...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: leader.color }}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.dexScrollView}>
        <View style={styles.leaderScrollHeader}>
          <TouchableOpacity style={[styles.backButtonCircle, styles.backButtonFixed]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <View style={styles.leaderImageWrapper}>
            <Image source={{ uri: leader.image }} style={styles.leaderMainImage} resizeMode="contain" />
          </View>
          <View style={styles.leaderTitleContainer}>
            <Text style={styles.leaderTitle}>{leader.name}</Text>
            <Text style={styles.leaderSubtitleText}>
              {leader.role === 'gym_leader' ? 'Líder de Ginásio' : leader.role === 'elite_four' ? 'Membro da Elite 4' : 'NPC Útil'}
            </Text>
          </View>
        </View>
        <View style={styles.dexCard}>
          <Text style={styles.dexSectionTitle}>Descrição</Text>
          <Text style={styles.dexDescription}>{leader.about}</Text>
          
          {isNpc ? (
            <>
              <Text style={styles.dexSectionTitle}>Localização</Text>
              <Text style={styles.dexDescription}>{leader.npcInfo.location}</Text>
              <Text style={styles.dexSectionTitle}>Serviço / Custo</Text>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardTitle}>{leader.npcInfo.service}</Text>
                <Text style={styles.rewardSubtitle}>Custo: {leader.npcInfo.cost}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.dexTypesRow}>
                <View style={styles.dexTypeCol}>
                  <Text style={styles.dexSectionTitle}>Tipo principal</Text>
                  <View style={styles.badgesRow}>
                    <Badge label={leader.mainType.label} color={leader.mainType.color} />
                  </View>
                </View>
                <View style={styles.dexTypeCol}>
                  <Text style={styles.dexSectionTitle}>Fraco contra</Text>
                  <View style={styles.badgesRow}>
                    {leader.weaknesses.map((w: any, index: number) => <Badge key={index} label={w.label} color={w.color} />)}
                  </View>
                </View>
              </View>
              <Text style={styles.dexSectionTitle}>Recompensa por vitória</Text>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardTitle}>{leader.reward.badgeName}</Text>
                <Text style={styles.rewardSubtitle}>{leader.reward.badgeDesc}</Text>
                <View style={styles.horizontalSeparator} />
                <View style={styles.rewardMoveRow}>
                  <Badge label={leader.reward.tmType} color={leader.reward.tmTypeColor} />
                  <Text style={styles.rewardMoveName}>{leader.reward.tmName}</Text>
                </View>
                <Text style={styles.rewardMoveStats}>{leader.reward.tmStats}</Text>
              </View>

              {leader.availableGames && leader.availableGames.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text style={styles.dexSectionTitle}>Pokémons utilizados</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesScrollView}>
                    {leader.availableGames.map((game: any) => {
                      const isSelected = selectedGame === game.id;
                      return (
                        <TouchableOpacity key={game.id} style={[styles.gamePill, isSelected && styles.gamePillActive]} onPress={() => setSelectedGame(game.id)}>
                          <Text style={[styles.gamePillText, isSelected && styles.gamePillTextActive]}>{game.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  
                  <View style={{ gap: 16 }}>
                    {currentTeam.map((pkmn: any, pIdx: number) => (
                      <View key={pIdx} style={styles.teamCard}>
                        <View style={styles.teamCardLeft}>
                          <Image source={{ uri: pkmn.image }} style={styles.teamCardImage} resizeMode="contain" />
                          <Text style={styles.teamCardName}>{pkmn.name}</Text>
                          <Text style={styles.teamCardId}>{pkmn.id}</Text>
                        </View>
                        <View style={styles.teamCardRight}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                            {pkmn.moves.map((move: any, mIdx: number) => (
                              <View key={mIdx} style={[styles.moveHorizontalCard, { marginRight: mIdx === pkmn.moves.length - 1 ? 0 : 12 }]}>
                                <View style={{ alignSelf: 'flex-start' }}>
                                  <Badge label={move.type} color={move.typeColor} />
                                </View>
                                <Text style={styles.teamMoveName}>{move.name}</Text>
                                <Text style={styles.teamMoveStats}>{move.stats}</Text>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function AjustesScreen({ navigation }: any) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { favorites } = useContext(FavoritesContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('PT-BR');
  const [measureSystem, setMeasureSystem] = useState('Métrico');
  const [textSize, setTextSize] = useState('Normal');
  const [isBoldText, setIsBoldText] = useState(false);
  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MoveDex</Text>
        <Text style={styles.settingsTitle}>Ajustes e Perfil</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsMenuItem} onPress={() => toggleSection('favoritos')}>
            <Text style={styles.settingsMenuText}>Meus Favoritos ({favorites.length})</Text>
            <Ionicons name={expandedSection === 'favoritos' ? "chevron-down" : "chevron-forward"} size={20} color="#000" />
          </TouchableOpacity>
          {expandedSection === 'favoritos' && (
            <View style={styles.expandedContent}>
              {favorites.length === 0 ? (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 10 }}>Nenhum favorito salvo ainda.</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {favorites.map((fav) => (
                    <TouchableOpacity key={fav.id} style={styles.favoriteListCard} onPress={() => navigation.navigate('DexTab', { pokemonId: fav.id })}>
                      <Image source={{ uri: fav.image }} style={styles.favoriteListImage} />
                      <Text style={styles.favoriteListName}>{fav.name}</Text>
                      <Text style={styles.favoriteListId}>#{fav.id.toString().padStart(3, '0')}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
          <View style={styles.settingsSeparator} />
          <TouchableOpacity style={styles.settingsMenuItem} onPress={() => toggleSection('configuracoes')}>
            <Text style={styles.settingsMenuText}>Configurações</Text>
            <Ionicons name={expandedSection === 'configuracoes' ? "chevron-down" : "chevron-forward"} size={20} color="#000" />
          </TouchableOpacity>
          {expandedSection === 'configuracoes' && (
            <View style={styles.expandedConfigContent}>
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="moon" size={20} color="#555" />
                  <Text style={styles.configLabel}>Tema Escuro</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={setIsDarkMode} value={isDarkMode} />
              </View>
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="volume-high" size={20} color="#555" />
                  <Text style={styles.configLabel}>Sons dos Pokémons</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={setSoundEnabled} value={soundEnabled} />
              </View>
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="text" size={20} color="#555" />
                  <Text style={styles.configLabel}>Textos em Negrito</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={setIsBoldText} value={isBoldText} />
              </View>
              <View style={styles.configColumn}>
                <Text style={styles.configLabelMargin}>Idioma dos Golpes</Text>
                <View style={styles.segmentedControl}>
                  {['PT-BR', 'EN-US'].map(lang => (
                    <TouchableOpacity key={lang} style={[styles.segmentButton, language === lang && styles.segmentButtonActive]} onPress={() => setLanguage(lang)}>
                      <Text style={[styles.segmentText, language === lang && styles.segmentTextActive]}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
          <View style={styles.settingsSeparator} />
          <TouchableOpacity style={styles.settingsMenuItem} onPress={() => toggleSection('sobre')}>
            <Text style={styles.settingsMenuText}>Sobre</Text>
            <Ionicons name={expandedSection === 'sobre' ? "chevron-down" : "chevron-forward"} size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function BottomNavigation({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.navWrapper}>
      <BlurView intensity={100} tint="light" style={styles.navContainer}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          let iconName = ''; let label = '';
          if (route.name === 'PokemonsTab') { iconName = isFocused ? 'list' : 'list-outline'; label = 'Pokémons'; }
          else if (route.name === 'DexTab') { iconName = isFocused ? 'book' : 'book-outline'; label = 'Dex'; }
          else if (route.name === 'LideresTab') { iconName = isFocused ? 'people' : 'people-outline'; label = 'Líderes'; }
          else if (route.name === 'AjustesTab') { iconName = isFocused ? 'settings' : 'settings-outline'; label = 'Ajustes'; }
          return (
            <TouchableOpacity key={index} style={isFocused ? styles.navItemActive : styles.navItem} onPress={onPress}>
              <Ionicons name={iconName as any} size={24} color={isFocused ? '#007AFF' : '#000'} />
              <Text style={isFocused ? styles.navTextActive : styles.navText}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

function PokemonRow({ pokemon, onPress }: any) {
  const primaryType = pokemon.types ? pokemon.types[0] : null;
  const ptName = primaryType ? typeTranslations[primaryType] || 'Normal' : null;
  const bgColor = ptName ? bgColors[ptName] : '#FFFFFF';
  return (
    <TouchableOpacity style={[styles.pokemonCardRow, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.pokemonCardInfo}>
        <Text style={styles.pokemonCardId}>#{pokemon.id}</Text>
        <Text style={styles.pokemonCardName}>{pokemon.name}</Text>
        {pokemon.types && (
          <View style={styles.pokemonCardBadges}>
            {pokemon.types.map((t: string, i: number) => {
               const pType = typeTranslations[t] || t;
               return <Badge key={i} label={pType} color={ptColors[pType] || '#999'} />
            })}
          </View>
        )}
      </View>
      <View style={styles.pokemonCardImageWrapper}>
        <Image source={{ uri: pokemon.spriteUrl }} style={styles.pokemonCardImage} resizeMode="contain" />
      </View>
    </TouchableOpacity>
  );
}

function GenericRow({ title, subtitle, imageUrl, onPress }: any) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.spriteContainer}>
        <Image source={{ uri: imageUrl }} style={styles.sprite} resizeMode="contain" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.pokemonName}>{title}</Text>
        <Text style={styles.pokemonId}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F2' },
  container: { flex: 1, paddingHorizontal: 22, backgroundColor: '#F2F2F2' },
  header: { marginTop: 65, marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#2B2B2B', marginBottom: 4 },
  subtitle: { fontSize: 18, color: '#4A4A4A' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8E8E8', borderRadius: 24, paddingHorizontal: 16, height: 48, marginBottom: 24, gap: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#2B2B2B' },
  sectionLabel: { fontSize: 18, fontWeight: 'bold', color: '#555555', marginBottom: 12 },
  listContainer: { flex: 1 },
  listContent: { paddingBottom: 120, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 16, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12 },
  spriteContainer: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  sprite: { width: 48, height: 48 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  pokemonName: { fontSize: 18, fontWeight: '500', color: '#2B2B2B', marginBottom: 4 },
  pokemonId: { fontSize: 14, color: '#999999' },
  filterScroll: { flexGrow: 0 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10, borderWidth: 1, borderColor: '#E8E8E8', height: 36, justifyContent: 'center' },
  filterPillActive: { backgroundColor: '#333333', borderColor: '#333333' },
  filterPillText: { fontSize: 13, fontWeight: '600', color: '#666666' },
  filterPillTextActive: { color: '#FFFFFF' },
  pokemonCardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 10, paddingVertical: 20, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, height: 130 },
  pokemonCardInfo: { justifyContent: 'center', flex: 1 },
  pokemonCardId: { fontSize: 14, fontWeight: 'bold', color: 'rgba(0,0,0,0.4)', marginBottom: 4 },
  pokemonCardName: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  pokemonCardBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pokemonCardImageWrapper: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  pokemonCardImage: { width: 120, height: 120, position: 'absolute', right: -10, top: -20 },
  dexContainer: { flex: 1 },
  dexScrollView: { flex: 1 },
  dexScrollHeader: { paddingHorizontal: 22, paddingTop: 55, paddingBottom: 20 },
  dexHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  favoriteCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  dexImageWrapper: { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  dexMainImage: { width: 220, height: 220 },
  dexTitleContainer: { marginTop: 10 },
  dexTitle: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
  dexId: { fontSize: 16, color: '#333333', marginTop: 4 },
  dexCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, marginHorizontal: 22, paddingTop: 32, paddingHorizontal: 22, paddingBottom: 160 },
  dexSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
  dexDescription: { fontSize: 14, color: '#4A4A4A', lineHeight: 22, marginBottom: 24 },
  dexTypesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dexTypeCol: { flex: 1 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  gamesScrollView: { marginBottom: 20, marginTop: -4 },
  gamePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10, borderWidth: 1, borderColor: '#E8E8E8' },
  gamePillActive: { backgroundColor: '#333333', borderColor: '#333333' },
  gamePillText: { fontSize: 13, fontWeight: '600', color: '#666666' },
  gamePillTextActive: { color: '#FFFFFF' },
  movesSubtitle: { fontSize: 14, color: '#888888', marginBottom: 12, marginTop: -8 },
  leaderScrollHeader: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 22 },
  backButtonFixed: { marginBottom: 10 },
  leaderImageWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  leaderMainImage: { width: 280, height: 280 },
  leaderTitleContainer: { alignItems: 'flex-start' },
  leaderTitle: { fontSize: 36, fontWeight: 'bold', color: '#000000' },
  leaderSubtitleText: { fontSize: 16, color: '#333333', marginTop: 4 },
  rewardCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 16, padding: 16, marginBottom: 24 },
  rewardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  rewardSubtitle: { fontSize: 12, color: '#888888', fontWeight: '500', marginBottom: 12 },
  horizontalSeparator: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  rewardMoveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rewardMoveName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  rewardMoveStats: { fontSize: 11, color: '#888888', fontWeight: '600' },
  evolutionsContainer: { marginBottom: 24, height: 155 },
  evoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 20, padding: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16, width: 140, height: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  evoImage: { width: 70, height: 70, marginBottom: 6 },
  evoName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  evoId: { fontSize: 12, color: '#999999' },
  navWrapper: { paddingHorizontal: 22, paddingBottom: 28, backgroundColor: 'transparent', position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  navContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.65)', borderRadius: 40, height: 76, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.8)' },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 75, height: 60 },
  navItemActive: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', width: 75, height: 60, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  navText: { fontSize: 12, fontWeight: '500', color: '#333', marginTop: 4 },
  navTextActive: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', marginTop: 4 },
  backButtonCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  settingsTitle: { fontSize: 26, fontWeight: 'bold', color: '#000000' },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 8, paddingHorizontal: 24, marginBottom: 110 },
  settingsSeparator: { height: 1, backgroundColor: '#F0F0F0' },
  settingsMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  settingsMenuText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  expandedContent: { paddingBottom: 20 },
  favoriteListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12 },
  favoriteListImage: { width: 40, height: 40, marginRight: 12 },
  favoriteListName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  favoriteListId: { fontSize: 14, color: '#888888', marginLeft: 'auto', marginRight: 12 },
  expandedConfigContent: { paddingBottom: 24, paddingTop: 8, gap: 24 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  configInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  configLabel: { fontSize: 15, fontWeight: '500', color: '#333333' },
  configColumn: { gap: 10 },
  configLabelMargin: { fontSize: 15, fontWeight: '500', color: '#333333', marginBottom: 4 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 8, padding: 3 },
  segmentButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  segmentButtonActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 14, fontWeight: '500', color: '#8E8E93' },
  segmentTextActive: { color: '#000000', fontWeight: 'bold' },

  teamCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 16, paddingLeft: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, height: 160 },
  teamCardLeft: { width: 90, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#F0F0F0', paddingRight: 16, marginRight: 16 },
  teamCardImage: { width: 60, height: 60, marginBottom: 6 },
  teamCardName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
  teamCardId: { fontSize: 12, color: '#999999' },
  teamCardRight: { flex: 1, justifyContent: 'center' },
  moveHorizontalCard: { width: 130, backgroundColor: '#FAFAFA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EEEEEE', justifyContent: 'center' },
  teamMoveName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginTop: 8, marginBottom: 4 },
  teamMoveStats: { fontSize: 11, color: '#888888', fontWeight: '600' },
});