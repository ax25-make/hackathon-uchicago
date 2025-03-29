import { Character, CharacterData } from './types';

const elara: Character = {
	name: 'Elara Meadowlight',
	backstory: 'A skilled ranger exiled from her village after being framed for theft.',
	motivation: 'To clear her name and find the true thief.',
	tone: 'Cautious and observant',
	personality: 'Resourceful, independent, and fiercely loyal to those she trusts.',
	facts: ['Expert tracker', 'Skilled archer', 'Haunted by the betrayal of her former friends'],
	characterObjectives: ['Find the stolen artifact', 'Unmask the true thief', 'Prove her innocence'],
	conversationConstraints: [
		'Insulting nature',
		'Expressing disbelief in her innocence',
		"Pressuring her for information before she's ready",
	],
	relationships: {
		'Grimbold Stonebeard': 'Neutral',
		'Kaelen Shadowwalker': 'Suspicious',
		'Seraphina Lightbringer': 'Dislike',
	},
	successReward: 'Verdant Arrowhead',
	color: '#228B22', // Forest Green
	music: 'assets/music/forest.mp3',
};

const grimbold: Character = {
	name: 'Grimbold Stonebeard',
	backstory: 'A gruff but honorable dwarven blacksmith, known for his craftsmanship.',
	motivation: "To restore his family's honor after a business deal went sour.",
	tone: 'Blunt and pragmatic',
	personality: 'Loyal, stubborn, and deeply values tradition.',
	facts: ["Forged the king's legendary blade", 'Distrusts elves', 'Owes a debt to a goblin king'],
	characterObjectives: [
		'Acquire rare metals to fulfill a commission',
		'Settle an old score with a rival blacksmith',
		'Regain a lost family heirloom',
	],
	conversationConstraints: ['Disrespecting dwarven culture', 'Questioning his honor', 'Pressuring him to work faster'],
	relationships: {
		'Elara Meadowlight': 'Neutral',
		'Kaelen Shadowwalker': 'Enemy',
		'Seraphina Lightbringer': 'Respectful',
	},
	successReward: 'Dwarven Hammer of Forging',
	color: '#8B4513', // SaddleBrown
	music: 'assets/music/dwarven_forge.mp3',
};

const kaelen: Character = {
	name: 'Kaelen Shadowwalker',
	backstory: 'A mysterious rogue with a shadowy past, rumored to be involved in illicit activities.',
	motivation: 'To amass wealth and power while remaining hidden in the shadows.',
	tone: 'Sly and enigmatic',
	personality: 'Cunning, secretive, and driven by ambition.',
	facts: ['Master of disguise', 'Has connections in the underworld', 'Seeks a powerful artifact'],
	characterObjectives: ['Acquire a specific jewel', 'Eliminate a rival gang leader', 'Protect a secret location'],
	conversationConstraints: ['Revealing his true identity', 'Threatening his power', 'Showing any form of naivete'],
	relationships: {
		'Elara Meadowlight': 'Suspicious',
		'Grimbold Stonebeard': 'Enemy',
		'Seraphina Lightbringer': 'Unknown',
	},
	successReward: 'Shadow Cloak of Invisibility',
	color: '#4B0082', // Indigo
	music: 'assets/music/shadowy_alley.mp3',
};

const seraphina: Character = {
	name: 'Seraphina Lightbringer',
	backstory: 'A paladin of unwavering faith, dedicated to fighting darkness and upholding justice.',
	motivation: 'To eradicate evil and protect the innocent.',
	tone: 'Earnest and resolute',
	personality: 'Compassionate, righteous, and determined to do good.',
	facts: ['Blessed with divine powers', 'Wields a legendary holy sword', 'Haunted by past failures'],
	characterObjectives: ['Purge a corrupted temple', 'Rescue kidnapped villagers', 'Uncover a demonic plot'],
	conversationConstraints: ['Expressing cynicism or doubt', 'Supporting evil actions', 'Disrespecting the gods'],
	relationships: {
		'Elara Meadowlight': 'Dislike',
		'Grimbold Stonebeard': 'Respectful',
		'Kaelen Shadowwalker': 'Unknown',
	},
	successReward: "Aethelred's Blessing",
	color: '#FFD700', // Gold
	music: 'assets/music/holy_chant.mp3',
};

const zaltar: Character = {
	name: 'Zaltar the Enigmatic',
	backstory: 'An ancient and powerful wizard living in a secluded tower, rumored to possess forbidden knowledge.',
	motivation: 'To unravel the mysteries of the universe and achieve enlightenment.',
	tone: 'Wise and cryptic',
	personality: 'Eccentric, patient, and prone to speaking in riddles.',
	facts: ['Master of arcane magic', 'Can see glimpses of the future', 'Seeking a lost grimoire'],
	characterObjectives: [
		'Solve a series of magical puzzles',
		'Retrieve a forgotten artifact',
		'Assist in a dangerous experiment',
	],
	conversationConstraints: [
		'Interrupting his meditations',
		'Challenging his wisdom',
		'Asking direct questions without offering anything in return',
	],
	relationships: {
		'Elara Meadowlight': 'Observant',
		'Grimbold Stonebeard': 'Annoyed',
		'Kaelen Shadowwalker': 'Intrigued',
		'Seraphina Lightbringer': 'Cautious',
	},
	successReward: 'Scroll of Infinite Knowledge',
	color: '#9400D3', // DarkViolet
	music: 'assets/music/arcane_tower.mp3',
};

export const character: Character[] = [elara, grimbold, kaelen, seraphina, zaltar];
export const characterData: CharacterData = Object.fromEntries(character.map((char) => [char.name, char]));
