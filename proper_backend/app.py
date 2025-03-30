from flask import Flask, request, jsonify
from google import genai
import os
import random
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ---- CONFIG ----
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Make sure it's in the .env file!")

# Create Gemini client with API key
client = genai.Client(api_key=API_KEY)

# Use gemini-2.0-flash or any model you prefer
MODEL_NAME = "gemini-2.0-flash"

# ---- Game State ----
characters = []  # List of 5 characters
global_facts = []  # List of facts discovered during the game
murderer_index = None  # Randomly chosen murderer


class Character:
    def __init__(self, name, alibi, personality, suspicions):
        self.name = name
        self.alibi = alibi
        self.personality = personality
        self.suspicions = suspicions
        self.conversation_history = []
        self.questions_remaining = 5


# ---- Helper Functions ----
def generate_prompt_response(prompt):
    """Send a prompt to Gemini and return the raw text."""
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
    )
    return response.candidates[0].content.parts[0].text.strip()


def create_character(setting, name, other_names):
    """Generate a character with consistent attributes."""

    # Generate personality first since it sets the tone
    personality_prompt = f"Describe the personality and quirks of {name} in the context of a {setting} murder mystery."
    personality = generate_prompt_response(personality_prompt)

    # Generate alibi using personality and name for better consistency
    alibi_prompt = f"Generate a consistent alibi for {name}, whose personality is {personality}, based on the {setting} murder mystery."
    alibi = generate_prompt_response(alibi_prompt)

    # Generate suspicions based on names, setting, personalities, and alibis

    # Randomly select 2 characters for suspicions (cannot suspect themselves)
    possible_suspicions = [n for n in other_names if n != name]
    suspicions = random.sample(possible_suspicions, min(2, len(possible_suspicions)))

    # Return a fully formed Character object
    return Character(name, alibi, personality, suspicions)



def initialize_game():
    """Initialize game state, generate characters, and randomize murderer."""
    global characters, global_facts, murderer_index

    # Generate setting and background
    setting = generate_prompt_response("Generate a detailed setting for a murder mystery story in 8 sentences.")
    global_facts.append(setting)
    print("✅ Successfully created setting")
    print(f"{setting}")

    # Generate character names first
    character_names = [
        generate_prompt_response(f"Two word answer. Generate a first name and last name for a character in the murder mystery with setting: {setting}.")
        for _ in range(5)
    ]
    print("✅ Successfully generated character names")

    # Randomly choose the murderer index (0–4)
    murderer_index = random.randint(0, 4)

    # Create characters with dependencies in the correct order
    characters = []
    for i in range(5):
        character = create_character(setting, character_names[i], character_names)
        characters.append(character)
        print(f"✅ Successfully generated character {str(i)}")
        print(f"{}")

    # Clear global facts and conversation history
    global_facts = []
    for character in characters:
        character.conversation_history = []
        character.questions_remaining = 5

    print(f"🎭 Murderer is: {characters[murderer_index].name}")

# ---- Flask App ----
app = Flask(__name__)


# ---- ROUTES ----

@app.route("/generate_game", methods=["POST"])
def generate_game():
    """Generate a new murder mystery game."""
    try:
        initialize_game()
        # Return the setting and a list of names in JSON
        character_names = [character.name for character in characters]
        return jsonify({"setting": global_facts[0],
                        "character_names": character_names})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/converse", methods=["POST"])
def converse():
    """Converse with one of the characters (0-4)."""
    data = request.json
    character_index = data.get("character_index")
    user_query = data.get("query")

    if character_index is None or not (0 <= character_index < 5):
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    if not user_query:
        return jsonify({"error": "Query cannot be empty."}), 400

    character = characters[character_index]

    # Check if the character has questions remaining
    if character.questions_remaining <= 0:
        return jsonify({"query_successful": False, "message": f"No questions remaining for {character.name}."})

    # Prepare conversation context
    if not character.conversation_history:
        character_intro = f"You are {character.name}. {character.personality} Your alibi: {character.alibi}. You suspect: {', '.join(character.suspicions)}."
        character.conversation_history.append({"role": "system", "parts": [{"text": character_intro}]})

    # Prepare conversation context with history
    facts_for_character = global_facts if character_index != murderer_index else random.sample(global_facts, int(0.6 * len(global_facts)))

    conversation_context = character.conversation_history + [{"role": "user", "parts": [{"text": user_query}]}, {"role": "system", "parts": [{"text": f"These are the current known facts: {facts_for_character}"}]}]

    # Send query to Gemini
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=conversation_context,
        )

        gemini_response = response.candidates[0].content.parts[0].text.strip()

        # Update conversation history and reduce questions
        character.conversation_history.append({"role": "user", "parts": [{"text": user_query}]})
        character.conversation_history.append({"role": "model", "parts": [{"text": gemini_response}]})
        character.questions_remaining -= 1

        # Add innocent responses to global facts
        if character_index != murderer_index:
            new_fact = generate_prompt_response(f"Generate a new fact about the murder from the conversation with {character.name}.")
            global_facts.append(new_fact)

        return jsonify({"query_successful": True, "response": gemini_response, "questions_remaining": character.questions_remaining})

    except Exception as e:
        return jsonify({"error": f"Failed to get response from Gemini API: {str(e)}"}), 500


@app.route("/guess", methods=["POST"])
def guess():
    """Make a guess about who the murderer is."""
    data = request.json
    guess_index = data.get("character_index")

    if guess_index is None or not (0 <= guess_index < 5):
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    if guess_index == murderer_index:
        return jsonify({"result": True})
    else:
        return jsonify({"result": False})


@app.route("/get_history", methods=["POST"])
def get_history():
    """Get the conversation history for a character."""
    data = request.json
    character_index = data.get("character_index")

    if character_index is None or not (0 <= character_index < 5):
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    character = characters[character_index]
    return jsonify({"conversation_history": character.conversation_history, "questions_remaining": character.questions_remaining})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)