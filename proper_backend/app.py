from flask import Flask, request, jsonify
from google import genai
import os
import random
from dotenv import load_dotenv

# Demon, Medusa, Dean Boyer, Leonardo Da Vinci, Fish Head Guy
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
class Character:
    def __init__(self, alibi, personality):
        self.alibi = alibi
        self.personality = personality
        self.conversation_history = []
        self.questions_remaining = 5

characters = ["" for _ in range(5)] # reset characters
innocent_facts = [] # Facts that are known to all innocent characters
murderer_facts = [] # subset of innocent facts that the murderer knows to increase inconsistency probability
murderer_index = None  # Randomly chosen murderer
names = ["Demon", "Medusa", "Dean Boyer", "Leonardo Da Vinci", "Fish Guy"]


# ---- Helper Functions ----
def generate_prompt_response(prompt):
    """Send a prompt to Gemini and return the raw text."""
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
    )
    return response.candidates[0].content.parts[0].text.strip()

def create_character(setting, name):
    """Generate a character with consistent attributes."""
    # Generate personality first since it sets the tone
    personality_prompt = f"Describe the personality and quirks of {name} in 3 sentences in the context of {setting}. Add no prepending intro text."
    personality = generate_prompt_response(personality_prompt)

    # Generate alibi using personality and name for better consistency
    alibi_prompt = f"Generate a convincing alibi in 3 sentences for {name} based on the {setting} murder mystery. Add no prepending intro text."
    alibi = generate_prompt_response(alibi_prompt)

    # Return a partially formed Character object
    return Character(alibi, personality)

def initialize_game():
    """Initialize game state, generate characters, and randomize murderer."""
    global characters, innocent_facts, murderer_facts, murderer_index
    # Randomly choose the murderer index (0–4)
    murderer_index = random.randint(0, 4)

    setting = generate_prompt_response(f"Generate a detailed story for a murder mystery story with the 5 characters {', '.join(name for name in names)} where {str(names[murderer_index])} is guilty of the crime in 8 sentences.")
    print("✅ Successfully created setting")
    print(f"{setting}")

    # Create characters with dependencies in the correct order
    characters = [""for _ in range(5)] # reset characters
    for i in range(5):
        character = create_character(setting, names[i])
        character.name = names[i]
        characters[i] = character
        print(f"✅ Successfully generated character {str(i)}")
        print(f"character name: {character.name}")
        print(f"character personality: {character.personality}")
        print(f"character alibi: {character.alibi}")

    facts_prompt = f"From this story: {setting} and these alibies {','.join(character.name + ":" + character.alibi for character in characters)} generate 20 facts that each of the innocent characters will know regarding each others' alibies. Return the facts as a numbered list separated by newlines with no prepending intro text."

    # Get all 20 facts using Gemini
    facts_response = generate_prompt_response(facts_prompt)

    # Split the response into a list of facts
    innocent_facts = [fact.strip() for fact in facts_response.split("\n") if fact.strip()]
    if len(innocent_facts) < 20:
        raise ValueError("Failed to generate 20 facts. Check API response for errors.")
    murderer_facts = random.sample(innocent_facts, 4) # murderer will know a subset of these facts

    print(f"✅ Successfully generated facts list")
    print(f"Innocent known facts: {'\n'.join(fact for fact in innocent_facts)}")
    print(f"Guilty known facts: {'\n'.join(fact for fact in murderer_facts)}")

    # Clear global facts and conversation history
    for i, character in enumerate(characters):
                # Initialize conversation context
        facts = innocent_facts if i != murderer_index else murderer_facts
        character_intro = f"In the murder mystery {setting}, you are {character.name}. {character.personality} your alibi: {character.alibi}. you know the facts: {','.join(fact for fact in facts)}. Speak to me from now on as if you are playing the role of this character trying to solve the murder mystery (even if you are the murderer). Stick closely to the facts you know."
        character.conversation_history.append({"role": "user", "parts": [{"text": character_intro}]})
        character.questions_remaining = 5

    print(f"🎭 Murderer is: {characters[murderer_index].name}")

# ---- Flask App ----
app = Flask(__name__)


# ---- ROUTES ----

@app.route("/generate_game", methods=["POST"])
def generate_game():
    """Generate a new murder mystery game."""
    global characters, innocent_facts, murderer_facts, murderer_index
    try:
        initialize_game()
        # Return an empty response with 200 OK
        return "", 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/converse", methods=["POST"])
def converse():
    global characters, innocent_facts, murderer_facts, murderer_index
    """Converse with one of the characters (0-4)."""
    data = request.json
    character_index = int(data.get("character_index"))
    user_query = data.get("query")

    if character_index is None or not (0 <= character_index < 5):
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    if not user_query:
        return jsonify({"error": "Query cannot be empty."}), 400

    character = characters[character_index]
    if character == "":
        return jsonify({"query_successful": False, "message": "Game has not been initialized"})

    # Check if the character has questions remaining
    if character.questions_remaining <= 0:
        return jsonify({"query_successful": False, "message": f"No questions remaining for {character.name}."})

    # Prepare conversation context with history
    conversation_context = character.conversation_history + [{"role": "user", "parts": [{"text": f"new question: {user_query}"}]}]

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

        return jsonify({"query_successful": True, "response": gemini_response, "questions_remaining": character.questions_remaining})

    except Exception as e:
        return jsonify({"error": f"Failed to get response from Gemini API: {str(e)}"}), 500


@app.route("/guess", methods=["POST"])
def guess():
    global characters, innocent_facts, murderer_facts, murderer_index
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
    global characters, innocent_facts, murderer_facts, murderer_index
    data = request.json
    character_index = data.get("character_index")

    if character_index is None or not (0 <= character_index < 5):
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    character = characters[character_index]
    return jsonify({"conversation_history": character.conversation_history, "questions_remaining": character.questions_remaining})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)