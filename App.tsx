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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { POKEMON_LIST, Pokemon } from './pokemon';

// ================= DADOS SIMULADOS =================
const REGIONS = [
  { id: '1', name: 'Kanto', desc: 'Pokémon Red/Blue/Yellow', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: '2', name: 'Johto', desc: 'Pokémon Gold/Silver/Crystal', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png' },
  { id: '3', name: 'Hoenn', desc: 'Pokémon Ruby/Sapphire/Emerald/FireRed', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/255.png' },
  { id: '4', name: 'Sinnoh', desc: 'Pokémon Diamond/Pearl/Platinum', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/393.png' },
  { id: '5', name: 'Unova', desc: 'Pokémon Black / White / Black 2 / White 2', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/495.png' },
  { id: '6', name: 'Galar + Hisui', desc: 'Sword / Shield / Legends: Arceus', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/722.png' },
];

const KANTO_LEADERS = [
  { 
    id: '1', 
    name: 'Brock', 
    desc: 'Cidade de Pewter / Tipo: Pedra', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png', 
    color: '#D4C294',
    about: 'Brock é o líder de academia do Pewter City Gym e é especialista em Pokémon do tipo Pedra. Ele dá a Insígnia da Rocha aos treinadores que o derrotam.',
    mainType: { label: 'Pedra', color: '#795548' },
    weaknesses: [
      { label: 'Água', color: '#2196F3' },
      { label: 'Planta', color: '#4CAF50' }
    ],
    reward: {
      badgeName: 'Insígnia da Rocha',
      badgeDesc: 'Pokémons até o nível 20 obedecem suas ordens',
      tmType: 'Pedra',
      tmTypeColor: '#795548',
      tmName: 'TM34 Bide',
      tmStats: 'PP: 10/10 POWER: - ACCURACY: 100'
    },
    pokemons: [
      {
        name: 'Geodude', id: '#074', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png',
        moves: [
          { type: 'Normal', typeColor: '#9E9E9E', name: 'Investida', stats: 'PP: 35/35 POWER: 40 ACCURACY: 100' },
        ]
      },
      {
        name: 'Onix', id: '#095', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png',
        moves: [
          { type: 'Normal', typeColor: '#9E9E9E', name: 'Investida', stats: 'PP: 35/35 POWER: 40 ACCURACY: 100' },
          { type: 'Pedra', typeColor: '#795548', name: 'Aguardar', stats: 'PP: 10/10 POWER: - ACCURACY: 100' }
        ]
      }
    ]
  },
  { 
    id: '2', 
    name: 'Misty', 
    desc: 'Cidade de Cerulean / Tipo: Água', 
    image: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png',
    color: '#92D2EF',
    about: 'Misty é a líder de academia do Cerulean City Gym e é especialista em Pokémon do tipo Água e, portanto, a segunda em Kanto. Ela dá o Distintivo Cascade aos treinadores que a derrotam. Misty também é conhecida pelo título de A Sereia Tomboy.',
    mainType: { label: 'Água', color: '#2196F3' },
    weaknesses: [
      { label: 'Planta', color: '#4CAF50' },
      { label: 'Elétrico', color: '#FDD835' }
    ],
    reward: {
      badgeName: 'Insígnia da Cascata',
      badgeDesc: 'Pokémons até o nível 30 obedecem suas ordens',
      tmType: 'Água',
      tmTypeColor: '#2196F3',
      tmName: "TM03 Pulso d'Água",
      tmStats: 'PP: 5/5 POWER: 110 ACCURACY: 85'
    },
    pokemons: [
      {
        name: 'Staryu',
        id: '#120',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/120.png',
        moves: [
          { type: 'Normal', typeColor: '#9E9E9E', name: 'Enfrentar', stats: 'PP: 5/5 POWER: 110 ACCURACY: 85' },
          { type: 'Água', typeColor: '#2196F3', name: "Pulso d'Água", stats: 'PP: 5/5 POWER: 130 ACCURACY: 90' }
        ]
      },
      {
        name: 'Starmie',
        id: '#121',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png',
        moves: [
          { type: 'Normal', typeColor: '#9E9E9E', name: 'Giro Rápido', stats: 'PP: 15/15 POWER: 90 ACCURACY: 100' },
          { type: 'Água', typeColor: '#2196F3', name: "Pulso d'Água", stats: 'PP: 5/5 POWER: 130 ACCURACY: 90' },
          { type: 'Normal', typeColor: '#9E9E9E', name: 'Rápido', stats: 'PP: 5/5 POWER: 110 ACCURACY: 85' },
          { type: 'Água', typeColor: '#2196F3', name: 'Raio de bolhas', stats: 'PP: 5/5 POWER: 120 ACCURACY: 90' }
        ]
      }
    ]
  },
  { id: '3', name: 'Lt Surge', desc: 'Cidade de Vermilion / Tipo: Elétrico', image: 'https://play.pokemonshowdown.com/sprites/trainers/ltsurge.png' },
  { id: '4', name: 'Erika', desc: 'Cidade de Celadon / Tipo: Planta', image: 'https://play.pokemonshowdown.com/sprites/trainers/erika.png' },
  { id: '5', name: 'Koga', desc: 'Cidade de Fuchsia / Tipo: Veneno', image: 'https://play.pokemonshowdown.com/sprites/trainers/koga.png' },
  { id: '6', name: 'Sabrina', desc: 'Cidade de Saffron / Tipo: Psíquico', image: 'https://play.pokemonshowdown.com/sprites/trainers/sabrina.png' },
  { id: '7', name: 'Blaine', desc: 'Ilha de Cinnabar / Tipo: Fogo', image: 'https://play.pokemonshowdown.com/sprites/trainers/blaine.png' },
];
// ===================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('Pokemons');

  return (
    <View style={[styles.safeArea, activeTab === 'Dex' && { backgroundColor: '#E4B688' }]}>
      {activeTab === 'Pokemons' && <HomeScreen />}
      {activeTab === 'Dex' && <DexScreen />}
      {activeTab === 'Lideres' && <LideresScreen />}
      {activeTab === 'Ajustes' && <AjustesScreen />}
      
      <View style={styles.navWrapper}>
        <BottomNavigation activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>
    </View>
  );
}

function AjustesScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Estados falsos para as configurações
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('PT-BR');
  const [measureSystem, setMeasureSystem] = useState('Métrico');
  const [textSize, setTextSize] = useState('Normal');
  const [isBoldText, setIsBoldText] = useState(false);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MoveDex</Text>
        <Text style={styles.settingsTitle}>Ajustes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsCard}>
          
          {/* === FAVORITOS === */}
          <TouchableOpacity 
            style={styles.settingsMenuItem} 
            activeOpacity={0.7}
            onPress={() => toggleSection('favoritos')}
          >
            <Text style={styles.settingsMenuText}>Favoritos</Text>
            <Ionicons 
              name={expandedSection === 'favoritos' ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color="#000" 
            />
          </TouchableOpacity>

          {expandedSection === 'favoritos' && (
            <View style={styles.expandedContent}>
              <View style={styles.favoritesRow}>
                <View style={styles.favoriteItem}>
                  <Image source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' }} style={styles.favoriteSprite} resizeMode="contain" />
                </View>
                <View style={styles.favoriteItem}>
                  <Image source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' }} style={styles.favoriteSprite} resizeMode="contain" />
                </View>
                <View style={styles.favoriteItem}>
                  <Image source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' }} style={styles.favoriteSprite} resizeMode="contain" />
                </View>
              </View>
            </View>
          )}

          <View style={styles.settingsSeparator} />
          
          {/* === CONFIGURAÇÕES === */}
          <TouchableOpacity 
            style={styles.settingsMenuItem} 
            activeOpacity={0.7}
            onPress={() => toggleSection('configuracoes')}
          >
            <Text style={styles.settingsMenuText}>Configurações</Text>
            <Ionicons 
              name={expandedSection === 'configuracoes' ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color="#000" 
            />
          </TouchableOpacity>
          
          {expandedSection === 'configuracoes' && (
            <View style={styles.expandedConfigContent}>
              
              {/* Tema Escuro */}
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="moon" size={20} color="#555" />
                  <Text style={styles.configLabel}>Tema Escuro</Text>
                </View>
                <Switch
                  trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                  thumbColor={"#FFFFFF"}
                  onValueChange={setIsDarkMode}
                  value={isDarkMode}
                />
              </View>

              {/* Áudio */}
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="volume-high" size={20} color="#555" />
                  <Text style={styles.configLabel}>Sons dos Pokémons</Text>
                </View>
                <Switch
                  trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                  thumbColor={"#FFFFFF"}
                  onValueChange={setSoundEnabled}
                  value={soundEnabled}
                />
              </View>

              {/* Textos em Negrito */}
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Ionicons name="text" size={20} color="#555" />
                  <Text style={styles.configLabel}>Textos em Negrito</Text>
                </View>
                <Switch
                  trackColor={{ false: "#D1D1D6", true: "#34C759" }}
                  thumbColor={"#FFFFFF"}
                  onValueChange={setIsBoldText}
                  value={isBoldText}
                />
              </View>

              {/* Idioma */}
              <View style={styles.configColumn}>
                <Text style={styles.configLabelMargin}>Idioma dos Golpes</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity 
                    style={[styles.segmentButton, language === 'PT-BR' && styles.segmentButtonActive]}
                    onPress={() => setLanguage('PT-BR')}
                  >
                    <Text style={[styles.segmentText, language === 'PT-BR' && styles.segmentTextActive]}>PT-BR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentButton, language === 'EN-US' && styles.segmentButtonActive]}
                    onPress={() => setLanguage('EN-US')}
                  >
                    <Text style={[styles.segmentText, language === 'EN-US' && styles.segmentTextActive]}>EN-US</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Medidas */}
              <View style={styles.configColumn}>
                <Text style={styles.configLabelMargin}>Sistema de Medidas</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity 
                    style={[styles.segmentButton, measureSystem === 'Métrico' && styles.segmentButtonActive]}
                    onPress={() => setMeasureSystem('Métrico')}
                  >
                    <Text style={[styles.segmentText, measureSystem === 'Métrico' && styles.segmentTextActive]}>Métrico</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentButton, measureSystem === 'Imperial' && styles.segmentButtonActive]}
                    onPress={() => setMeasureSystem('Imperial')}
                  >
                    <Text style={[styles.segmentText, measureSystem === 'Imperial' && styles.segmentTextActive]}>Imperial</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tamanho do Texto */}
              <View style={styles.configColumn}>
                <Text style={styles.configLabelMargin}>Tamanho do Texto</Text>
                <View style={styles.segmentedControl}>
                  {['Pequeno', 'Normal', 'Grande'].map((size) => (
                    <TouchableOpacity 
                      key={size}
                      style={[styles.segmentButton, textSize === size && styles.segmentButtonActive]}
                      onPress={() => setTextSize(size)}
                    >
                      <Text style={[styles.segmentText, textSize === size && styles.segmentTextActive]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>
          )}

          <View style={styles.settingsSeparator} />
          
          {/* === SOBRE === */}
          <TouchableOpacity 
            style={styles.settingsMenuItem} 
            activeOpacity={0.7}
            onPress={() => toggleSection('sobre')}
          >
            <Text style={styles.settingsMenuText}>Sobre</Text>
            <Ionicons 
              name={expandedSection === 'sobre' ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color="#000" 
            />
          </TouchableOpacity>
          
          {expandedSection === 'sobre' && (
            <View style={styles.expandedContent}>
              <Text style={styles.dummyText}>
                MoveDex v1.0.0{'\n'}Desenvolvido em React Native por {'\n'}Fábio Vinnicius {':)'}
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
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

function LideresScreen() {
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [selectedLeader, setSelectedLeader] = useState<any>(null);
  const [query, setQuery] = useState('');

  const data = selectedRegion ? KANTO_LEADERS : REGIONS;
  
  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter(item => item.name.toLowerCase().includes(normalized));
  }, [query, data]);

  if (selectedLeader) {
    return <LeaderDetailScreen leader={selectedLeader} onBack={() => setSelectedLeader(null)} />;
  }

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
          placeholder={selectedRegion ? "Buscar Líder" : "Buscar Região"}
          placeholderTextColor="#888888"
          style={styles.searchInput}
        />
        <Ionicons name="mic-outline" size={20} color="#333" />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        {selectedRegion && (
          <TouchableOpacity onPress={() => setSelectedRegion(null)} style={[styles.backButtonCircle, { marginRight: 12 }]}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
        )}
        <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>
          {selectedRegion ? 'Líderes de Ginásio' : 'Regiões'}
        </Text>
      </View>

      <View style={[styles.listContainer, { marginBottom: 110 }]}>
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GenericRow 
              title={item.name} 
              subtitle={item.desc} 
              imageUrl={item.image} 
              onPress={() => {
                if (!selectedRegion) setSelectedRegion(item);
                else setSelectedLeader(item);
              }} 
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

function LeaderDetailScreen({ leader, onBack }: any) {
  if (!leader.about) {
    return (
      <View style={{ flex: 1, backgroundColor: leader.color || '#92D2EF' }}>
        <TouchableOpacity style={[styles.backButtonCircle, { position: 'absolute', top: 55, left: 22, zIndex: 10 }]} onPress={onBack}>
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
          <TouchableOpacity style={[styles.backButtonCircle, styles.backButtonFixed]} onPress={onBack}>
            <Ionicons name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          
          <View style={styles.leaderImageWrapper}>
            <Image 
              source={{ uri: leader.image }} 
              style={styles.leaderMainImage} 
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.leaderTitleContainer}>
            <Text style={styles.leaderTitle}>{leader.name}</Text>
            <Text style={styles.leaderSubtitleText}>Líder de Ginásio</Text>
          </View>
        </View>
        
        <View style={styles.dexCard}>
          <Text style={styles.dexSectionTitle}>Descrição</Text>
          <Text style={styles.dexDescription}>{leader.about}</Text>

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
                {leader.weaknesses.map((w: any, index: number) => (
                  <Badge key={index} label={w.label} color={w.color} />
                ))}
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

          <Text style={styles.dexSectionTitle}>Pokémons utilizados</Text>
          {leader.pokemons.map((poke: any, idx: number) => (
            <View key={idx} style={styles.teamCard}>
              <View style={styles.teamLeftCol}>
                <Image source={{ uri: poke.image }} style={styles.teamSprite} resizeMode="contain" />
                <Text style={styles.teamName}>{poke.name}</Text>
                <Text style={styles.teamId}>{poke.id}</Text>
              </View>
              <View style={styles.teamRightColHorizontal}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {poke.moves.map((move: any, moveIdx: number) => (
                    <View key={moveIdx} style={styles.teamMoveCardHorizontal}>
                      <View style={styles.teamMoveHeaderHorizontal}>
                        <Badge label={move.type} color={move.typeColor} />
                      </View>
                      <Text style={styles.teamMoveNameHorizontal} numberOfLines={1}>{move.name}</Text>
                      <Text style={styles.teamMoveStatsHorizontal}>{move.stats}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    <BlurView intensity={100} tint="light" style={styles.navContainer}>
      <TouchableOpacity 
        style={activeTab === 'Pokemons' ? styles.navItemActive : styles.navItem}
        onPress={() => onChangeTab('Pokemons')}
      >
        <Ionicons 
          name={activeTab === 'Pokemons' ? 'list' : 'list-outline'} 
          size={24} 
          color={activeTab === 'Pokemons' ? '#007AFF' : '#000'} 
        />
        <Text style={activeTab === 'Pokemons' ? styles.navTextActive : styles.navText}>Pokémons</Text>
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
        style={activeTab === 'Lideres' ? styles.navItemActive : styles.navItem}
        onPress={() => onChangeTab('Lideres')}
      >
        <Ionicons 
          name={activeTab === 'Lideres' ? 'people' : 'people-outline'} 
          size={24} 
          color={activeTab === 'Lideres' ? '#007AFF' : '#000'} 
        />
        <Text style={activeTab === 'Lideres' ? styles.navTextActive : styles.navText}>Líderes</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={activeTab === 'Ajustes' ? styles.navItemActive : styles.navItem}
        onPress={() => onChangeTab('Ajustes')}
      >
        <Ionicons 
          name={activeTab === 'Ajustes' ? 'settings' : 'settings-outline'} 
          size={24} 
          color={activeTab === 'Ajustes' ? '#007AFF' : '#000'} 
        />
        <Text style={activeTab === 'Ajustes' ? styles.navTextActive : styles.navText}>Ajustes</Text>
      </TouchableOpacity>
    </BlurView>
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

function PokemonRow({ pokemon }: { pokemon: Pokemon }) {
  return (
    <GenericRow 
      title={pokemon.name} 
      subtitle={`#${pokemon.id}`} 
      imageUrl={pokemon.spriteUrl} 
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F2',
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
    backgroundColor: '#E8E8E8',
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
  
  // --- Estilos compartilhados e da Dex ---
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

  // --- Estilos da tela de Detalhes do Líder ---
  leaderScrollHeader: {
    paddingTop: 55, 
    paddingBottom: 20,
    paddingHorizontal: 22,
  },
  backButtonFixed: {
    marginBottom: 10,
  },
  leaderImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  leaderMainImage: {
    width: 280, 
    height: 280,
  },
  leaderTitleContainer: {
    alignItems: 'flex-start',
  },
  leaderTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  leaderSubtitleText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 4,
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rewardSubtitle: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    marginBottom: 12,
  },
  horizontalSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  rewardMoveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rewardMoveName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  rewardMoveStats: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  
  // -- Estilos do Card da Equipe --
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    paddingVertical: 16, 
    paddingLeft: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  teamLeftCol: {
    alignItems: 'center',
    width: 80,
  },
  teamSprite: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  teamId: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  teamRightColHorizontal: {
    flex: 1,
  },
  teamMoveCardHorizontal: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    width: 145, 
    justifyContent: 'center',
  },
  teamMoveHeaderHorizontal: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  teamMoveNameHorizontal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  teamMoveStatsHorizontal: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600',
    lineHeight: 14,
  },

  // --- Outros ---
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

  // --- EFEITO LIQUID GLASS (BOTTOM NAVIGATION) ---
  navWrapper: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 40,
    height: 76,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12, 
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75, 
    height: 60,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: 75, 
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navText: {
    fontSize: 12, 
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 12, 
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 4,
  },
  
  // --- Botão de Voltar Redondo ---
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // --- Estilos da tela de Ajustes ---
  settingsTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, 
    paddingVertical: 8, 
    paddingHorizontal: 24, 
    marginBottom: 110,
  },
  favoritesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteItem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  favoriteSprite: {
    width: 48,
    height: 48,
  },
  settingsSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  settingsMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20, 
  },
  settingsMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  expandedContent: {
    paddingBottom: 20,
  },
  dummyText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },

  // --- Estilos de Configurações Expandidas ---
  expandedConfigContent: {
    paddingBottom: 24,
    paddingTop: 8, 
    gap: 24, 
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  configLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  configColumn: {
    gap: 10,
  },
  configLabelMargin: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7', 
    borderRadius: 8,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93', 
  },
  segmentTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
});