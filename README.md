# MoveDex

> O seu companheiro definitivo para a jornada Pokémon. Projetado com foco em acessibilidade, velocidade e experiência do usuário.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PokeAPI](https://img.shields.io/badge/PokeAPI-FF0000?style=for-the-badge&logo=pokemon&logoColor=white)](https://pokeapi.co/)

---

## Sobre o Projeto

**MoveDex** é um aplicativo mobile desenvolvido em React Native (com Expo) que vai muito além de uma Pokédex tradicional. Ele foi criado para fornecer informações táticas em tempo real para treinadores, desde as fraquezas e vantagens de tipos de um Pokémon até dados detalhados sobre os Líderes de Ginásio, Elite dos Quatro e NPCs úteis espalhados pelas regiões.

O aplicativo se destaca por seu **robusto sistema de configurações e acessibilidade**, permitindo que o usuário personalize a interface com textos maiores, fontes em negrito, alternância de temas (Claro/Escuro) e suporte nativo a múltiplos idiomas.

## Principais Funcionalidades

### Pokédex Avançada
- **Busca Rápida e Filtros:** Pesquise Pokémons por nome ou filtre por seus respectivos tipos (Água, Fogo, Planta, etc).
- **Detalhes Completos:** Visualize altura, peso, linha evolutiva completa e estatísticas baseadas nos jogos clássicos.
- **Vantagens e Fraquezas:** Cálculo dinâmico das vantagens e fraquezas de tipo de cada Pokémon.
- **Movimentos (Moves):** Listagem dos movimentos mais e menos utilizados por cada Pokémon, filtrados pela geração selecionada.
- **Gritos (Cries):** Ouça o som autêntico de cada Pokémon diretamente no app.

### Área de Líderes e Regiões
- **Times e Recompensas:** Descubra os Pokémons utilizados por cada Líder de Ginásio, Elite 4 e Campeão (atualmente suportando a região de Kanto).
- **Dados Estratégicos:** Identifique as fraquezas do time adversário antes de batalhar e saiba quais Insígnias e TMs você receberá de recompensa.
- **NPCs Úteis:** Localize o Name Rater, Move Deleter e o Daycare facilmente pelo mapa.

### Acessibilidade e Configurações (Persistidas offline)
- **Modo Claro / Escuro:** Ajuste automático baseado no tema escolhido.
- **i18n (Internacionalização):** Troca de idioma em tempo real (Português do Brasil ↔ Inglês) cobrindo toda a interface, descrições de Pokémons e nomes de ataques.
- **Acessibilidade Visual:** Opções para aumentar o tamanho de todos os textos (Large Text) e forçar o uso de negrito (Bold Text) para melhor leitura.
- **Sistema de Favoritos:** Salve seus Pokémons preferidos e acesse-os rapidamente.

## Tecnologias Utilizadas

O projeto foi construído utilizando as melhores e mais modernas ferramentas do ecossistema front-end mobile:

- **[React Native](https://reactnative.dev/):** Framework para construção de interfaces nativas.
- **[Expo](https://expo.dev/):** Plataforma para desenvolvimento, build e deploy universal.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática para um código mais seguro e manutenível.
- **[React Navigation](https://reactnavigation.org/):** Navegação fluída entre abas (Bottom Tabs) e pilhas (Native Stack).
- **[Expo AV](https://docs.expo.dev/versions/latest/sdk/audio/):** Para reprodução assíncrona e otimizada dos sons dos Pokémons.
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/):** Armazenamento local leve para persistir configurações e favoritos.
- **[PokeAPI](https://pokeapi.co/):** API RESTful consumida para dados dinâmicos dos Pokémons.

## Como Executar o Projeto

Certifique-se de ter o [Node.js](https://nodejs.org/) e o [Expo CLI](https://docs.expo.dev/get-started/installation/) instalados em sua máquina.

```bash
# 1. Clone este repositório
$ git clone https://github.com/SEU_USUARIO/movedex.git

# 2. Acesse a pasta do projeto
$ cd movedex

# 3. Instale as dependências
$ npm install
# ou
$ yarn install

# 4. Inicie o servidor do Expo
$ npx expo start
