export interface Character {
	name: string;
	music: string;
	index: number;
}

export interface CharacterData {
	[key: string]: Character;
}

export interface Protagonist {
	backstory: string;
	objective: string;
	facts: string[]; // The name of the character, initialize as empty
	keys: string[];
	inventory: string[];
}

export interface Story {
	setting: string;
	color: string; // rgb hex
}

export type Music = Array<{
	src: string;
	description: string;
}>;

export interface Message {
	from: 'player' | 'character';
	content: string;
}

export interface Dialogue {
	character: Character;
	history: Message[];
	color: string;
	music: string;
}
