import { Character, CharacterData, Dialogue } from '@/backend/types';
import { create } from 'zustand';

interface Tab {
	character: Character;
	dialogue: Dialogue;
}

interface GameStore {
	loading: boolean;
	setLoading: (loading: boolean) => void;
	isSceneMenu: boolean;

	error: string | null;
	setError: (error: string | null) => void; // Set error message

	gameOver: boolean;
	setGameOver: (gameOver: boolean) => void; // Set game over state

	currentTabIndex: number;
	setCurrentTab(character: Character): void; // Set current tab to the character
	setCurrentTabIndex: (index: number) => void;

	openModal: 'instructions' | 'case' | 'guess' | 'history' | null;
	setOpenModal: (modal: 'instructions' | 'case' | 'guess' | 'history' | null) => void;

	story: string;
	characters: CharacterData;
	setInitialGame(story: string, characters: CharacterData): void; // Set initial game state

	tabs: Tab[]; // Created by setInitialGame
}

export const useGameStore = create<GameStore>()((set) => ({
	isSceneMenu: true,
	gameOver: false,
	setGameOver: (gameOver: boolean) => set({ gameOver }),
	loading: true,
	setLoading: (loading: boolean) => set({ loading }),
	error: null,
	setError: (error: string | null) => set({ error, loading: false }), // Set error message and stop loading
	tabs: [],
	currentTabIndex: 0,
	setCurrentTabIndex: (index: number) => set({ currentTabIndex: index }),
	setCurrentTab: (character: Character) =>
		set((state) => {
			const index = state.tabs.findIndex((tab) => tab.character.name === character.name);
			if (index !== -1) {
				return { ...state, currentTabIndex: index };
			}
			return state;
		}),

	openModal: 'instructions',
	setOpenModal: (modal: 'instructions' | 'case' | 'guess' | 'history' | null) => set({ openModal: modal }),

	story: '',
	characters: {} as CharacterData,

	setInitialGame: (story: string, characters: CharacterData) =>
		set({
			story,
			characters,
			tabs: Object.values(characters).map((character) => ({
				character,
				dialogue: {
					character,
					history: [],
					color: '',
					music: character.music,
				},
			})),
			loading: false,
			isSceneMenu: false,
		}),
}));
