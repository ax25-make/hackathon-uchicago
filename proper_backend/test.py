import google as genai
import random


# Configure your Gemini API key
genai.configure(api_key="AIzaSyDPszqIj-J7hWAoEx7mAKZuyEshQTq2X6E")


model = genai.GenerativeModel('gemini-1.5-flash-002')


class Message:
   def __init__(self, from_: str, content: str):
       self.from_ = from_
       self.content = content


class Character:
   def __init__(self, name: str, backstory: str, motivation: str, tone: str, personality: str, facts: list,
                alibi: str, relationships: dict[str, str], hintsTo: list[str], color: str, music: str, is_murderer: bool = False, known_statements: list[str] = None):
       self.name = name
       self.backstory = backstory
       self.motivation = motivation
       self.tone = tone
       self.personality = personality
       self.facts = facts
       self.alibi = alibi
       self.relationships = relationships
       self.hintsTo = hintsTo
       self.color = color
       self.music = music
       self.is_murderer = is_murderer
       self.known_statements = known_statements if known_statements is not None else []


class Dialogue:
   def __init__(self, character: Character, history: list[Message], color: str, music: str):
       self.character = character
       self.history = history
       self.color = color
       self.music = music


class Story:
   def __init__(self, setting: str, history: str, murderer_name: str, full_story: str):
       self.setting = setting
       self.history = history
       self.murderer_name = murderer_name
       self.full_story = full_story


class Protagonist:
   def __init__(self, backstory: str, objective: str, facts: list[str], inventory: list[str]):
       self.backstory = backstory
       self.objective = objective
       self.facts = facts
       self.inventory = inventory


def generate_random_character(available_names):
   names = available_names
   backstories = ["A wealthy merchant.", "A reclusive scholar.", "A charismatic traveler.", "A stern guard.", "A nervous servant.", "A mysterious artist.", "A troubled relative.", "A local official.", "A charming newcomer.", "A longtime friend."]
   motivations = ["To protect their reputation.", "To hide a dark secret.", "To seek revenge.", "To escape suspicion.", "To find the truth.", "To settle a debt.", "To gain inheritance.", "To acquire power.", "To hide a past.", "To obtain an item."]
   tones = ["Suspicious", "Evasive", "Friendly", "Anxious", "Stern", "Calm", "Aggressive", "Sad", "Confused", "Guilty"]
   personalities = ["Cunning", "Observant", "Chatty", "Reserved", "Stoic", "Creative", "Manipulative", "Honest", "Secretive", "Loyal"]
   alibis = ["I was at the market.", "I was in my study.", "I was at the tavern.", "I was in my room.", "I was with another person.", "I was at the library.", "I was at the church.", "I was at the forge.", "I was at the manor.", "I was at home."]
   colors = ["#228B22", "#4B0082", "#A0522D", "#8B0000", "#008080", "#800080", "#00008B", "#8B008B", "#2F4F4F", "#006400"]
   musics = ["market.mp3", "study.mp3", "tavern.mp3", "room.mp3", "garden.mp3", "library.mp3", "church.mp3", "forge.mp3", "manor.mp3", "home.mp3"]


   name = random.choice(names)
   backstory = random.choice(backstories)
   motivation = random.choice(motivations)
   tone = random.choice(tones)
   personality = random.choice(personalities)
   alibi = random.choice(alibis)
   color = random.choice(colors)
   music = random.choice(musics)


   return Character(
       name=name,
       backstory=backstory,
       motivation=motivation,
       tone=tone,
       personality=personality,
       facts=[],
       alibi=alibi,
       relationships={},
       hintsTo=[],
       color=color,
       music=music
   )


def getNextDialogueResponse(story, protagonist, dialogue, characters, player_input):
   """Generates a short dialogue response."""


   current_character = dialogue.character
   previous_dialogue_summary = ""


   if len(dialogue.history) > 2:
       previous_dialogue_text = [message.content for message in dialogue.history[-4:]]
       previous_dialogue_summary = "Previous conversation: " + " ".join(previous_dialogue_text)


   prompt = f"""
   Story Setting: {story.setting}
   Protagonist Backstory: {protagonist.backstory}
   You are roleplaying as {current_character.name}.
   Backstory: {current_character.backstory}
   Motivation: {current_character.motivation}
   Tone: {current_character.tone}
   Personality: {current_character.personality}
   Alibi: {current_character.alibi}
   Relationships: {current_character.relationships}
   Hints: {current_character.hintsTo}
   {previous_dialogue_summary}
   Player Input: {player_input}
   Previous Statements: {current_character.known_statements}
   Full Story: {story.full_story}


   Respond with a very short dialogue response, one or two sentences maximum, within the context of the murder mystery.
   Only refer to the following people by name: {', '.join(characters.keys())}.
   Do not refer to yourself by name.
   Do not contradict your previous statements.
   Maintain logical consistency with the full story provided.
   """


   try:
       response = model.generate_content(prompt)
       dialogue_content = response.text


       new_message = Message(from_="character", content=dialogue_content)
       dialogue.history.append(Message(from_="player", content=player_input))
       dialogue.history.append(new_message)


       # Update known statements
       current_character.known_statements.append(dialogue_content)


       return {
           "message": new_message,
           "color": dialogue.character.color,
       }
   except Exception as e:
       print(f"Error generating dialogue: {e}")
       error_message = Message(from_="character", content="Sorry, I'm having trouble thinking right now.")
       dialogue.history.append(Message(from_="player", content=player_input))
       dialogue.history.append(error_message)
       return {
           "message": error_message,
           "color": dialogue.character.color,
       }


# Generate 5 random characters
available_names = ["Anya", "Darius", "Elara", "Finn", "Gwen"]
selected_names = random.sample(available_names, 5)


characters = {name: generate_random_character([name]) for name in selected_names}
murderer_name = random.choice(list(characters.keys()))
characters[murderer_name].is_murderer = True


# Generate a cohesive murder mystery prompt
story_prompt = f"""
Generate a detailed murder mystery story set in a small village.
The story should involve these characters: {', '.join(characters.keys())}.
One of them is the murderer. Do not reveal who.
Provide a detailed introduction to the murder, the setting, and the relationships between the characters.
Include alibis, motives, and clues.
"""
story_response = model.generate_content(story_prompt)
story_text = story_response.text


story = Story(setting="The Village", history=story_text, murderer_name=murderer_name, full_story=story_text)
protagonist = Protagonist(backstory="Investigator", objective="Solve the murder", facts=[], inventory=[])
current_dialogue = Dialogue(character=list(characters.values())[0], history=[], color=list(characters.values())[0].color, music=list(characters.values())[0].music)


# Start the story
print(f"Story: {story.history}")


# Start the conversation with the character's first dialogue
player_input = ""
response = getNextDialogueResponse(story, protagonist, current_dialogue, characters, player_input)
print(f"{current_dialogue.character.name}: {response['message'].content}")


# Continue the conversation
while True:
   player_input = input("You: ")
   if "i believe" in player_input.lower() and any(name.lower() in player_input.lower() for name in characters.keys()):
       accused_name = None
       for name in characters.keys():
           if name.lower() in player_input.lower():
               accused_name = name
               break
       if accused_name == story.murderer_name:
           print("You: You are correct.")
           print(f"The murderer was {story.murderer_name}.")
           break
       else:
           print("You: You are incorrect.")
           print(f"The murderer was {story.murderer_name}.")
           break
   elif player_input.lower().startswith("talk to "):
       npc_name = player_input.lower().split("talk to ")[1].lower()
       found_character = None
       for char_name, char in characters.items():
           if char_name.lower() == npc_name:
               found_character = char
               break


       if found_character:
           current_dialogue = Dialogue(character=found_character, history=[], color=found_character.color, music=found_character.music)
           player_input = ""
           response = getNextDialogueResponse(story, protagonist, current_dialogue, characters, player_input)
           print(f"{current_dialogue.character.name}: {response['message'].content}")
       else:
           print("That person is not here.")
   else:
       response = getNextDialogueResponse(story, protagonist, current_dialogue, characters, player_input)
       print(f"{current_dialogue.character.name}: {response['message'].content}")
