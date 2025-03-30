import { CharacterData } from './backend/types';

export const characters = ['Demon', 'Medusa', 'Dean Boyer', 'Da Vinci', 'Fish Guy'] as const;
export const charactersAssets = {
	Demon: {
		name: 'Demon',
		deathSrc: '/images/characters/demon_death.gif',
		idleSrc: '/images/characters/demon.gif',
		musicSrc: '',
	},
	Medusa: {
		name: 'Medusa',
		deathSrc: '/images/characters/medusa_death.gif',
		idleSrc: '/images/characters/medusa.gif',
		musicSrc: '',
	},
	'Dean Boyer': {
		name: 'Dean Boyer',
		deathSrc: '/images/characters/boyer_death.gif',
		idleSrc: '/images/characters/boyer.gif',
		musicSrc: '',
	},
	'Da Vinci': {
		name: 'Da Vinci',
		deathSrc: '/images/characters/davinci_death.gif',
		idleSrc: '/images/characters/davinci.gif',
		musicSrc: '',
	},
	'Fish Guy': {
		name: 'Fish Guy',
		deathSrc: '/images/characters/fish_death.gif',
		idleSrc: '/images/characters/fish.gif',
		musicSrc: '',
	},
} as const;

export const characterData: CharacterData = {
	Demon: {
		name: 'Demon',
		music: '/music/demon.mp3',
		index: 0,
	},
	Medusa: {
		name: 'Medusa',
		music: '/music/medusa.mp3',
		index: 1,
	},
	'Dean Boyer': {
		name: 'Dean Boyer',
		music: '/music/boyer.mp3',
		index: 2,
	},
	'Da Vinci': {
		name: 'Da Vinci',
		music: '/music/davinci.mp3',
		index: 3,
	},
	'Fish Guy': {
		name: 'Fish Guy',
		music: '/music/fish.mp3',
		index: 4,
	},
};
