// data/pokemon.ts

export type Pokemon = {
  id: string;      // "004"
  name: string;    // "Charmander"
  spriteUrl: string;
};

export const POKEMON_LIST: Pokemon[] = [
  {
    id: '004',
    name: 'Charmander',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
  },
  {
    id: '005',
    name: 'Charmeleon',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png',
  },
  {
    id: '006',
    name: 'Charizard',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
  },
  {
    id: '113',
    name: 'Chansey',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png',
  },
];