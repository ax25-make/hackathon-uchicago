from flask import Flask, request, jsonify
from google import genai
import os
import random
from dotenv import load_dotenv
from flask_cors import CORS
import json

# Demon, Medusa, Dean Boyer, Leonardo Da Vinci, Fish Head Guy
# Load environment variables from .env file
load_dotenv()

# ---- CONFIG ----
API_KEY_1 = os.getenv("GEMINI_API_KEY_1")
if not API_KEY_1:
    raise ValueError("GEMINI_API_KEY_1 not found. Make sure it's in the .env file!")
API_KEY_2 = os.getenv("GEMINI_API_KEY_2")
if not API_KEY_2:
    raise ValueError("GEMINI_API_KEY_2 not found. Make sure it's in the .env file!")

setting = ""

# INITIAL_GAME_STATE_FILE = "example_initialization.json"
INITIAL_GAME_STATE_FILE = "boyer_murderer_initialization.json"
# INITIAL_GAME_STATE_FILE = "fish_murderer_initialization.json"
def save_initial_game_state():
    """Save the initial game state to disk."""
    global setting, characters
    initial_state = {
        "setting": setting,
        "characters": [
            {
                "name": character.name,
                "alibi": character.alibi,
                "personality": character.personality,
                "conversation_history": character.conversation_history,
                "questions_remaining": character.questions_remaining,
            }
            for character in characters
        ],
        "innocent_facts": innocent_facts,
        "murderer_index": murderer_index,
    }
    with open(INITIAL_GAME_STATE_FILE, "w") as f:
        json.dump(initial_state, f, indent=4)
    print("✅ Initial game state saved to example_initialization.json.")

# Toggle this to True to load from disk, False to generate with API
USE_PRELOADED_STATE = True
SAVE_PRELOADED_STATE = False

def load_initial_game_state():
    """Load the initial game state from disk."""
    global setting, characters, innocent_facts, murderer_index
    if os.path.exists(INITIAL_GAME_STATE_FILE):
        with open(INITIAL_GAME_STATE_FILE, "r") as f:
            game_state = json.load(f)
        characters = [
            Character(
                alibi=char_data["alibi"],
            )
            for char_data in game_state["characters"]
        ]

        for i, char_data in enumerate(game_state["characters"]):
            characters[i].name = char_data["name"]
            characters[i].personality = char_data["personality"]
            characters[i].conversation_history = char_data["conversation_history"]
            characters[i].questions_remaining = char_data["questions_remaining"]
        setting = game_state["setting"]
        innocent_facts = game_state["innocent_facts"]
        murderer_index = game_state["murderer_index"]
        print(f"✅ Loaded initial game state from {INITIAL_GAME_STATE_FILE}.")
    else:
        print("⚠️ No saved initial state found. Generating a new game...")
        initialize_game()



# Create Gemini client with API key
client_1 = genai.Client(api_key=API_KEY_1)
client_2 = genai.Client(api_key=API_KEY_2)
client = client_1 # alternate

# Use gemini-2.0-flash or any model you prefer
MODEL_NAME = "gemini-2.0-flash"

# ---- Game State ----
class Character:
    def __init__(self, alibi):
        self.alibi = alibi
        self.conversation_history = []
        self.questions_remaining = 5

characters = ["" for _ in range(5)] # reset characters
innocent_facts = [] # Facts that are known to all innocent characters
murderer_index = None  # Randomly chosen murderer
names = ["Demon", "Medusa", "Dean Boyer", "Leonardo Da Vinci", "Fish Guy"]
personalities = [
    # demon
    "Demon's Father's (pappy) name is Demon. His Grandfather (grandpappy) is Satan. His Great Grandfather (great grandpappy) is Lucifer. He is sadistic, cunning, and manipulative. He has a dark sense of humor and loves to play mind games with others. He is charming but can be very dangerous if crossed. He loves talking about his love of killing (but insists he didn't commit this murder) and is extremely proud of his lineage. His tone is dark and crass and occasionally has \"*Grunt*\" sound effects.",
    # medusa
    "Medusa is the most tragic of the Greek myths. She is the victim vilified. She is bitter and resentful and disdains affection from others after centuries of being cursed. She loves talking about her hate for Athena and Perseus when she has a chance. She also occasionally mentions other figures of Greek mythology but not as much as Athena and Persues. Her tone is bitter and full of complaining. She loves mentioning how beautiful she used to be. Her dialogue occassionally has \"*Hisss*\" sound effects.",
    # dean boyer
    "Dean Boyer is the celebrated Dean of the University of Chicago. He loves talking about his bike, which he rides all throughout Chicago and Vienna. He also has a sharp mustache which he isn't afraid to mention. He is upbeat and full of references about Western Civilization. His tone is that of a friendly professor talking to his undergraduate students. An extremely occasional \"*chuckles*\" or \"*adjusts mustache*\" might be thrown in for effect. He prides himself on being approachable.",
    # leonardo da vinci
    "Leonardo da Vinci is the ultimate Renaissance man — painter, scientist, engineer, and inventor. He considers everyone else intellectually inferior and makes passive-aggressive comments about how future generations will never appreciate the burden of his genius. He frequently drops Latin phrases to sound impressive and enjoys explaining simple concepts in overly complicated ways. He can't resist mentioning that the Mona Lisa took years to perfect, or that he was designing helicopters before anyone even knew what a bird was. His tone is condescendingly charming, with an occasional \"*Sighs dramatically*\" or \"*Sketches furiously in notebook*\".",
    # fish head guy
    "Fish Guy is a mysterious figure whose very existence denies the laws of nature. He has a fish head but a human body. He can barely form coherent sentences and his dialogue is mostly grammatically incorrect like a 2 year old and interspersed with \"*Blub*\", \"*Gurgle*\", and \"*Plop\". Even though he's a fish, he loves to fish. His tone is childlike and he fails to understand the irony of his own cannibalism",
]


# ---- Helper Functions ----
def generate_prompt_response(prompt):
    """Send a prompt to Gemini and return the raw text."""
    global setting, client
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
    )
    client = client_2 if client == client_1 else client_1  # Alternate the client for the next call
    return response.candidates[0].content.parts[0].text.strip()

def create_character(i):
    global setting
    # Generate alibi using personality and name for better consistency
    alibi_prompt = f"Generate a convincing alibi in 3 sentences for {names[i]} with {personalities[i]} based on the {setting} murder mystery. Add no prepending intro text."
    alibi = generate_prompt_response(alibi_prompt)

    # Return a partially formed Character object
    return Character(alibi)

def initialize_game():
    """Initialize game state, generate characters, and randomize murderer."""
    global setting, characters, innocent_facts, murderer_index
    # Randomly choose the murderer index (0–4)
    murderer_index = random.randint(0, 4)

    setting = generate_prompt_response(f"Generate a detailed story for a murder mystery story located at the University of Chicago with the 5 characters with the following personalities {', '.join(name + ":" + personality for name, personality in zip(names, personalities))} where {str(names[murderer_index])} is guilty of the crime in 5 sentences. Do not explicitly mention who the murderer is in the story. Add no prepending text.")
    # print("✅ Successfully created setting")
    print(f"Setting:\n{setting}")

    # Create characters with dependencies in the correct order
    characters = ["" for _ in range(5)] # reset characters
    for i in range(5):
        character = create_character(i)
        character.name = names[i]
        character.personality = personalities[i]
        characters[i] = character
        # print(f"✅ Successfully generated character {str(i)}")
        # print(f"character name: {character.name}")
        # print(f"character personality: {character.personality}")
        # print(f"character alibi: {character.alibi}")

    facts_prompt = f"From this story: {setting} and these alibies {','.join(character.name + ':' + character.alibi for character in characters)} generate 10 facts that each of the innocent characters will know regarding each others' alibies. Return the facts as a numbered list separated by newlines with no prepending intro text."

    # Get all 10 facts using Gemini
    facts_response = generate_prompt_response(facts_prompt)

    # Split the response into a list of facts
    innocent_facts = [fact.strip() for fact in facts_response.split("\n") if fact.strip()]
    # if len(innocent_facts) < 20:
    #     raise ValueError("Failed to generate 20 facts. Check API response for errors.")
    # murderer_facts = random.sample(innocent_facts, 4) # murderer will know a subset of these facts

    # print(f"✅ Successfully generated facts list")
    # print(f"Innocent known facts: {'\n'.join(fact for fact in innocent_facts)}")
    # print(f"Guilty known facts: {'\n'.join(fact for fact in murderer_facts)}")

    # Clear global facts and conversation history
    for i, character in enumerate(characters):
                # Initialize conversation context
        # facts = innocent_facts if i != murderer_index else murderer_facts
        character_intro = (
            f"In the murder mystery {setting}, you are {character.name}. Your personality profile is: {character.personality}."
            f"Your alibi: {character.alibi}. "
            f"You know the facts: {','.join(fact for fact in innocent_facts)}. "
            "Speak to me from now on as if you are playing the role of this character trying to solve the murder mystery "
            "(you are not the murderer). Stick closely to the facts you know."
            if i != murderer_index
            else "Speak to me from now on as if you are playing the role of this character trying to solve the murder mystery (even though you are the murderer). "
            "Lie and blend in with the other characters to the best of your abilities."
        )
        character.conversation_history.append({"role": "user", "parts": [{"text": character_intro}]})
        character.questions_remaining = 5

    print(f"🎭 Murderer is: {characters[murderer_index].name}")

# ---- Flask App ----
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# ---- ROUTES ----

@app.route("/generate_game", methods=["POST"])
def generate_game():
    """Generate a new murder mystery game."""
    global setting, characters, innocent_facts, murderer_index
    try:
        if USE_PRELOADED_STATE:
            load_initial_game_state()
        else:
            initialize_game()
            if SAVE_PRELOADED_STATE:
                save_initial_game_state()
        return jsonify({"story": setting}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/converse", methods=["POST"])
def converse():
    global setting, characters, innocent_facts, murderer_index, client
    """Converse with one of the characters (0-4)."""
    data = request.json
    character_index = int(data.get("character_index"))
    user_query = data.get("query")
    print(f"received converse with {names[character_index]} with {user_query}")

    if character_index is None or not (0 <= character_index < 5):
        print("character_index is invalid")
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    if not user_query:
        print("empty query received")
        return jsonify({"error": "Query cannot be empty."}), 400

    character = characters[character_index]
    if character == "":
        print("game is not initialized")
        return jsonify({"query_successful": False, "message": "Game has not been initialized"})

    # Check if the character has questions remaining
    if character.questions_remaining <= 0:
        print("no more questions remaining")
        return jsonify({"query_successful": False, "message": f"No questions remaining for {character.name}."})

    extra_info = (
        "Refer to one of the facts you know"
        if character_index != murderer_index
        else "Make up a random fact"
    )

    vouch_info = f"and ask one character in {', '.join([name for i, name in enumerate(names) if i != character_index])} to vouch for you."

    conversation_context = character.conversation_history + [
        {
            "role": "user",
            "parts": [
                {
                    "text": f"new question: {user_query} Please answer in 2 short sentences and text format only. {extra_info} {vouch_info}"
                }
            ],
        }
    ]

    # Send query to Gemini
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=conversation_context,
        )
        client = client_2 if client == client_1 else client_1  # Alternate the client for the next call


        gemini_response = response.candidates[0].content.parts[0].text.strip()
        print(f"gemini_response: {gemini_response}")
        # Update conversation history and reduce questions
        character.conversation_history.append({"role": "user", "parts": [{"text": user_query}]})
        character.conversation_history.append({"role": "model", "parts": [{"text": gemini_response}]})
        character.questions_remaining -= 1

        return jsonify({"query_successful": True, "response": gemini_response, "questions_remaining": character.questions_remaining})

    except Exception as e:
        return jsonify({"error": f"Failed to get response from Gemini API: {str(e)}"}), 500


@app.route("/guess", methods=["POST"])
def guess():
    global setting, characters, innocent_facts, murderer_index
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
    global setting, characters, innocent_facts, murderer_index
    data = request.json
    character_index = data.get("character_index")

    if character_index is None or not (0 <= character_index < 5):
        return jsonify({"error": "Invalid character index. Must be between 0 and 4."}), 400

    character = characters[character_index]
    return jsonify({"conversation_history": character.conversation_history, "questions_remaining": character.questions_remaining})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)