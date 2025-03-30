import { Character, CharacterData, Dialogue, Message, Story } from '@/backend/types';
import { create } from 'zustand';
import { Protagonist } from '../backend/types';

interface Tab {
	character: Character;
	dialogue: Dialogue;
}

function getTabIdxFromCharacter(character: Character, state: GameStore): number {
	return state.tabs.findIndex((tab) => tab.character.name === character.name);
}

interface GameStore {
	initialized: boolean;
	loading: boolean;
	isSceneMenu: boolean;

	currentTabIndex: number;
	setCurrentTabIndex: (index: number) => void;
	setCurrentTab(character: Character): void; // Set current tab to the character

	// Game
	story: Story;
	protagonist: Protagonist;
	characters: CharacterData;
	setInitialGame(story: Story, protagonist: Protagonist, characters: CharacterData): void;

	// UI related
	tabs: Tab[]; // Created by setInitialGame
	bookmarks: Record<string, { index: number; message: Message }[]>; // Message is a convenience accessor
	setBookmark(character: Character, index: number): void; // Set bookmark for a character
	removeBookmark(character: Character, index: number): void; // Remove bookmark for a character

	// Game related
	addMessage(character: Character, message: Message): void; // Add message to the game
	addMessageToCurrentTab(message: Message): void; // Add message to the current tab
}

export const useGameStore = create<GameStore>()((set) => ({
	initialized: false,
	loading: true,
	isSceneMenu: true,
	currentTabIndex: 0,
	tabs: [],
	setCurrentTabIndex: (index: number) => set({ currentTabIndex: index }),

	setCurrentTab: (character: Character) =>
		set((state) => {
			const index = state.tabs.findIndex((tab) => tab.character.name === character.name);
			if (index !== -1) {
				return { ...state, currentTabIndex: index };
			}
			return state;
		}),

	// Game
	story: {} as Story,
	protagonist: {} as Protagonist,
	characters: {} as CharacterData,

	setInitialGame: (story: Story, protagonist: Protagonist, characters: CharacterData) =>
		set({
			story,
			protagonist,
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
			initialized: true,
			loading: false,
			isSceneMenu: false,
		}),

	// UI related
	bookmarks: {},
	setBookmark: (character: Character, index: number) =>
		set((state) => {
			const tabIdx = getTabIdxFromCharacter(character, state);
			if (tabIdx === -1) {
				return state; // Character not found in tabs
			}
			const message = state.tabs[tabIdx].dialogue.history[index];
			if (!message) {
				return state; // Message not found
			}
			const bookmarks = { ...state.bookmarks };
			bookmarks[character.name] = bookmarks[character.name] || [];
			// Check if the message is already bookmarked
			const existingBookmark = bookmarks[character.name].find((bookmark) => bookmark.index === index);
			if (existingBookmark) {
				// If it exists, remove it
				bookmarks[character.name] = bookmarks[character.name].filter((bookmark) => bookmark.index !== index);
			}
			// Otherwise, add the bookmark
			bookmarks[character.name].push({ index, message });
			// Sort bookmarks by index
			bookmarks[character.name].sort((a, b) => a.index - b.index);
			// Update the bookmarks state
			return { bookmarks };
		}),

	removeBookmark: (character: Character, index: number) =>
		set((state) => {
			const tabIdx = getTabIdxFromCharacter(character, state);
			if (tabIdx === -1) {
				return state; // Character not found in tabs
			}
			// Get the bookmarks for the character
			const bookmarks = { ...state.bookmarks };
			if (!bookmarks[character.name]) {
				return state; // No bookmarks for this character
			}
			// Remove the bookmark
			bookmarks[character.name] = bookmarks[character.name].filter((bookmark) => bookmark.index !== index);
			return { bookmarks };
		}),

	// Game related
	addMessage: (character: Character, message: Message) =>
		set((state) => {
			const tabIdx = getTabIdxFromCharacter(character, state);
			if (tabIdx === -1) {
				return state; // Character not found in tabs
			}
			const updatedTabs = state.tabs.map((tab, idx) =>
				idx === tabIdx
					? {
							...tab,
							dialogue: {
								...tab.dialogue,
								history: [...tab.dialogue.history, message],
							},
					  }
					: tab
			);
			return { tabs: updatedTabs };
		}),

	addMessageToCurrentTab: (message: Message) =>
		set((state) => {
			if (state.currentTabIndex >= 0 && state.currentTabIndex < state.tabs.length) {
				const updatedTabs = state.tabs.map((tab, idx) =>
					idx === state.currentTabIndex
						? {
								...tab,
								dialogue: {
									...tab.dialogue,
									history: [...tab.dialogue.history, message],
								},
						  }
						: tab
				);
				return { tabs: updatedTabs };
			}
			return state;
		}),
}));
