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
characters = [] # List of 5 characters
global_facts = []  # List of facts discovered during the game
# Innocents will always get the complete global facts when prompting responses
# Murderer will get a subset of the complete global facts when prompting responses
murderer_index = None


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


def create_character_prompt(setting, is_murderer=False):
    """Generate character with attributes based on the setting."""
    alibi_prompt = "Generate a ever ever so slightly inconsistent alibi." if is_murderer else "Generate a consistent alibi."
    personality_prompt = "Describe this character's personality and quirks."
    suspicions_prompt = "List 3 other characters this person suspects (cannot suspect themselves)."

    alibi = generate_prompt_response(f"Based on a {setting} murder mystery, {alibi_prompt}")
    personality = generate_prompt_response(f"Based on a {setting} murder mystery, {personality_prompt}")
    suspicions = generate_prompt_response(f"Based on a {setting} murder mystery, {suspicions_prompt}")

    suspicions_list = [s.strip() for s in suspicions.split(",") if s.strip()][:3]
    return alibi, personality, suspicions_list


def initialize_game():
    """Initialize game state, generate characters, and randomize murderer."""
    global characters, global_facts, murderer_index

    # Generate setting and background
    setting = generate_prompt_response("Generate a detailed setting for a murder mystery story in 5 sentences.")

    print("successfully created setting")
    print(setting)

    # Randomly choose the murderer index (0–4)
    murderer_index = random.randint(0, 4)

    characters = []
    # for i in range(5):
    #     alibi, personality, suspicions = create_character_prompt(setting, is_murderer=(i == murderer_index))
    #     character_name = generate_prompt_response(f"Generate a name for character {i+1} in the murder mystery.")
    #     characters.append(Character(character_name, alibi, personality, suspicions))

    # Clear global facts and conversation history
    global_facts = []
    for character in characters:
        character.conversation_history = []
        character.questions_remaining = 5


# ---- Flask App ----
app = Flask(__name__)


# ---- ROUTES ----

@app.route("/generate_game", methods=["POST"])
def generate_game():
    """Generate a new murder mystery game."""
    try:
        initialize_game()
        return jsonify({"message": "Murder mystery generated successfully!"})
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
        return jsonify({"error": f"No questions remaining for {character.name}."}), 400

    # Prepare conversation context
    character_intro = f"You are {character.name}. {character.personality} Your alibi: {character.alibi}."
    facts_for_character = global_facts if character_index != murderer_index else random.sample(global_facts, int(0.6 * len(global_facts)))

    # Prepare conversation history
    conversation_context = [{"role": "user", "parts": [{"text": character_intro}]}]
    conversation_context += character.conversation_history

    # Add query and partial facts if needed
    conversation_context.append({"role": "user", "parts": [{"text": user_query}]})

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

        # Randomly generate new facts and update the global fact list
        if character_index != murderer_index:  # Only innocents add to the fact list
            new_fact = generate_prompt_response("Generate a new fact about the murder based on the conversation.")
            global_facts.append(new_fact)

        return jsonify({"response": gemini_response, "facts": facts_for_character})

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
        return jsonify({"result": "Correct! You have found the murderer! 🎉"})
    else:
        return jsonify({"result": f"Wrong guess. {characters[guess_index].name} is not the murderer."})


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