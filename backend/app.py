from flask import Flask, request, jsonify
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ---- CONFIG ----
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Make sure it's in the .env file in the same directory!")

# Create Gemini client with API key
client = genai.Client(api_key=API_KEY)

# Use gemini-2.0-flash or any model you prefer
MODEL_NAME = "gemini-2.0-flash"

# ---- In-memory state for conversation ----
conversation_state = {"conversation": []}

app = Flask(__name__)

# ---- ROUTES ----

# Start or reset conversation
@app.route("/start_session", methods=["POST"])
def start_session():
    conversation_state["conversation"] = []  # Reset conversation history
    return jsonify({"message": "Session reset. Ready for a new conversation!"})


# Send a message to Gemini and get a response
@app.route("/send_message", methods=["POST"])
def send_message():
    data = request.json
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Add user message to conversation history
    conversation_state["conversation"].append({"role": "user", "parts": [{"text": user_message}]})

    try:
        # Prepare messages for Gemini
        messages = [{"role": msg["role"], "parts": msg["parts"]} for msg in conversation_state["conversation"]]

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=messages,
        )

        gemini_response = response.text

        # Add assistant response to conversation history
        conversation_state["conversation"].append({"role": "model", "parts": [{"text": gemini_response}]})

        return jsonify({"response": gemini_response, "conversation": conversation_state["conversation"]})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to get response from Gemini API"}), 500


# Get current conversation history
@app.route("/get_history", methods=["GET"])
def get_history():
    return jsonify({"conversation": conversation_state["conversation"]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)