import React, { useMemo, useState, useEffect, useCallback, createContext, useContext } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';

const uiDict = {
  'PT-BR': {
    subtitle: 'Listagem de informações', searchAll: 'Buscar Pokémon (Todos)', typeFilters: 'Filtros por Tipo', all: 'Todos',
    pokemons: 'Pokémons', results: 'resultados', dexDesc: 'Descrição da Pokedex', type: 'Tipo',
    strong: 'Ideal contra', weak: 'Fraco contra', evoLine: 'Linha evolutiva', mostMoves: 'Movimentos mais utilizados',
    leastMoves: 'Movimentos menos utilizados', noMoves: 'Nenhum golpe encontrado.', searchChar: 'Buscar Personagem',
    searchRegion: 'Buscar Região', regions: 'Regiões', gymLeaders: 'Líderes de Ginásio', eliteFour: 'Elite dos Quatro & Campeão',
    usefulNpcs: 'NPCs Úteis', underConst: 'Em Construção', detailsConst: 'Detalhes em construção...',
    desc: 'Descrição', location: 'Localização', serviceCost: 'Serviço / Custo', cost: 'Custo', mainType: 'Tipo principal',
    reward: 'Recompensa por vitória', pkmnUsed: 'Pokémons utilizados', settingsProfile: 'Ajustes e Perfil',
    myFavs: 'Meus Favoritos', noFavs: 'Nenhum favorito salvo ainda.', settings: 'Configurações', darkTheme: 'Tema Escuro',
    cries: 'Sons dos Pokémons', boldText: 'Textos em Negrito', largerText: 'Textos Maiores', showWeight: 'Peso/Altura na Dex',
    language: 'Idioma da Interface e Golpes', about: 'Sobre', navPkmn: 'Pokémons', navDex: 'Dex', navLeaders: 'Líderes', navSettings: 'Ajustes',
    weight: 'Peso', height: 'Altura', gymRole: 'Líder de Ginásio', eliteRole: 'Membro da Elite 4', championRole: 'Campeão da Liga', npcRole: 'NPC Útil'
  },
  'EN-US': {
    subtitle: 'Information list', searchAll: 'Search Pokémon (All)', typeFilters: 'Type Filters', all: 'All',
    pokemons: 'Pokémon', results: 'results', dexDesc: 'Pokédex Description', type: 'Type',
    strong: 'Strong against', weak: 'Weak against', evoLine: 'Evolution line', mostMoves: 'Most used moves',
    leastMoves: 'Least used moves', noMoves: 'No moves found.', searchChar: 'Search Character',
    searchRegion: 'Search Region', regions: 'Regions', gymLeaders: 'Gym Leaders', eliteFour: 'Elite Four & Champion',
    usefulNpcs: 'Useful NPCs', underConst: 'Under Construction', detailsConst: 'Details under construction...',
    desc: 'Description', location: 'Location', serviceCost: 'Service / Cost', cost: 'Cost', mainType: 'Main Type',
    reward: 'Victory Reward', pkmnUsed: 'Pokémon used', settingsProfile: 'Settings & Profile',
    myFavs: 'My Favorites', noFavs: 'No favorites saved yet.', settings: 'Settings', darkTheme: 'Dark Mode',
    cries: 'Pokémon Cries', boldText: 'Bold Text', largerText: 'Larger Text', showWeight: 'Show Weight/Height in Dex',
    language: 'Interface & Moves Language', about: 'About', navPkmn: 'Pokémon', navDex: 'Dex', navLeaders: 'Leaders', navSettings: 'Settings',
    weight: 'Weight', height: 'Height', gymRole: 'Gym Leader', eliteRole: 'Elite 4 Member', championRole: 'League Champion', npcRole: 'Useful NPC'
  }
};

const t = (lang: string, key: string) => (uiDict as any)[lang][key] || key;

const typeNames: any = {
  grass: { pt: 'Planta', en: 'Grass' }, poison: { pt: 'Venenoso', en: 'Poison' }, fire: { pt: 'Fogo', en: 'Fire' }, 
  water: { pt: 'Água', en: 'Water' }, bug: { pt: 'Inseto', en: 'Bug' }, flying: { pt: 'Voador', en: 'Flying' },
  normal: { pt: 'Normal', en: 'Normal' }, electric: { pt: 'Elétrico', en: 'Electric' }, ground: { pt: 'Terrestre', en: 'Ground' }, 
  fairy: { pt: 'Fada', en: 'Fairy' }, fighting: { pt: 'Lutador', en: 'Fighting' }, psychic: { pt: 'Psíquico', en: 'Psychic' },
  rock: { pt: 'Pedra', en: 'Rock' }, steel: { pt: 'Aço', en: 'Steel' }, ice: { pt: 'Gelo', en: 'Ice' }, 
  ghost: { pt: 'Fantasma', en: 'Ghost' }, dragon: { pt: 'Dragão', en: 'Dragon' }, dark: { pt: 'Sombrio', en: 'Dark' }
};

const ptColors: any = {
  Planta: '#4CAF50', Venenoso: '#9C27B0', Fogo: '#F44336', Água: '#2196F3',
  Inseto: '#8BC34A', Voador: '#03A9F4', Normal: '#9E9E9E', Elétrico: '#FFEB3B',
  Terrestre: '#795548', Fada: '#E91E63', Lutador: '#FF5722', Psíquico: '#E040FB',
  Pedra: '#795548', Aço: '#9E9E9E', Gelo: '#00BCD4', Fantasma: '#673AB7', Dragão: '#3F51B5', Sombrio: '#212121'
};

const getTypeData = (typeId: string, lang: string) => {
  const data = typeNames[typeId];
  if (!data) return { name: typeId, color: '#888' };
  return { name: lang === 'PT-BR' ? data.pt : data.en, color: ptColors[data.pt] };
};

const relationsMap: any = {
  grass: { weak: ['fire', 'flying', 'bug'], ideal: ['water', 'ground', 'rock'] },
  fire: { weak: ['water', 'ground', 'rock'], ideal: ['grass', 'ice', 'bug', 'steel'] },
  water: { weak: ['grass', 'electric'], ideal: ['fire', 'ground', 'rock'] },
  bug: { weak: ['fire', 'flying', 'rock'], ideal: ['grass', 'psychic'] },
  normal: { weak: ['fighting'], ideal: [] },
  poison: { weak: ['ground', 'psychic'], ideal: ['grass', 'fairy'] },
  electric: { weak: ['ground'], ideal: ['water', 'flying'] },
  ground: { weak: ['water', 'grass', 'ice'], ideal: ['fire', 'electric', 'rock', 'poison'] },
  fairy: { weak: ['poison', 'steel'], ideal: ['fighting', 'dragon', 'dark'] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], ideal: ['normal', 'ice', 'rock', 'dark'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], ideal: ['fighting', 'poison'] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground'], ideal: ['fire', 'ice', 'flying', 'bug'] },
  ghost: { weak: ['ghost', 'dark'], ideal: ['ghost', 'psychic'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], ideal: ['dragon'] },
};

const moveTranslations: any = {
  'Aurora Beam': 'Raio Aurora', 'Take Down': 'Derrubar', 'Rest': 'Descansar', 'Clamp': 'Concha Prende', 
  'Supersonic': 'Supersônico', 'Water Gun': 'Revólver d\'Água', 'Amnesia': 'Amnésia', 'Growl': 'Rosnar', 
  'Ice Punch': 'Soco de Gelo', 'Thrash': 'Cilada', 'Doubleslap': 'Tapa Duplo', 'Blizzard': 'Nevasca', 
  'Hydro Pump': 'Hidro Bomba', 'Body Slam': 'Pancada', 'Rock Throw': 'Lançamento de Rocha', 'Rage': 'Fúria', 
  'Fire Punch': 'Soco de Fogo', 'Thunder Punch': 'Soco do Trovão', 'Jump Kick': 'Chute Pulo', 'Double Kick': 'Chute Duplo', 
  'Rolling Kick': 'Chute Rolante', 'Slam': 'Pancada', 'Karate Chop': 'Golpe de Karatê', 'Submission': 'Submissão',
  'Confuse Ray': 'Raio Confusão', 'Dream Eater': 'Devorador de Sonhos', 'Wing Attack': 'Ataque de Asa',
  'Haze': 'Neblina', 'Night Shade': 'Sombra Noturna', 'Hypnosis': 'Hipnose', 'Wrap': 'Enrolar',
  'Glare': 'Encarar', 'Acid': 'Ácido', 'Toxic': 'Tóxico', 'Dragon Rage': 'Fúria do Dragão',
  'Bite': 'Mordida', 'Hyper Beam': 'Hiper Raio', 'Barrier': 'Barreira', 'Tackle': 'Investida', 
  'Bide': 'Paciência', 'Bind': 'Amarrar', 'Screech': 'Guincho', 'Bubble Beam': 'Raio de Bolhas', 
  'Harden': 'Endurecer', 'Sonic Boom': 'Estrondo Sônico', 'Quick Attack': 'Ataque Rápido', 
  'Thunder Wave': 'Onda de Choque', 'Thunderbolt': 'Choque do Trovão', 'Mega Punch': 'Mega Soco', 
  'Mega Kick': 'Mega Chute', 'Razor Leaf': 'Folha Navalha', 'Poison Powder': 'Pó Venenoso', 
  'Sleep Powder': 'Pó do Sono', 'Constrict': 'Constrição', 'Petal Dance': 'Dança das Pétalas', 
  'Mega Drain': 'Mega Dreno', 'Vine Whip': 'Chicote de Vinha', 'Smog': 'Poluição', 'Disable': 'Desabilitar', 
  'Poison Gas': 'Gás Venenoso', 'Sludge': 'Lama', 'Smokescreen': 'Cortina de Fumaça', 'Psybeam': 'Raio Psíquico', 
  'Psywave': 'Onda Psíquica', 'Recover': 'Recuperar', 'Reflect': 'Refletir', 'Flash': 'Clarão', 
  'Leech Life': 'Sanguessuga', 'Fire Spin': 'Giro de Fogo', 'Stomp': 'Pisotear', 'Fire Blast': 'Rajada de Fogo', 
  'Agility': 'Agilidade', 'Horn Drill': 'Broca de Chifre', 'Dig': 'Cavar', 'Slash': 'Talho', 
  'Poison Sting': 'Picada Venenosa', 'Horn Attack': 'Ataque de Chifre', 'Fissure': 'Fissura', 
  'Earthquake': 'Terremoto', 'Fury Swipes': 'Golpes de Fúria', 'Thunder': 'Trovão', 'Confusion': 'Confusão',
  'Tail Whip': 'Chicote de Cauda', 'Fury Attack': 'Ataque de Fúria'
};

const POKEMON_TYPES = [
  { id: 'fire', label: { pt: 'Fogo', en: 'Fire' }, color: '#F44336' },
  { id: 'water', label: { pt: 'Água', en: 'Water' }, color: '#2196F3' },
  { id: 'grass', label: { pt: 'Planta', en: 'Grass' }, color: '#4CAF50' },
  { id: 'electric', label: { pt: 'Elétrico', en: 'Electric' }, color: '#FFEB3B' },
  { id: 'ice', label: { pt: 'Gelo', en: 'Ice' }, color: '#00BCD4' },
  { id: 'fighting', label: { pt: 'Lutador', en: 'Fighting' }, color: '#FF5722' },
  { id: 'poison', label: { pt: 'Venenoso', en: 'Poison' }, color: '#9C27B0' },
  { id: 'ground', label: { pt: 'Terrestre', en: 'Ground' }, color: '#795548' },
  { id: 'flying', label: { pt: 'Voador', en: 'Flying' }, color: '#03A9F4' },
  { id: 'psychic', label: { pt: 'Psíquico', en: 'Psychic' }, color: '#E040FB' },
  { id: 'bug', label: { pt: 'Inseto', en: 'Bug' }, color: '#8BC34A' },
  { id: 'rock', label: { pt: 'Pedra', en: 'Rock' }, color: '#795548' },
  { id: 'ghost', label: { pt: 'Fantasma', en: 'Ghost' }, color: '#673AB7' },
  { id: 'dragon', label: { pt: 'Dragão', en: 'Dragon' }, color: '#3F51B5' },
  { id: 'normal', label: { pt: 'Normal', en: 'Normal' }, color: '#9E9E9E' },
  { id: 'fairy', label: { pt: 'Fada', en: 'Fairy' }, color: '#E91E63' },
];

const lightTheme = {
  background: '#F2F2F2', cardBg: '#FFFFFF', textPrimary: '#2B2B2B', textSecondary: '#555555',
  searchBarBg: '#E8E8E8', border: '#EEEEEE', bottomNavBg: 'rgba(255, 255, 255, 0.65)',
  bottomNavBorder: 'rgba(255, 255, 255, 0.8)', inactiveIcon: '#000000', pillInactiveBg: '#F0F0F0',
  pillActiveBg: '#333333', pillActiveText: '#FFFFFF', pillInactiveText: '#666666'
};
const darkTheme = {
  background: '#121212', cardBg: '#1E1E1E', textPrimary: '#FFFFFF', textSecondary: '#AAAAAA',
  searchBarBg: '#2C2C2E', border: '#333333', bottomNavBg: 'rgba(30, 30, 30, 0.65)',
  bottomNavBorder: 'rgba(50, 50, 50, 0.8)', inactiveIcon: '#FFFFFF', pillInactiveBg: '#2C2C2E',
  pillActiveBg: '#FFFFFF', pillActiveText: '#000000', pillInactiveText: '#AAAAAA'
};
const ThemeContext = createContext({ isDark: false, theme: lightTheme, toggleTheme: (v: boolean) => {} });
export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { AsyncStorage.getItem('@pokedex_theme').then(stored => { if (stored) setIsDark(stored === 'dark'); }); }, []);
  const toggleTheme = async (value: boolean) => { setIsDark(value); await AsyncStorage.setItem('@pokedex_theme', value ? 'dark' : 'light'); };
  return <ThemeContext.Provider value={{ isDark, theme: isDark ? darkTheme : lightTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

const SettingsContext = createContext({
  soundEnabled: true, toggleSound: (v: boolean) => {},
  isBoldText: false, toggleBoldText: (v: boolean) => {},
  isLargeText: false, toggleLargeText: (v: boolean) => {},
  showWeight: true, toggleShowWeight: (v: boolean) => {},
  language: 'PT-BR', setLanguage: (v: string) => {}
});
export const SettingsProvider = ({ children }: any) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isBoldText, setIsBoldText] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [showWeight, setShowWeight] = useState(true);
  const [language, setLanguage] = useState('PT-BR');
  useEffect(() => {
    async function loadSettings() {
      const s = await AsyncStorage.getItem('@pokedex_sound'); const b = await AsyncStorage.getItem('@pokedex_bold');
      const l = await AsyncStorage.getItem('@pokedex_large'); const w = await AsyncStorage.getItem('@pokedex_weight');
      const lang = await AsyncStorage.getItem('@pokedex_lang');
      if (s !== null) setSoundEnabled(s === 'true'); if (b !== null) setIsBoldText(b === 'true');
      if (l !== null) setIsLargeText(l === 'true'); if (w !== null) setShowWeight(w === 'true');
      if (lang !== null) setLanguage(lang);
    }
    loadSettings();
  }, []);
  const toggleSound = async (val: boolean) => { setSoundEnabled(val); await AsyncStorage.setItem('@pokedex_sound', val.toString()); };
  const toggleBoldText = async (val: boolean) => { setIsBoldText(val); await AsyncStorage.setItem('@pokedex_bold', val.toString()); };
  const toggleLargeText = async (val: boolean) => { setIsLargeText(val); await AsyncStorage.setItem('@pokedex_large', val.toString()); };
  const toggleShowWeight = async (val: boolean) => { setShowWeight(val); await AsyncStorage.setItem('@pokedex_weight', val.toString()); };
  const changeLanguage = async (val: string) => { setLanguage(val); await AsyncStorage.setItem('@pokedex_lang', val); };
  return (
    <SettingsContext.Provider value={{ soundEnabled, toggleSound, isBoldText, toggleBoldText, isLargeText, toggleLargeText, showWeight, toggleShowWeight, language, setLanguage: changeLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

const FavoritesContext = createContext<{ favorites: any[]; toggleFavorite: (p: any) => void; isFavorite: (id: number) => boolean; }>({
  favorites: [], toggleFavorite: () => {}, isFavorite: () => false,
});
export const FavoritesProvider = ({ children }: any) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  useEffect(() => { AsyncStorage.getItem('@pokedex_favorites').then(stored => { if (stored) setFavorites(JSON.parse(stored)); }); }, []);
  const toggleFavorite = async (pokemon: any) => {
    const newFavorites = favorites.find(f => f.id === pokemon.id) ? favorites.filter(f => f.id !== pokemon.id) : [...favorites, pokemon];
    setFavorites(newFavorites); await AsyncStorage.setItem('@pokedex_favorites', JSON.stringify(newFavorites));
  };
  const isFavorite = (id: number) => favorites.some(f => f.id === id);
  return <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>;
};

const img = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const mv = (typeId: string, name: string, stats: string) => ({ typeId, typeColor: ptColors[typeNames[typeId].pt], name, stats });

const REGIONS = [
  { id: '1', name: 'Kanto', desc: { pt: 'Pokémon Red/Blue/Yellow', en: 'Pokémon Red/Blue/Yellow' }, image: img(4) },
  { id: '2', name: 'Johto', desc: { pt: 'Pokémon Gold/Silver/Crystal', en: 'Pokémon Gold/Silver/Crystal' }, image: img(155) },
  { id: '3', name: 'Hoenn', desc: { pt: 'Pokémon Ruby/Sapphire/Emerald', en: 'Pokémon Ruby/Sapphire/Emerald' }, image: img(255) },
  { id: '4', name: 'Sinnoh', desc: { pt: 'Pokémon Diamond/Pearl', en: 'Pokémon Diamond/Pearl' }, image: img(393) },
];

const KANTO_CHARACTERS = [
  { 
    id: '1', name: 'Brock', role: 'gym_leader', desc: { pt: 'Cidade de Pewter', en: 'Pewter City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png', color: '#D4C294',
    about: { pt: 'Brock é o líder de academia do Pewter City Gym e é especialista em Pokémon do tipo Pedra. Ele dá a Insígnia da Rocha aos treinadores que o derrotam.', en: 'Brock is the Gym Leader of Pewter City Gym and specializes in Rock-type Pokémon. He gives the Boulder Badge to trainers who defeat him.' },
    mainType: 'rock', weaknesses: ['water', 'grass', 'fighting'],
    reward: { pt: { badgeName: 'Insígnia da Rocha', badgeDesc: 'Pokémons até o nível 20 obedecem suas ordens' }, en: { badgeName: 'Boulder Badge', badgeDesc: 'Pokémon up to level 20 obey your orders' }, tmType: 'rock', tmName: 'TM34 Bide', tmStats: 'PP: 10/10' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Geodude', id: '#074', image: img(74), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('rock', 'Bide', 'PP: 10 PWR: - ACC: 100')] }, { name: 'Onix', id: '#095', image: img(95), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('rock', 'Bide', 'PP: 10 PWR: - ACC: 100'), mv('normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85')] } ],
      'yellow': [ { name: 'Geodude', id: '#074', image: img(74), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100')] }, { name: 'Onix', id: '#095', image: img(95), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('rock', 'Bide', 'PP: 10 PWR: - ACC: 100'), mv('normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85'), mv('normal', 'Screech', 'PP: 40 PWR: - ACC: 85')] } ]
    }
  },
  { 
    id: '2', name: 'Misty', role: 'gym_leader', desc: { pt: 'Cidade de Cerulean', en: 'Cerulean City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png', color: '#92D2EF',
    about: { pt: 'Misty é a líder de academia do Cerulean City Gym e é especialista em Pokémon do tipo Água. Ela dá o Distintivo Cascade aos treinadores que a derrotam.', en: 'Misty is the Gym Leader of Cerulean City Gym and specializes in Water-type Pokémon. She gives the Cascade Badge to trainers who defeat her.' },
    mainType: 'water', weaknesses: ['grass', 'electric'],
    reward: { pt: { badgeName: 'Insígnia da Cascata', badgeDesc: 'Pokémons até o nível 30 obedecem suas ordens' }, en: { badgeName: 'Cascade Badge', badgeDesc: 'Pokémon up to level 30 obey your orders' }, tmType: 'water', tmName: "TM03 Bubble Beam", tmStats: 'PP: 20/20' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Staryu', id: '#120', image: img(120), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('water', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100')] }, { name: 'Starmie', id: '#121', image: img(121), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('water', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100'), mv('water', 'Bubble Beam', 'PP: 20 PWR: 65 ACC: 100')] } ],
      'yellow': [ { name: 'Staryu', id: '#120', image: img(120), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('water', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100')] }, { name: 'Starmie', id: '#121', image: img(121), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('water', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100'), mv('water', 'Bubble Beam', 'PP: 20 PWR: 65 ACC: 100'), mv('normal', 'Harden', 'PP: 30 PWR: - ACC: -')] } ]
    }
  },
  { 
    id: '3', name: 'Lt. Surge', role: 'gym_leader', desc: { pt: 'Cidade de Vermilion', en: 'Vermilion City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png', color: '#FFF59D',
    about: { pt: 'Conhecido como o Raio Americano, Lt. Surge é um veterano durão que usa Pokémons elétricos para paralisar seus oponentes.', en: 'Known as the Lightning American, Lt. Surge is a tough veteran who uses Electric Pokémon to paralyze his opponents.' },
    mainType: 'electric', weaknesses: ['ground'],
    reward: { pt: { badgeName: 'Insígnia do Trovão', badgeDesc: 'Aumenta a Velocidade dos seus Pokémons' }, en: { badgeName: 'Thunder Badge', badgeDesc: 'Increases the Speed of your Pokémon' }, tmType: 'electric', tmName: "TM24 Thunderbolt", tmStats: 'PP: 15/15' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Voltorb', id: '#100', image: img(100), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('normal', 'Screech', 'PP: 40 PWR: - ACC: 85'), mv('normal', 'Sonic Boom', 'PP: 20 PWR: - ACC: 90')] }, { name: 'Pikachu', id: '#025', image: img(25), moves: [mv('normal', 'Growl', 'PP: 40 PWR: - ACC: 100'), mv('normal', 'Quick Attack', 'PP: 30 PWR: 40 ACC: 100'), mv('electric', 'Thunder Wave', 'PP: 20 PWR: - ACC: 100')] }, { name: 'Raichu', id: '#026', image: img(26), moves: [mv('electric', 'Thunderbolt', 'PP: 15 PWR: 90 ACC: 100'), mv('normal', 'Growl', 'PP: 40 PWR: - ACC: 100')] } ],
      'yellow': [ { name: 'Raichu', id: '#026', image: img(26), moves: [mv('electric', 'Thunderbolt', 'PP: 15 PWR: 90 ACC: 100'), mv('normal', 'Mega Punch', 'PP: 20 PWR: 80 ACC: 85'), mv('normal', 'Mega Kick', 'PP: 5 PWR: 120 ACC: 75'), mv('normal', 'Growl', 'PP: 40 PWR: - ACC: 100')] } ]
    }
  },
  { 
    id: '4', name: 'Erika', role: 'gym_leader', desc: { pt: 'Cidade de Celadon', en: 'Celadon City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/erika.png', color: '#A5D6A7',
    about: { pt: 'Erika ama a natureza e ensina arranjos de flores. Ela usa Pokémons do tipo Planta, drenando a energia dos adversários.', en: 'Erika loves nature and teaches flower arrangement. She uses Grass-type Pokémon, draining her opponents energy.' },
    mainType: 'grass', weaknesses: ['fire', 'flying', 'ice'],
    reward: { pt: { badgeName: 'Insígnia do Arco-Íris', badgeDesc: 'Pokémons até o nível 50 obedecem suas ordens' }, en: { badgeName: 'Rainbow Badge', badgeDesc: 'Pokémon up to level 50 obey your orders' }, tmType: 'grass', tmName: "TM21 Mega Drain", tmStats: 'PP: 15/15' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Victreebel', id: '#071', image: img(71), moves: [mv('grass', 'Razor Leaf', 'PP: 25 PWR: 55 ACC: 95'), mv('grass', 'Sleep Powder', 'PP: 15 PWR: - ACC: 75')] }, { name: 'Tangela', id: '#114', image: img(114), moves: [mv('normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85'), mv('normal', 'Constrict', 'PP: 35 PWR: 10 ACC: 100')] }, { name: 'Vileplume', id: '#045', image: img(45), moves: [mv('grass', 'Petal Dance', 'PP: 20 PWR: 70 ACC: 100'), mv('grass', 'Mega Drain', 'PP: 10 PWR: 40 ACC: 100')] } ],
      'yellow': [ { name: 'Tangela', id: '#114', image: img(114), moves: [mv('normal', 'Bind', 'PP: 20 PWR: 15 ACC: 85'), mv('grass', 'Vine Whip', 'PP: 10 PWR: 35 ACC: 100')] }, { name: 'Weepinbell', id: '#070', image: img(70), moves: [mv('grass', 'Razor Leaf', 'PP: 25 PWR: 55 ACC: 95')] }, { name: 'Gloom', id: '#044', image: img(44), moves: [mv('grass', 'Petal Dance', 'PP: 20 PWR: 70 ACC: 100')] } ]
    }
  },
  { 
    id: '5', name: 'Koga', role: 'gym_leader', desc: { pt: 'Cidade de Fuchsia', en: 'Fuchsia City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/koga.png', color: '#CE93D8',
    about: { pt: 'Koga é um mestre ninja que utiliza táticas de envenenamento e confusão.', en: 'Koga is a ninja master who uses poisoning and confusion tactics.' },
    mainType: 'poison', weaknesses: ['ground', 'psychic'],
    reward: { pt: { badgeName: 'Insígnia da Alma', badgeDesc: 'Aumenta a Defesa dos seus Pokémons' }, en: { badgeName: 'Soul Badge', badgeDesc: 'Increases the Defense of your Pokémon' }, tmType: 'poison', tmName: "TM06 Toxic", tmStats: 'PP: 10/10' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Koffing', id: '#109', image: img(109), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100'), mv('poison', 'Smog', 'PP: 20 PWR: 20 ACC: 70')] }, { name: 'Muk', id: '#089', image: img(89), moves: [mv('poison', 'Sludge', 'PP: 20 PWR: 65 ACC: 100')] }, { name: 'Weezing', id: '#110', image: img(110), moves: [mv('poison', 'Toxic', 'PP: 10 PWR: - ACC: 85'), mv('poison', 'Sludge', 'PP: 20 PWR: 65 ACC: 100')] } ],
      'yellow': [ { name: 'Venonat', id: '#048', image: img(48), moves: [mv('normal', 'Tackle', 'PP: 35 PWR: 40 ACC: 100')] }, { name: 'Venomoth', id: '#049', image: img(49), moves: [mv('poison', 'Toxic', 'PP: 10 PWR: - ACC: 85'), mv('psychic', 'Psybeam', 'PP: 20 PWR: 65 ACC: 100')] } ]
    }
  },
  { 
    id: '6', name: 'Sabrina', role: 'gym_leader', desc: { pt: 'Cidade de Saffron', en: 'Saffron City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/sabrina.png', color: '#F8BBD0',
    about: { pt: 'Sabrina possui poderes psíquicos desde criança. Ela e seus Pokémons enxergam o futuro.', en: 'Sabrina has had psychic powers since childhood. She and her Pokémon can see the future.' },
    mainType: 'psychic', weaknesses: ['bug', 'ghost'],
    reward: { pt: { badgeName: 'Insígnia do Pântano', badgeDesc: 'Pokémons até o nível 70 obedecem suas ordens' }, en: { badgeName: 'Marsh Badge', badgeDesc: 'Pokémon up to level 70 obey your orders' }, tmType: 'psychic', tmName: "TM46 Psywave", tmStats: 'PP: 15/15' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Kadabra', id: '#064', image: img(64), moves: [mv('psychic', 'Psybeam', 'PP: 20 PWR: 65 ACC: 100')] }, { name: 'Mr. Mime', id: '#122', image: img(122), moves: [mv('psychic', 'Confusion', 'PP: 25 PWR: 50 ACC: 100'), mv('psychic', 'Barrier', 'PP: 30 PWR: - ACC: -')] }, { name: 'Alakazam', id: '#065', image: img(65), moves: [mv('psychic', 'Psywave', 'PP: 15 PWR: - ACC: 80'), mv('normal', 'Recover', 'PP: 20 PWR: - ACC: -')] } ],
      'yellow': [ { name: 'Abra', id: '#063', image: img(63), moves: [mv('normal', 'Flash', 'PP: 20 PWR: - ACC: 70')] }, { name: 'Kadabra', id: '#064', image: img(64), moves: [mv('psychic', 'Psywave', 'PP: 15 PWR: - ACC: 80')] }, { name: 'Alakazam', id: '#065', image: img(65), moves: [mv('psychic', 'Psywave', 'PP: 15 PWR: - ACC: 80')] } ]
    }
  },
  { 
    id: '7', name: 'Blaine', role: 'gym_leader', desc: { pt: 'Ilha Cinnabar', en: 'Cinnabar Island' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/blaine.png', color: '#EF9A9A',
    about: { pt: 'Um brilhante cientista apaixonado por charadas. Blaine incinera os desafiantes com o tipo Fogo.', en: 'A brilliant scientist passionate about riddles. Blaine incinerates challengers with Fire-type Pokémon.' },
    mainType: 'fire', weaknesses: ['water', 'ground', 'rock'],
    reward: { pt: { badgeName: 'Insígnia do Vulcão', badgeDesc: 'Aumenta o Special Attack' }, en: { badgeName: 'Volcano Badge', badgeDesc: 'Increases Special Attack' }, tmType: 'fire', tmName: "TM38 Fire Blast", tmStats: 'PP: 5/5' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Growlithe', id: '#058', image: img(58), moves: [mv('normal', 'Bite', 'PP: 25 PWR: 60 ACC: 100')] }, { name: 'Ponyta', id: '#077', image: img(77), moves: [mv('fire', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] }, { name: 'Rapidash', id: '#078', image: img(78), moves: [mv('normal', 'Stomp', 'PP: 20 PWR: 65 ACC: 100'), mv('fire', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] }, { name: 'Arcanine', id: '#059', image: img(59), moves: [mv('fire', 'Fire Blast', 'PP: 5 PWR: 120 ACC: 85')] } ],
      'yellow': [ { name: 'Ninetales', id: '#038', image: img(38), moves: [mv('fire', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] }, { name: 'Rapidash', id: '#078', image: img(78), moves: [mv('fire', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70')] }, { name: 'Arcanine', id: '#059', image: img(59), moves: [mv('fire', 'Fire Blast', 'PP: 5 PWR: 120 ACC: 85')] } ]
    }
  },
  { 
    id: '8', name: 'Giovanni', role: 'gym_leader', desc: { pt: 'Cidade de Viridian', en: 'Viridian City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/giovanni.png', color: '#BCAAA4',
    about: { pt: 'O chefe misterioso da Equipe Rocket. Ele utiliza força esmagadora com Pokémons do tipo Terrestre.', en: 'The mysterious boss of Team Rocket. He uses overwhelming force with Ground-type Pokémon.' },
    mainType: 'ground', weaknesses: ['water', 'grass', 'ice'],
    reward: { pt: { badgeName: 'Insígnia da Terra', badgeDesc: 'Todos os Pokémons te obedecerão' }, en: { badgeName: 'Earth Badge', badgeDesc: 'All Pokémon will obey you' }, tmType: 'ground', tmName: "TM27 Fissure", tmStats: 'PP: 5/5' },
    availableGames: [{ id: 'red-blue', name: 'Pokémon Red & Blue' }, { id: 'yellow', name: 'Pokémon Yellow' }],
    teams: {
      'red-blue': [ { name: 'Rhyhorn', id: '#111', image: img(111), moves: [mv('normal', 'Stomp', 'PP: 20 PWR: 65 ACC: 100')] }, { name: 'Dugtrio', id: '#051', image: img(51), moves: [mv('ground', 'Dig', 'PP: 10 PWR: 80 ACC: 100')] }, { name: 'Nidoqueen', id: '#031', image: img(31), moves: [mv('normal', 'Body Slam', 'PP: 15 PWR: 85 ACC: 100')] }, { name: 'Nidoking', id: '#034', image: img(34), moves: [mv('normal', 'Thrash', 'PP: 20 PWR: 90 ACC: 100')] }, { name: 'Rhydon', id: '#112', image: img(112), moves: [mv('ground', 'Fissure', 'PP: 5 PWR: - ACC: 30')] } ],
      'yellow': [ { name: 'Dugtrio', id: '#051', image: img(51), moves: [mv('ground', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100')] }, { name: 'Persian', id: '#053', image: img(53), moves: [mv('normal', 'Slash', 'PP: 20 PWR: 70 ACC: 100')] }, { name: 'Nidoqueen', id: '#031', image: img(31), moves: [mv('ground', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100')] }, { name: 'Nidoking', id: '#034', image: img(34), moves: [mv('ground', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100')] }, { name: 'Rhydon', id: '#112', image: img(112), moves: [mv('ground', 'Earthquake', 'PP: 10 PWR: 100 ACC: 100')] } ]
    }
  },
  { 
    id: '9', name: 'Lorelei', role: 'elite_four', desc: { pt: 'Planalto Índigo (1/4)', en: 'Indigo Plateau (1/4)' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/lorelei-gen1.png', color: '#B2EBF2',
    about: { pt: 'Lorelei é a primeira membro da Elite dos Quatro de Kanto. Ela é uma mestra fria e calculista do tipo Gelo.', en: 'Lorelei is the first member of the Kanto Elite Four. She is a cold and calculating Ice-type master.' },
    mainType: 'ice', weaknesses: ['fire', 'fighting', 'electric'],
    reward: { pt: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso ao próximo membro' }, en: { badgeName: 'Elite 4 Victory', badgeDesc: 'Access to the next member' }, tmType: 'ice', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': [
      { name: 'Dewgong', id: '#087', image: img(87), moves: [mv('water', 'Aurora Beam', 'PP: 20 PWR: 65 ACC: 100'), mv('normal', 'Take Down', 'PP: 20 PWR: 90 ACC: 85'), mv('ice', 'Rest', 'PP: 10 PWR: - ACC: -')] },
      { name: 'Cloyster', id: '#091', image: img(91), moves: [mv('water', 'Clamp', 'PP: 10 PWR: 35 ACC: 75'), mv('ice', 'Aurora Beam', 'PP: 20 PWR: 65 ACC: 100'), mv('normal', 'Supersonic', 'PP: 20 PWR: - ACC: 55')] },
      { name: 'Slowbro', id: '#080', image: img(80), moves: [mv('water', 'Water Gun', 'PP: 25 PWR: 40 ACC: 100'), mv('psychic', 'Amnesia', 'PP: 20 PWR: - ACC: -'), mv('normal', 'Growl', 'PP: 40 PWR: - ACC: 100')] },
      { name: 'Jynx', id: '#124', image: img(124), moves: [mv('ice', 'Ice Punch', 'PP: 15 PWR: 75 ACC: 100'), mv('normal', 'Thrash', 'PP: 20 PWR: 90 ACC: 100'), mv('normal', 'Doubleslap', 'PP: 10 PWR: 15 ACC: 85')] },
      { name: 'Lapras', id: '#131', image: img(131), moves: [mv('ice', 'Blizzard', 'PP: 5 PWR: 120 ACC: 90'), mv('water', 'Hydro Pump', 'PP: 5 PWR: 120 ACC: 80'), mv('normal', 'Body Slam', 'PP: 15 PWR: 85 ACC: 100')] }
    ] }
  },
  { 
    id: '10', name: 'Bruno', role: 'elite_four', desc: { pt: 'Planalto Índigo (2/4)', en: 'Indigo Plateau (2/4)' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/bruno.png', color: '#FFAB91',
    about: { pt: 'O segundo membro da Elite dos Quatro. Bruno treina exaustivamente com seus Pokémons do tipo Lutador nas montanhas.', en: 'The second member of the Elite Four. Bruno trains exhaustively with his Fighting-type Pokémon in the mountains.' },
    mainType: 'fighting', weaknesses: ['flying', 'psychic'],
    reward: { pt: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso ao próximo membro' }, en: { badgeName: 'Elite 4 Victory', badgeDesc: 'Access to the next member' }, tmType: 'fighting', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': [
      { name: 'Onix', id: '#095', image: img(95), moves: [mv('rock', 'Rock Throw', 'PP: 15 PWR: 50 ACC: 65'), mv('normal', 'Rage', 'PP: 20 PWR: 20 ACC: 100')] },
      { name: 'Hitmonchan', id: '#107', image: img(107), moves: [mv('fire', 'Fire Punch', 'PP: 15 PWR: 75 ACC: 100'), mv('ice', 'Ice Punch', 'PP: 15 PWR: 75 ACC: 100'), mv('electric', 'Thunder Punch', 'PP: 15 PWR: 75 ACC: 100')] },
      { name: 'Hitmonlee', id: '#106', image: img(106), moves: [mv('fighting', 'Jump Kick', 'PP: 25 PWR: 70 ACC: 95'), mv('fighting', 'Double Kick', 'PP: 30 PWR: 30 ACC: 100'), mv('fighting', 'Rolling Kick', 'PP: 15 PWR: 60 ACC: 85')] },
      { name: 'Onix', id: '#095', image: img(95), moves: [mv('normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('rock', 'Rock Throw', 'PP: 15 PWR: 50 ACC: 65')] },
      { name: 'Machamp', id: '#068', image: img(68), moves: [mv('fighting', 'Karate Chop', 'PP: 25 PWR: 50 ACC: 100'), mv('fighting', 'Submission', 'PP: 20 PWR: 80 ACC: 80')] }
    ] }
  },
  { 
    id: '11', name: 'Agatha', role: 'elite_four', desc: { pt: 'Planalto Índigo (3/4)', en: 'Indigo Plateau (3/4)' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/agatha-gen1.png', color: '#B39DDB',
    about: { pt: 'Uma idosa ranzinza que foi rival do Prof. Carvalho no passado. Ela aterroriza adversários com o tipo Fantasma.', en: 'A grumpy old lady who was a rival of Prof. Oak in the past. She terrifies opponents with Ghost-type Pokémon.' },
    mainType: 'ghost', weaknesses: ['psychic', 'ghost'],
    reward: { pt: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso ao próximo membro' }, en: { badgeName: 'Elite 4 Victory', badgeDesc: 'Access to the next member' }, tmType: 'ghost', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': [
      { name: 'Gengar', id: '#094', image: img(94), moves: [mv('ghost', 'Confuse Ray', 'PP: 10 PWR: - ACC: 100'), mv('psychic', 'Dream Eater', 'PP: 15 PWR: 100 ACC: 100')] },
      { name: 'Golbat', id: '#042', image: img(42), moves: [mv('flying', 'Wing Attack', 'PP: 35 PWR: 35 ACC: 100'), mv('ice', 'Haze', 'PP: 30 PWR: - ACC: -')] },
      { name: 'Haunter', id: '#093', image: img(93), moves: [mv('ghost', 'Night Shade', 'PP: 15 PWR: - ACC: 100'), mv('psychic', 'Hypnosis', 'PP: 20 PWR: - ACC: 60')] },
      { name: 'Arbok', id: '#024', image: img(24), moves: [mv('normal', 'Wrap', 'PP: 20 PWR: 15 ACC: 85'), mv('normal', 'Glare', 'PP: 30 PWR: - ACC: 75'), mv('poison', 'Acid', 'PP: 30 PWR: 40 ACC: 100')] },
      { name: 'Gengar', id: '#094', image: img(94), moves: [mv('poison', 'Toxic', 'PP: 10 PWR: - ACC: 85'), mv('ghost', 'Night Shade', 'PP: 15 PWR: - ACC: 100'), mv('psychic', 'Dream Eater', 'PP: 15 PWR: 100 ACC: 100')] }
    ] }
  },
  { 
    id: '12', name: 'Lance', role: 'elite_four', desc: { pt: 'Planalto Índigo (4/4)', en: 'Indigo Plateau (4/4)' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/lance.png', color: '#9FA8DA',
    about: { pt: 'O líder da Elite dos Quatro de Kanto. Lance comanda Pokémons Dragões lendários e implacáveis.', en: 'The leader of the Kanto Elite Four. Lance commands legendary and relentless Dragon Pokémon.' },
    mainType: 'dragon', weaknesses: ['ice', 'dragon'],
    reward: { pt: { badgeName: 'Vitória da Elite 4', badgeDesc: 'Acesso à batalha contra o Campeão' }, en: { badgeName: 'Elite 4 Victory', badgeDesc: 'Access to the Champion battle' }, tmType: 'dragon', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': [
      { name: 'Gyarados', id: '#130', image: img(130), moves: [mv('water', 'Hydro Pump', 'PP: 5 PWR: 120 ACC: 80'), mv('dragon', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100'), mv('normal', 'Bite', 'PP: 25 PWR: 60 ACC: 100')] },
      { name: 'Dragonair', id: '#148', image: img(148), moves: [mv('normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('dragon', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100')] },
      { name: 'Dragonair', id: '#148', image: img(148), moves: [mv('normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('dragon', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100')] },
      { name: 'Aerodactyl', id: '#142', image: img(142), moves: [mv('normal', 'Hyper Beam', 'PP: 5 PWR: 150 ACC: 90'), mv('normal', 'Bite', 'PP: 25 PWR: 60 ACC: 100')] },
      { name: 'Dragonite', id: '#149', image: img(149), moves: [mv('normal', 'Hyper Beam', 'PP: 5 PWR: 150 ACC: 90'), mv('normal', 'Slam', 'PP: 20 PWR: 80 ACC: 75'), mv('psychic', 'Barrier', 'PP: 30 PWR: - ACC: -')] }
    ] }
  },
  { 
    id: '13', name: 'Blue (Rival)', role: 'champion', desc: { pt: 'Planalto Índigo (Campeão)', en: 'Indigo Plateau (Champion)' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/blue-gen1.png', color: '#BDBDBD',
    about: { pt: 'O neto do Prof. Carvalho e seu rival desde o início. Ele derrotou a Elite dos Quatro primeiro e se tornou o Campeão. Sua última batalha no jogo!', en: 'Prof. Oaks grandson and your rival since the beginning. He defeated the Elite Four first and became the Champion. Your final battle!' },
    mainType: 'normal', weaknesses: ['fighting'],
    reward: { pt: { badgeName: 'Hall da Fama', badgeDesc: 'Você se torna o Mestre Pokémon' }, en: { badgeName: 'Hall of Fame', badgeDesc: 'You become the Pokémon Master' }, tmType: 'normal', tmName: "Sem TM", tmStats: '-' },
    availableGames: [{ id: 'rb-y', name: 'Pokémon RB/Y' }],
    teams: { 'rb-y': [
      { name: 'Pidgeot', id: '#018', image: img(18), moves: [mv('flying', 'Wing Attack', 'PP: 35 PWR: 35 ACC: 100'), mv('normal', 'Quick Attack', 'PP: 30 PWR: 40 ACC: 100')] },
      { name: 'Alakazam', id: '#065', image: img(65), moves: [mv('psychic', 'Psybeam', 'PP: 20 PWR: 65 ACC: 100'), mv('normal', 'Recover', 'PP: 20 PWR: - ACC: -')] },
      { name: 'Rhydon', id: '#112', image: img(112), moves: [mv('normal', 'Tail Whip', 'PP: 30 PWR: - ACC: 100'), mv('normal', 'Fury Attack', 'PP: 20 PWR: 15 ACC: 85')] },
      { name: 'Exeggutor', id: '#103', image: img(103), moves: [mv('psychic', 'Hypnosis', 'PP: 20 PWR: - ACC: 60'), mv('normal', 'Stomp', 'PP: 20 PWR: 65 ACC: 100')] },
      { name: 'Gyarados', id: '#130', image: img(130), moves: [mv('dragon', 'Dragon Rage', 'PP: 10 PWR: - ACC: 100'), mv('water', 'Hydro Pump', 'PP: 5 PWR: 120 ACC: 80')] },
      { name: 'Charizard', id: '#006', image: img(6), moves: [mv('fire', 'Fire Spin', 'PP: 15 PWR: 35 ACC: 70'), mv('normal', 'Slash', 'PP: 20 PWR: 70 ACC: 100')] }
    ] }
  },
  { 
    id: '14', name: 'Name Rater', role: 'useful_npc', desc: { pt: 'Cidade de Lavender', en: 'Lavender Town' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/gentleman.png', color: '#EEEEEE',
    about: { pt: 'O Avaliador de Nomes (Name Rater) tem o poder de mudar os apelidos que você deu aos seus Pokémons.', en: 'The Name Rater has the power to change the nicknames you gave to your Pokémon.' },
    npcInfo: { pt: { location: 'Fica numa casa ao sul na Cidade de Lavender.', cost: 'Gratuito', service: 'Renomear Pokémons capturados por você.' }, en: { location: 'Located in a southern house in Lavender Town.', cost: 'Free', service: 'Rename Pokémon caught by you.' } }
  },
  { 
    id: '15', name: 'Move Deleter', role: 'useful_npc', desc: { pt: 'Cidade de Fuchsia', en: 'Fuchsia City' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/supernerd.png', color: '#EEEEEE',
    about: { pt: 'O Apagador de Golpes (Move Deleter) é o único NPC do jogo capaz de fazer o seu Pokémon esquecer habilidades de HMs (como Surf ou Cut).', en: 'The Move Deleter is the only NPC capable of making your Pokémon forget HM moves (like Surf or Cut).' },
    npcInfo: { pt: { location: 'Fuchsia City, na casa bem ao lado do Centro Pokémon.', cost: 'Gratuito', service: 'Apagar HMs e outros ataques.' }, en: { location: 'Fuchsia City, in the house right next to the Pokémon Center.', cost: 'Free', service: 'Delete HMs and other moves.' } }
  },
  { 
    id: '16', name: 'Daycare Man', role: 'useful_npc', desc: { pt: 'Rota 5', en: 'Route 5' }, 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/pokefanf.png', color: '#EEEEEE',
    about: { pt: 'O homem do Daycare cuida do seu Pokémon enquanto você viaja, aumentando a experiência dele a cada passo que você dá no jogo.', en: 'The Daycare man takes care of your Pokémon while you travel, increasing its experience with every step you take in the game.' },
    npcInfo: { pt: { location: 'Casa isolada na Rota 5, abaixo da Cidade de Cerulean.', cost: '100$ + 100$ por Nível', service: 'Treinamento de experiência.' }, en: { location: 'Isolated house on Route 5, below Cerulean City.', cost: '$100 + $100 per Level', service: 'Experience training.' } }
  }
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
    <ThemeProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useContext(ThemeContext);
  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <NavigationContainer>
        <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
          <Tab.Screen name="PokemonsTab" component={PokemonStackScreen} />
          <Tab.Screen name="DexTab" component={DexScreen} />
          <Tab.Screen name="LideresTab" component={LeaderStackScreen} />
          <Tab.Screen name="AjustesTab" component={AjustesScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

function HomeScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext);
  const { isBoldText, isLargeText, language } = useContext(SettingsContext);
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
          return { id: id.toString().padStart(3, '0'), rawId: id, name: item.name.charAt(0).toUpperCase() + item.name.slice(1), spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`, types: null };
        });
        setAllPokemonCache(parsed);
      }).catch(console.error);
  }, []);

  const fetchPokemons = async (reset = false) => {
    if (isLoadingMore && !reset) return;
    const currentOffset = reset ? 0 : offset;
    if (reset) { setIsLoading(true); setHasMore(true); } else { setIsLoadingMore(true); }

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
        batchToFetchDetails = fullList.slice(currentOffset, currentOffset + LIMIT).map(p => p.url);
        newHasMore = currentOffset + LIMIT < fullList.length;
      } else {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${LIMIT}`);
        const data = await response.json();
        batchToFetchDetails = data.results.map((item: any) => item.url);
        newHasMore = data.next !== null;
      }

      const detailedPromises = batchToFetchDetails.map((url: string) => fetch(url).then(res => res.json()));
      const detailedResults = await Promise.all(detailedPromises);
      
      const formattedList = detailedResults.map((detail: any) => ({
        id: detail.id.toString().padStart(3, '0'), rawId: detail.id,
        name: detail.name.charAt(0).toUpperCase() + detail.name.slice(1), 
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
        types: detail.types.map((t: any) => t.type.name),
      }));

      if (reset) setPokemonList(formattedList);
      else setPokemonList(prev => [...prev, ...formattedList]);
      
      setOffset(currentOffset + LIMIT);
      setHasMore(newHasMore);
    } catch (error) { console.error(error); } finally { setIsLoading(false); setIsLoadingMore(false); }
  };

  useEffect(() => { fetchPokemons(true); }, [activeFilter]);

  const loadMore = () => { if (!isLoadingMore && hasMore && query.trim() === '') fetchPokemons(false); };

  const filteredList = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized) {
      const results = allPokemonCache.filter((pokemon) => pokemon.name.toLowerCase().includes(normalized));
      if (activeFilter && fullFilteredList.length > 0) {
        const filteredIds = new Set(fullFilteredList.map(p => p.rawId));
        return results.filter(p => filteredIds.has(p.rawId));
      }
      return results;
    }
    return pokemonList;
  }, [query, pokemonList, allPokemonCache, activeFilter, fullFilteredList]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 42 }]}>MoveDex</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }, isLargeText && { fontSize: 22 }]}>{t(language, 'subtitle')}</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.searchBarBg }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput value={query} onChangeText={setQuery} placeholder={t(language, 'searchAll')} placeholderTextColor={theme.textSecondary} style={[styles.searchInput, { color: theme.textPrimary }, isLargeText && { fontSize: 18 }]} />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={theme.textSecondary} /></TouchableOpacity>
        ) : <Ionicons name="mic-outline" size={20} color={theme.textSecondary} />}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textSecondary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'typeFilters')}</Text>
      <View style={{ height: 44, marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 22 }}>
          <TouchableOpacity style={[styles.filterPill, { backgroundColor: activeFilter === null ? theme.pillActiveBg : theme.pillInactiveBg, borderColor: theme.border }]} onPress={() => setActiveFilter(null)}>
            <Text style={[styles.filterPillText, { color: activeFilter === null ? theme.pillActiveText : theme.pillInactiveText }, isLargeText && { fontSize: 16 }]}>{t(language, 'all')}</Text>
          </TouchableOpacity>
          {POKEMON_TYPES.map(type => {
            const isActive = activeFilter === type.id;
            return (
              <TouchableOpacity key={type.id} style={[styles.filterPill, isActive ? { backgroundColor: type.color, borderColor: type.color } : { backgroundColor: theme.pillInactiveBg, borderColor: theme.border }]} onPress={() => setActiveFilter(type.id)}>
                <Text style={[styles.filterPillText, isActive ? { color: '#FFFFFF' } : { color: theme.pillInactiveText }, isLargeText && { fontSize: 16 }]}>{language === 'PT-BR' ? type.label.pt : type.label.en}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginBottom: 0 }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'pokemons')}</Text>
        {activeFilter && <Text style={[{ fontSize: 12, color: theme.textSecondary }, isLargeText && { fontSize: 14 }]}>{fullFilteredList.length} {t(language, 'results')}</Text>}
      </View>

      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.textPrimary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => <PokemonRow pokemon={item} onPress={() => navigation.navigate('Dex', { pokemonId: item.rawId })} theme={theme} isBoldText={isBoldText} isLargeText={isLargeText} language={language} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => isLoadingMore ? <ActivityIndicator size="small" color={theme.textSecondary} style={{ marginVertical: 20 }} /> : null}
          />
        )}
      </View>
    </View>
  );
}

function DexScreen({ route, navigation }: any) {
  const { theme } = useContext(ThemeContext);
  const { soundEnabled, isBoldText, isLargeText, showWeight, language } = useContext(SettingsContext);
  const [randomId, setRandomId] = useState(() => Math.floor(Math.random() * 151) + 1);
  const pokemonId = route?.params?.pokemonId || randomId;
  const [pokemonDetails, setPokemonDetails] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const isFav = isFavorite(pokemonId);

  useFocusEffect(useCallback(() => { if (!route?.params?.pokemonId) setRandomId(Math.floor(Math.random() * 151) + 1); }, [route?.params?.pokemonId]));

  useEffect(() => {
    async function fetchData() {
      if (!pokemonId) return;
      setIsLoading(true);
      try {
        const resBasic = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const dataBasic = await resBasic.json();
        const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const dataSpecies = await resSpecies.json();
        
        let ptDesc = dataSpecies.flavor_text_entries.find((e: any) => e.language.name === 'pt' || e.language.name === 'pt-BR')?.flavor_text.replace(/[\n\f]/g, ' ');
        const enDesc = dataSpecies.flavor_text_entries.find((e: any) => e.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ');
        if (!ptDesc) ptDesc = enDesc; 

        const primaryTypeId = dataBasic.types[0].type.name;
        const typesIds = dataBasic.types.map((t: any) => t.type.name);
        const rels = relationsMap[primaryTypeId] || { weak: [], ideal: [] };
        
        const rawMoves = dataBasic.moves;
        const gamesSet = new Set<string>();
        rawMoves.forEach((m: any) => m.version_group_details.forEach((vgd: any) => gamesSet.add(vgd.version_group.name)));
        
        const availableGames = Array.from(gamesSet).map(gameStr => ({
          id: gameStr, name: gameStr.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }));

        const allMovesParsed = rawMoves.map((m: any) => ({
          name: m.move.name.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          versions: m.version_group_details.map((vgd: any) => vgd.version_group.name),
          typeId: primaryTypeId 
        }));

        setPokemonDetails({
          name: dataBasic.name.charAt(0).toUpperCase() + dataBasic.name.slice(1),
          descPT: ptDesc || 'Nenhuma descrição.', descEN: enDesc || 'No description found.',
          typesIds, weaknessesIds: rels.weak, strengthsIds: rels.ideal,
          allMoves: allMovesParsed, availableGames, bgColor: getTypeData(primaryTypeId, 'PT-BR').color || '#E8E8E8',
          weight: dataBasic.weight / 10, height: dataBasic.height / 10,
        });

        setSelectedGame(availableGames.find(g => g.id === 'black-white')?.id || availableGames[0]?.id);

        const resEvo = await fetch(dataSpecies.evolution_chain.url);
        const dataEvo = await resEvo.json();
        const evoList = [];
        let currentEvo = dataEvo.chain;
        while (currentEvo && currentEvo.species) {
          const name = currentEvo.species.name;
          const id = parseInt(currentEvo.species.url.split('/')[6], 10);
          evoList.push({ name: name.charAt(0).toUpperCase() + name.slice(1), id: `#${id.toString().padStart(3, '0')}`, rawId: id, image: img(id) });
          currentEvo = currentEvo.evolves_to[0]; 
        }
        setEvolutions(evoList);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    }
    fetchData();
  }, [pokemonId]);

  useEffect(() => {
    let soundObj: Audio.Sound | null = null;
    async function playCry() {
      if (soundEnabled && pokemonDetails && !isLoading) {
        try {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const soundName = pokemonDetails.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const { sound } = await Audio.Sound.createAsync({ uri: `https://play.pokemonshowdown.com/audio/cries/${soundName}.mp3` }, { shouldPlay: true });
          soundObj = sound;
        } catch (e) {}
      }
    }
    playCry();
    return () => { if (soundObj) soundObj.unloadAsync(); };
  }, [pokemonDetails, isLoading, soundEnabled]);

  const { topMoves, bottomMoves } = useMemo(() => {
    if (!pokemonDetails?.allMoves || !selectedGame) return { topMoves: [], bottomMoves: [] };
    const movesForGame = pokemonDetails.allMoves.filter((m: any) => m.versions.includes(selectedGame));
    return { topMoves: movesForGame.slice(0, 4), bottomMoves: movesForGame.length > 4 ? movesForGame.slice(4).slice(-4).reverse() : [] };
  }, [pokemonDetails, selectedGame]);

  const translatedTopMoves = useMemo(() => {
    return topMoves.map((m: any) => ({ ...m, name: language === 'PT-BR' ? (moveTranslations[m.name] || m.name) : m.name }));
  }, [topMoves, language]);

  const translatedBottomMoves = useMemo(() => {
    return bottomMoves.map((m: any) => ({ ...m, name: language === 'PT-BR' ? (moveTranslations[m.name] || m.name) : m.name }));
  }, [bottomMoves, language]);

  const handleToggleFavorite = () => toggleFavorite({ id: pokemonId, name: pokemonDetails?.name || '?', image: img(pokemonId) });

  return (
    <View style={[styles.dexContainer, { backgroundColor: pokemonDetails?.bgColor || theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.dexScrollView}>
        <View style={styles.dexScrollHeader}>
          <View style={styles.dexHeaderRow}>
            {route?.params?.pokemonId ? (
              <TouchableOpacity style={[styles.backButtonCircle, { backgroundColor: theme.cardBg }]} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
              </TouchableOpacity>
            ) : <View />}
            <TouchableOpacity style={[styles.favoriteCircle, { backgroundColor: theme.cardBg }]} onPress={handleToggleFavorite}>
              <Ionicons name={isFav ? "star" : "star-outline"} size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dexImageWrapper}>
            <Image source={{ uri: img(pokemonId) }} style={styles.dexMainImage} />
          </View>
          <View style={styles.dexTitleContainer}>
            <Text style={[styles.dexTitle, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 38 }]}>{pokemonDetails ? pokemonDetails.name : '...'}</Text> 
            <Text style={[styles.dexId, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 18 }]}>#{pokemonId.toString().padStart(3, '0')}</Text>
          </View>
        </View>
        <View style={[styles.dexCard, { backgroundColor: theme.cardBg }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.textPrimary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {showWeight && pokemonDetails && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, backgroundColor: theme.searchBarBg, padding: 16, borderRadius: 16 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[{ color: theme.textSecondary, fontSize: 14 }, isLargeText && { fontSize: 16 }]}>{t(language, 'weight')}</Text>
                    <Text style={[{ color: theme.textPrimary, fontWeight: 'bold', fontSize: 18, marginTop: 4 }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{pokemonDetails.weight} kg</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: theme.border }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[{ color: theme.textSecondary, fontSize: 14 }, isLargeText && { fontSize: 16 }]}>{t(language, 'height')}</Text>
                    <Text style={[{ color: theme.textPrimary, fontWeight: 'bold', fontSize: 18, marginTop: 4 }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{pokemonDetails.height} m</Text>
                  </View>
                </View>
              )}

              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'dexDesc')}</Text>
              <Text style={[styles.dexDescription, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold', color: theme.textPrimary }, isLargeText && { fontSize: 18, lineHeight: 28 }]}>{language === 'PT-BR' ? pokemonDetails?.descPT : pokemonDetails?.descEN}</Text>
              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'type')}</Text>
              <View style={[styles.badgesRow, { marginBottom: 24 }]}>
                {pokemonDetails?.typesIds?.map((id: string, index: number) => {
                  const td = getTypeData(id, language); return <Badge key={`t-${index}`} label={td.name} color={td.color} isLargeText={isLargeText} />
                })}
              </View>
              <View style={styles.dexTypesRow}>
                <View style={styles.dexTypeCol}>
                  <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'strong')}</Text>
                  <View style={styles.badgesRow}>
                    {pokemonDetails?.strengthsIds.map((id: string, index: number) => {
                      const td = getTypeData(id, language); return <Badge key={`s-${index}`} label={td.name} color={td.color} isLargeText={isLargeText} />
                    })}
                  </View>
                </View>
                <View style={styles.dexTypeCol}>
                  <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'weak')}</Text>
                  <View style={styles.badgesRow}>
                    {pokemonDetails?.weaknessesIds.map((id: string, index: number) => {
                      const td = getTypeData(id, language); return <Badge key={`w-${index}`} label={td.name} color={td.color} isLargeText={isLargeText} />
                    })}
                  </View>
                </View>
              </View>
              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'evoLine')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evolutionsContainer}>
                {evolutions.map((evo, index) => (
                  <TouchableOpacity key={index} activeOpacity={0.7} onPress={() => { if (navigation.push) navigation.push('Dex', { pokemonId: evo.rawId }); else navigation.setParams({ pokemonId: evo.rawId }); }}>
                    <EvolutionCard name={evo.name} id={evo.id} image={evo.image} theme={theme} isBoldText={isBoldText} isLargeText={isLargeText} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'mostMoves')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesScrollView}>
                {pokemonDetails?.availableGames?.map((game: any) => {
                  const isSelected = selectedGame === game.id;
                  return (
                    <TouchableOpacity key={game.id} style={[styles.gamePill, isSelected ? { backgroundColor: theme.pillActiveBg, borderColor: theme.pillActiveBg } : { backgroundColor: theme.pillInactiveBg, borderColor: theme.border }]} onPress={() => setSelectedGame(game.id)}>
                      <Text style={[styles.gamePillText, { color: isSelected ? theme.pillActiveText : theme.pillInactiveText }, isLargeText && { fontSize: 16 }]}>Pokémon {game.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={[styles.rewardCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                {translatedTopMoves?.map((move: any, index: number) => (
                  <View key={`top-${index}`} style={{ marginBottom: index === translatedTopMoves.length - 1 ? 0 : 12 }}>
                    <View style={styles.rewardMoveRow}>
                      <Badge label={getTypeData(move.typeId, language).name} color={getTypeData(move.typeId, language).color} isLargeText={isLargeText} />
                      <Text style={[styles.rewardMoveName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 16 }]}>{move.name}</Text>
                    </View>
                    {index < translatedTopMoves.length - 1 && <View style={[styles.horizontalSeparator, { backgroundColor: theme.border, marginTop: 12 }]} />}
                  </View>
                ))}
                {translatedTopMoves?.length === 0 && <Text style={[{color: theme.textSecondary}, isLargeText && { fontSize: 16 }]}>{t(language, 'noMoves')}</Text>}
              </View>
              {translatedBottomMoves?.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'leastMoves')}</Text>
                  <View style={[styles.rewardCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    {translatedBottomMoves?.map((move: any, index: number) => (
                      <View key={`bottom-${index}`} style={{ marginBottom: index === translatedBottomMoves.length - 1 ? 0 : 12 }}>
                        <View style={styles.rewardMoveRow}>
                          <Badge label={getTypeData(move.typeId, language).name} color={getTypeData(move.typeId, language).color} isLargeText={isLargeText} />
                          <Text style={[styles.rewardMoveName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 16 }]}>{move.name}</Text>
                        </View>
                        {index < translatedBottomMoves.length - 1 && <View style={[styles.horizontalSeparator, { backgroundColor: theme.border, marginTop: 12 }]} />}
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
  const { theme } = useContext(ThemeContext);
  const { isBoldText, isLargeText, language } = useContext(SettingsContext);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [query, setQuery] = useState('');
  const data = selectedRegion ? KANTO_CHARACTERS : REGIONS;
  
  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? data.filter(item => item.name.toLowerCase().includes(normalized)) : data;
  }, [query, data]);

  const renderSectionHeader = (title: string) => <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 16, marginBottom: 12 }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{title}</Text>;

  const renderRegionContent = () => {
    if (!selectedRegion) {
      return (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GenericRow title={item.name} subtitle={language === 'PT-BR' ? item.desc.pt : item.desc.en} imageUrl={item.image} onPress={() => setSelectedRegion(item)} theme={theme} isBoldText={isBoldText} isLargeText={isLargeText} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      );
    }
    if (selectedRegion.name !== 'Kanto') {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <Ionicons name="construct-outline" size={48} color={theme.textSecondary} />
          <Text style={[{ fontSize: 18, color: theme.textSecondary, marginTop: 12 }, isLargeText && { fontSize: 22 }]}>{t(language, 'underConst')}</Text>
        </View>
      );
    }
    const gymLeaders = filteredData.filter(item => item.role === 'gym_leader');
    const eliteFour = filteredData.filter(item => item.role === 'elite_four' || item.role === 'champion');
    const usefulNpcs = filteredData.filter(item => item.role === 'useful_npc');
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {gymLeaders.length > 0 && <>{renderSectionHeader(t(language, 'gymLeaders'))}{gymLeaders.map(item => <GenericRow key={item.id} title={item.name} subtitle={language === 'PT-BR' ? item.desc.pt : item.desc.en} imageUrl={item.image} onPress={() => navigation.navigate('LeaderDetail', { leader: item })} theme={theme} isBoldText={isBoldText} isLargeText={isLargeText} />)}</>}
        {eliteFour.length > 0 && <>{renderSectionHeader(t(language, 'eliteFour'))}{eliteFour.map(item => <GenericRow key={item.id} title={item.name} subtitle={language === 'PT-BR' ? item.desc.pt : item.desc.en} imageUrl={item.image} onPress={() => navigation.navigate('LeaderDetail', { leader: item })} theme={theme} isBoldText={isBoldText} isLargeText={isLargeText} />)}</>}
        {usefulNpcs.length > 0 && <>{renderSectionHeader(t(language, 'usefulNpcs'))}{usefulNpcs.map(item => <GenericRow key={item.id} title={item.name} subtitle={language === 'PT-BR' ? item.desc.pt : item.desc.en} imageUrl={item.image} onPress={() => navigation.navigate('LeaderDetail', { leader: item })} theme={theme} isBoldText={isBoldText} isLargeText={isLargeText} />)}</>}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 42 }]}>MoveDex</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }, isLargeText && { fontSize: 22 }]}>{t(language, 'subtitle')}</Text>
      </View>
      <View style={[styles.searchBar, { backgroundColor: theme.searchBarBg }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput value={query} onChangeText={setQuery} placeholder={selectedRegion ? t(language, 'searchChar') : t(language, 'searchRegion')} placeholderTextColor={theme.textSecondary} style={[styles.searchInput, { color: theme.textPrimary }, isLargeText && { fontSize: 18 }]} />
        <Ionicons name="mic-outline" size={20} color={theme.textSecondary} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        {selectedRegion && (
          <TouchableOpacity onPress={() => setSelectedRegion(null)} style={[styles.backButtonCircle, { marginRight: 12, backgroundColor: theme.cardBg }]}>
            <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginBottom: 0 }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{selectedRegion ? selectedRegion.name : t(language, 'regions')}</Text>
      </View>
      <View style={[styles.listContainer, { marginBottom: 110 }]}>
        {renderRegionContent()}
      </View>
    </View>
  );
}

function LeaderDetailScreen({ route, navigation }: any) {
  const { theme } = useContext(ThemeContext);
  const { isBoldText, isLargeText, language } = useContext(SettingsContext);
  const { leader } = route.params;
  const isNpc = leader.role === 'useful_npc';
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  useEffect(() => { if (leader.availableGames && leader.availableGames.length > 0) setSelectedGame(leader.availableGames[0].id); }, [leader]);

  if (!leader.about) {
    return (
      <View style={{ flex: 1, backgroundColor: leader.color || '#92D2EF' }}>
        <TouchableOpacity style={[styles.backButtonCircle, { position: 'absolute', top: 55, left: 22, zIndex: 10, backgroundColor: theme.cardBg }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[{ fontSize: 18, color: '#000' }, isBoldText ? { fontWeight: '900' } : { fontWeight: 'bold' }, isLargeText && { fontSize: 22 }]}>{t(language, 'detailsConst')}</Text>
        </View>
      </View>
    );
  }

  const currentTeam = (leader.teams && selectedGame) ? leader.teams[selectedGame] : [];
  const translatedTeam = currentTeam.map((pkmn: any) => ({
    ...pkmn, moves: pkmn.moves.map((m: any) => ({ ...m, name: language === 'PT-BR' ? (moveTranslations[m.name] || m.name) : m.name }))
  }));

  const getRoleStr = () => leader.role === 'gym_leader' ? t(language, 'gymRole') : leader.role === 'elite_four' ? t(language, 'eliteRole') : leader.role === 'champion' ? t(language, 'championRole') : t(language, 'npcRole');

  return (
    <View style={{ flex: 1, backgroundColor: leader.color }}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.dexScrollView}>
        <View style={styles.leaderScrollHeader}>
          <TouchableOpacity style={[styles.backButtonCircle, styles.backButtonFixed, { backgroundColor: theme.cardBg }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.leaderImageWrapper}>
            <Image source={{ uri: leader.image }} style={styles.leaderMainImage} resizeMode="contain" />
          </View>
          <View style={styles.leaderTitleContainer}>
            <Text style={[styles.leaderTitle, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 42 }]}>{leader.name}</Text>
            <Text style={[styles.leaderSubtitleText, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 20 }]}>{getRoleStr()}</Text>
          </View>
        </View>
        <View style={[styles.dexCard, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'desc')}</Text>
          <Text style={[styles.dexDescription, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold', color: theme.textPrimary }, isLargeText && { fontSize: 18, lineHeight: 28 }]}>{language === 'PT-BR' ? leader.about.pt : leader.about.en}</Text>
          
          {isNpc ? (
            <>
              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'location')}</Text>
              <Text style={[styles.dexDescription, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold', color: theme.textPrimary }, isLargeText && { fontSize: 18, lineHeight: 28 }]}>{language === 'PT-BR' ? leader.npcInfo.pt.location : leader.npcInfo.en.location}</Text>
              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'serviceCost')}</Text>
              <View style={[styles.rewardCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.rewardTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 20 }]}>{language === 'PT-BR' ? leader.npcInfo.pt.service : leader.npcInfo.en.service}</Text>
                <Text style={[styles.rewardSubtitle, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 16 }]}>{t(language, 'cost')}: {language === 'PT-BR' ? leader.npcInfo.pt.cost : leader.npcInfo.en.cost}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.dexTypesRow}>
                <View style={styles.dexTypeCol}>
                  <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'mainType')}</Text>
                  <View style={styles.badgesRow}><Badge label={getTypeData(leader.mainType, language).name} color={getTypeData(leader.mainType, language).color} isLargeText={isLargeText} /></View>
                </View>
                <View style={styles.dexTypeCol}>
                  <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'weak')}</Text>
                  <View style={styles.badgesRow}>{leader.weaknesses.map((wId: string, index: number) => <Badge key={index} label={getTypeData(wId, language).name} color={getTypeData(wId, language).color} isLargeText={isLargeText} />)}</View>
                </View>
              </View>
              <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'reward')}</Text>
              <View style={[styles.rewardCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[styles.rewardTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 20 }]}>{language === 'PT-BR' ? leader.reward.pt.badgeName : leader.reward.en.badgeName}</Text>
                <Text style={[styles.rewardSubtitle, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 16 }]}>{language === 'PT-BR' ? leader.reward.pt.badgeDesc : leader.reward.en.badgeDesc}</Text>
                <View style={[styles.horizontalSeparator, { backgroundColor: theme.border }]} />
                <View style={styles.rewardMoveRow}>
                  <Badge label={getTypeData(leader.reward.tmType, language).name} color={getTypeData(leader.reward.tmType, language).color} isLargeText={isLargeText} />
                  <Text style={[styles.rewardMoveName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{leader.reward.tmName !== 'Sem TM' ? (language === 'PT-BR' ? leader.reward.tmName.replace(leader.reward.tmName.split(' ')[1], moveTranslations[leader.reward.tmName.split(' ')[1]] || leader.reward.tmName.split(' ')[1]) : leader.reward.tmName) : leader.reward.tmName}</Text>
                </View>
                <Text style={[styles.rewardMoveStats, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 14 }]}>{leader.reward.tmStats}</Text>
              </View>

              {leader.availableGames && leader.availableGames.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text style={[styles.dexSectionTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{t(language, 'pkmnUsed')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesScrollView}>
                    {leader.availableGames.map((game: any) => {
                      const isSelected = selectedGame === game.id;
                      return (
                        <TouchableOpacity key={game.id} style={[styles.gamePill, isSelected ? { backgroundColor: theme.pillActiveBg, borderColor: theme.pillActiveBg } : { backgroundColor: theme.pillInactiveBg, borderColor: theme.border }]} onPress={() => setSelectedGame(game.id)}>
                          <Text style={[styles.gamePillText, { color: isSelected ? theme.pillActiveText : theme.pillInactiveText }, isLargeText && { fontSize: 16 }]}>{game.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <View style={{ gap: 16 }}>
                    {translatedTeam.map((pkmn: any, pIdx: number) => (
                      <View key={pIdx} style={[styles.teamCard, { backgroundColor: theme.cardBg }]}>
                        <View style={[styles.teamCardLeft, { borderRightColor: theme.border }]}>
                          <Image source={{ uri: pkmn.image }} style={styles.teamCardImage} resizeMode="contain" />
                          <Text style={[styles.teamCardName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 16 }]}>{pkmn.name}</Text>
                          <Text style={[styles.teamCardId, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 14 }]}>{pkmn.id}</Text>
                        </View>
                        <View style={styles.teamCardRight}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                            {pkmn.moves.map((move: any, mIdx: number) => (
                              <View key={mIdx} style={[styles.moveHorizontalCard, { backgroundColor: theme.searchBarBg, borderColor: theme.border, marginRight: mIdx === pkmn.moves.length - 1 ? 0 : 12 }]}>
                                <View style={{ alignSelf: 'flex-start' }}><Badge label={getTypeData(move.typeId, language).name} color={getTypeData(move.typeId, language).color} isLargeText={isLargeText} /></View>
                                <Text style={[styles.teamMoveName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 16 }]}>{move.name}</Text>
                                <Text style={[styles.teamMoveStats, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 12 }]}>{move.stats}</Text>
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
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const { soundEnabled, toggleSound, isBoldText, toggleBoldText, isLargeText, toggleLargeText, showWeight, toggleShowWeight, language, setLanguage } = useContext(SettingsContext);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { favorites } = useContext(FavoritesContext);
  
  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 42 }]}>MoveDex</Text>
        <Text style={[styles.settingsTitle, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 32 }]}>{t(language, 'settingsProfile')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.settingsCard, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity style={styles.settingsMenuItem} onPress={() => toggleSection('favoritos')}>
            <Text style={[styles.settingsMenuText, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 20 }]}>{t(language, 'myFavs')} ({favorites.length})</Text>
            <Ionicons name={expandedSection === 'favoritos' ? "chevron-down" : "chevron-forward"} size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          
          {expandedSection === 'favoritos' && (
            <View style={styles.expandedContent}>
              {favorites.length === 0 ? (
                <Text style={[{ color: theme.textSecondary, textAlign: 'center', marginTop: 10 }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 18 }]}>{t(language, 'noFavs')}</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {favorites.map((fav) => (
                    <TouchableOpacity key={fav.id} style={[styles.favoriteListCard, { backgroundColor: theme.searchBarBg }]} onPress={() => navigation.navigate('DexTab', { pokemonId: fav.id })}>
                      <Image source={{ uri: fav.image }} style={styles.favoriteListImage} />
                      <Text style={[styles.favoriteListName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 20 }]}>{fav.name}</Text>
                      <Text style={[styles.favoriteListId, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 16 }]}>#{fav.id.toString().padStart(3, '0')}</Text>
                      <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={[styles.settingsSeparator, { backgroundColor: theme.border }]} />
          
          <TouchableOpacity style={styles.settingsMenuItem} onPress={() => toggleSection('configuracoes')}>
            <Text style={[styles.settingsMenuText, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 20 }]}>{t(language, 'settings')}</Text>
            <Ionicons name={expandedSection === 'configuracoes' ? "chevron-down" : "chevron-forward"} size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          
          {expandedSection === 'configuracoes' && (
            <View style={styles.expandedConfigContent}>
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="moon" size={20} color={theme.textSecondary} />
                  <Text style={[styles.configLabel, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{t(language, 'darkTheme')}</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={toggleTheme} value={isDark} />
              </View>
              
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="volume-high" size={20} color={theme.textSecondary} />
                  <Text style={[styles.configLabel, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{t(language, 'cries')}</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={toggleSound} value={soundEnabled} />
              </View>
              
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="text" size={20} color={theme.textSecondary} />
                  <Text style={[styles.configLabel, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{t(language, 'boldText')}</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={toggleBoldText} value={isBoldText} />
              </View>
              
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="add-circle-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.configLabel, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{t(language, 'largerText')}</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={toggleLargeText} value={isLargeText} />
              </View>

              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="barbell-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.configLabel, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{t(language, 'showWeight')}</Text>
                </View>
                <Switch trackColor={{ false: "#D1D1D6", true: "#34C759" }} onValueChange={toggleShowWeight} value={showWeight} />
              </View>
              
              <View style={styles.configColumn}>
                <Text style={[styles.configLabelMargin, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{t(language, 'language')}</Text>
                <View style={[styles.segmentedControl, { backgroundColor: theme.border }]}>
                  {['PT-BR', 'EN-US'].map(lang => (
                    <TouchableOpacity key={lang} style={[styles.segmentButton, language === lang && { backgroundColor: theme.cardBg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]} onPress={() => setLanguage(lang)}>
                      <Text style={[styles.segmentText, language === lang ? { color: theme.textPrimary, fontWeight: 'bold' } : { color: theme.textSecondary }, isLargeText && { fontSize: 16 }]}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={[styles.settingsSeparator, { backgroundColor: theme.border }]} />
          
          <TouchableOpacity style={styles.settingsMenuItem} onPress={() => toggleSection('sobre')}>
            <Text style={[styles.settingsMenuText, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 20 }]}>{t(language, 'about')}</Text>
            <Ionicons name={expandedSection === 'sobre' ? "chevron-down" : "chevron-forward"} size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          
          {expandedSection === 'sobre' && (
            <View style={styles.expandedContent}>
              <Text style={[{ color: theme.textSecondary, lineHeight: 24, marginTop: 10, textAlign: 'left' }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 18 }]}>
                {language === 'PT-BR' 
                  ? 'MoveDex v1.0.0\nDesenvolvido em React Native por \nFábio Vinnicius' 
                  : 'MoveDex v1.0.0\nDeveloped in React Native by \nFábio Vinnicius'}
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

function BottomNavigation({ state, descriptors, navigation }: any) {
  const { theme } = useContext(ThemeContext);
  const { language, isLargeText, isBoldText } = useContext(SettingsContext);
  return (
    <View style={styles.navWrapper}>
      <BlurView intensity={100} tint={theme.background === '#121212' ? 'dark' : 'light'} style={[styles.navContainer, { backgroundColor: theme.bottomNavBg, borderColor: theme.bottomNavBorder }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          let iconName = ''; let label = '';
          if (route.name === 'PokemonsTab') { iconName = isFocused ? 'list' : 'list-outline'; label = t(language, 'navPkmn'); }
          else if (route.name === 'DexTab') { iconName = isFocused ? 'book' : 'book-outline'; label = t(language, 'navDex'); }
          else if (route.name === 'LideresTab') { iconName = isFocused ? 'people' : 'people-outline'; label = t(language, 'navLeaders'); }
          else if (route.name === 'AjustesTab') { iconName = isFocused ? 'settings' : 'settings-outline'; label = t(language, 'navSettings'); }
          return (
            <TouchableOpacity key={index} style={isFocused ? [styles.navItemActive, { backgroundColor: theme.cardBg }] : styles.navItem} onPress={onPress}>
              <Ionicons name={iconName as any} size={24} color={isFocused ? '#007AFF' : theme.inactiveIcon} />
              <Text style={isFocused ? [styles.navTextActive, isLargeText && { fontSize: 14 }] : [styles.navText, { color: theme.inactiveIcon }, isLargeText && { fontSize: 14 }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

function PokemonRow({ pokemon, onPress, theme, isBoldText, isLargeText, language }: any) {
  const primaryType = pokemon.types ? pokemon.types[0] : null;
  const bgColor = primaryType ? getTypeData(primaryType, language).color : theme.cardBg;
  return (
    <TouchableOpacity style={[styles.pokemonCardRow, { backgroundColor: bgColor }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.pokemonCardInfo}>
        <Text style={[styles.pokemonCardId, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 16 }]}>#{pokemon.id}</Text>
        <Text style={[styles.pokemonCardName, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 28 }]}>{pokemon.name}</Text>
        {pokemon.types && (
          <View style={styles.pokemonCardBadges}>
            {pokemon.types.map((tId: string, i: number) => {
               const td = getTypeData(tId, language);
               return <Badge key={i} label={td.name} color={td.color} isLargeText={isLargeText} />
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

function GenericRow({ title, subtitle, imageUrl, onPress, theme, isBoldText, isLargeText }: any) {
  return (
    <TouchableOpacity style={[styles.row, { backgroundColor: theme.cardBg }]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.spriteContainer, { borderColor: theme.border, backgroundColor: theme.cardBg }]}><Image source={{ uri: imageUrl }} style={styles.sprite} resizeMode="contain" /></View>
      <View style={styles.infoContainer}>
        <Text style={[styles.pokemonName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 22 }]}>{title}</Text>
        <Text style={[styles.pokemonId, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 16 }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Badge({ label, color, isLargeText }: { label: string, color: string, isLargeText?: boolean }) {
  return <View style={[styles.badge, { backgroundColor: color }]}><Text style={[styles.badgeText, isLargeText && { fontSize: 14 }]}>{label}</Text></View>;
}

function EvolutionCard({ name, id, image, theme, isBoldText, isLargeText }: any) {
  return (
    <View style={[styles.evoCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Image source={{ uri: image }} style={styles.evoImage} />
      <Text style={[styles.evoName, { color: theme.textPrimary }, isBoldText && { fontWeight: '900' }, isLargeText && { fontSize: 18 }]}>{name}</Text>
      <Text style={[styles.evoId, { color: theme.textSecondary }, isBoldText && { fontWeight: 'bold' }, isLargeText && { fontSize: 14 }]}>{id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 22 },
  header: { marginTop: 65, marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 18 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 16, height: 48, marginBottom: 24, gap: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  sectionLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  listContainer: { flex: 1 },
  listContent: { paddingBottom: 120, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 16, borderRadius: 16, marginBottom: 12 },
  spriteContainer: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  sprite: { width: 48, height: 48 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  pokemonName: { fontSize: 18, fontWeight: '500', marginBottom: 4 },
  pokemonId: { fontSize: 14 },
  filterScroll: { flexGrow: 0 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, height: 36, justifyContent: 'center' },
  filterPillText: { fontSize: 13, fontWeight: '600' },
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
  favoriteCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  dexImageWrapper: { alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  dexMainImage: { width: 220, height: 220 },
  dexTitleContainer: { marginTop: 10 },
  dexTitle: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
  dexId: { fontSize: 16, color: '#333333', marginTop: 4 },
  dexCard: { borderTopLeftRadius: 35, borderTopRightRadius: 35, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, marginHorizontal: 22, paddingTop: 32, paddingHorizontal: 22, paddingBottom: 160 },
  dexSectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  dexDescription: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  dexTypesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  dexTypeCol: { flex: 1 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  gamesScrollView: { marginBottom: 20, marginTop: -4 },
  gamePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  gamePillText: { fontSize: 13, fontWeight: '600' },
  movesSubtitle: { fontSize: 14, color: '#888888', marginBottom: 12, marginTop: -8 },
  leaderScrollHeader: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 22 },
  backButtonFixed: { marginBottom: 10 },
  leaderImageWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  leaderMainImage: { width: 280, height: 280 },
  leaderTitleContainer: { alignItems: 'flex-start' },
  leaderTitle: { fontSize: 36, fontWeight: 'bold', color: '#000000' },
  leaderSubtitleText: { fontSize: 16, color: '#333333', marginTop: 4 },
  rewardCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 24 },
  rewardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  rewardSubtitle: { fontSize: 12, fontWeight: '500', marginBottom: 12 },
  horizontalSeparator: { height: 1, marginBottom: 12 },
  rewardMoveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rewardMoveName: { fontSize: 14, fontWeight: 'bold' },
  rewardMoveStats: { fontSize: 11, fontWeight: '600' },
  evolutionsContainer: { marginBottom: 24, height: 155 },
  evoCard: { borderWidth: 1, borderRadius: 20, padding: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16, width: 140, height: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  evoImage: { width: 70, height: 70, marginBottom: 6 },
  evoName: { fontSize: 14, fontWeight: 'bold' },
  evoId: { fontSize: 12 },
  navWrapper: { paddingHorizontal: 22, paddingBottom: 28, backgroundColor: 'transparent', position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  navContainer: { flexDirection: 'row', borderRadius: 40, height: 76, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, overflow: 'hidden', borderWidth: 1.5 },
  navItem: { alignItems: 'center', justifyContent: 'center', width: 75, height: 60 },
  navItemActive: { alignItems: 'center', justifyContent: 'center', width: 75, height: 60, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  navText: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  navTextActive: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', marginTop: 4 },
  backButtonCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  settingsTitle: { fontSize: 26, fontWeight: 'bold' },
  settingsCard: { borderRadius: 24, paddingVertical: 8, paddingHorizontal: 24, marginBottom: 110 },
  settingsSeparator: { height: 1 },
  settingsMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  settingsMenuText: { fontSize: 16, fontWeight: '600' },
  expandedContent: { paddingBottom: 20 },
  favoriteListCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  favoriteListImage: { width: 40, height: 40, marginRight: 12 },
  favoriteListName: { fontSize: 16, fontWeight: 'bold' },
  favoriteListId: { fontSize: 14, marginLeft: 'auto', marginRight: 12 },
  expandedConfigContent: { paddingBottom: 24, paddingTop: 8, gap: 24 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  configInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  configLabel: { fontSize: 15, fontWeight: '500' },
  configColumn: { gap: 10 },
  configLabelMargin: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  segmentedControl: { flexDirection: 'row', borderRadius: 8, padding: 3 },
  segmentButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  segmentText: { fontSize: 14, fontWeight: '500' },
  teamCard: { flexDirection: 'row', borderRadius: 20, paddingVertical: 16, paddingLeft: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, height: 160 },
  teamCardLeft: { width: 90, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, paddingRight: 16, marginRight: 16 },
  teamCardImage: { width: 60, height: 60, marginBottom: 6 },
  teamCardName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  teamCardId: { fontSize: 12 },
  teamCardRight: { flex: 1, justifyContent: 'center' },
  moveHorizontalCard: { width: 130, borderRadius: 12, padding: 12, borderWidth: 1, justifyContent: 'center' },
  teamMoveName: { fontSize: 14, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  teamMoveStats: { fontSize: 11, fontWeight: '600' },
});