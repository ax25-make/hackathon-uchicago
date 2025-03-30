
export interface Character {
  name: string; // The name of the character
  backstory: string; // String that describes their origin
  motivation: string; // String that describes what motivates them
  tone: string; // String that describes the tone
  personality: string; // String that describes the personality
  facts: []; // Facts (generated as we go to keep consistency) about characters, initialize as empty
  characterObjectives: string[];
  conversationConstraints: string[]; // Constraints on how you speak to Character, will respond rudely if constraints are broken
  relationships: Record<string, string>; // Character relationship to others
  successReward: string;
}

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
  
