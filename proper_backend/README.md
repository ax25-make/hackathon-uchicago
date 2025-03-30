# 🕵️ Murder Mystery Game API Documentation

This API allows you to generate a murder mystery game, interact with characters, and make guesses about the murderer. It provides endpoints to initialize the game, converse with characters, make guesses, and retrieve conversation history.

---

## 📚 **Base URL**
```
http://<your-server-ip>:5005
```

---

## 🎲 **1. Generate Game**

### **Endpoint:**
```
POST /generate_game
```

### **Description:**
Initializes the game by:
- Generating a setting and backstory.
- Creating 5 characters with unique personalities and alibis.
- Randomly assigning one of the characters as the murderer.
- Creating a list of facts that all the innocents know but the murderer only partially knows. Hopefully the murderer will reveal himself through his inconsistincies in teh conversation.

### ✅ **Response:**
- `204 No Content` – Game initialized successfully.
- `500 Internal Server Error` – If an error occurs.

### 📄 **Request Example:**
```bash
curl -X POST http://<your-server-ip>:5005/generate_game
```

---

## 💬 **2. Converse with a Character**

### **Endpoint:**
```
POST /converse
```

### **Description:**
Ask a question to one of the 5 characters.

### 📄 **Request Format:**
- `character_index` (int): Index of the character (0-4).
- `query` (string): The question to ask the character.

### 📄 **Request Example:**
```bash
curl -X POST http://<your-server-ip>:5005/converse \
     -H "Content-Type: application/json" \
     -d '{
       "character_index": 2,
       "query": "Where were you when the murder occurred?"
     }'
```

### ✅ **Response:**
- `200 OK` – Query processed successfully.
```json
{
  "query_successful": true,
  "response": "I was in the library reading about Renaissance art.",
  "questions_remaining": 4
}
```
- `400 Bad Request` – Invalid input or missing query.
- `500 Internal Server Error` – Error while querying Gemini.

---

## 🕵️ **3. Guess the Murderer**

### **Endpoint:**
```
POST /guess
```

### **Description:**
Guess who the murderer is by specifying the character's index.

### 📄 **Request Format:**
- `character_index` (int): Index of the character to guess (0-4).

### 📄 **Request Example:**
```bash
curl -X POST http://<your-server-ip>:5005/guess \
     -H "Content-Type: application/json" \
     -d '{
       "character_index": 1
     }'
```

### ✅ **Response:**
- Correct Guess:
```json
{
  "result": true
}
```
- Incorrect Guess:
```json
{
  "result": false
}
```
- `400 Bad Request` – Invalid character index.

---

## 📜 **4. Get Character Conversation History**

### **Endpoint:**
```
POST /get_history
```

### **Description:**
Retrieve the conversation history and remaining questions for a character.

### 📄 **Request Format:**
- `character_index` (int): Index of the character (0-4).

### 📄 **Request Example:**
```bash
curl -X POST http://<your-server-ip>:5005/get_history \
     -H "Content-Type: application/json" \
     -d '{
       "character_index": 3
     }'
```

### ✅ **Response:**
```json
{
  "conversation_history": [
    {"role": "user", "parts": [{"text": "Where were you last night?"}]},
    {"role": "model", "parts": [{"text": "I was in the garden tending to the roses."}]}
  ],
  "questions_remaining": 3
}
```
- `400 Bad Request` – Invalid character index.

---

## ⚙️ **Environment Configuration**

### **Required Environment Variable:**
- `GEMINI_API_KEY` – API key for Gemini.

Add the API key to a `.env` file in the same directory as the script:
```
GEMINI_API_KEY=your_api_key_here
```

---

## 🚀 **Running the Application**
To start the Flask server:
```bash
python your_script_name.py
```

The API will run on:
```
http://0.0.0.0:5005
```

---

## 📝 **Notes**
- Ensure that the Gemini API key is correctly configured.
- The game must be initialized before querying or making guesses.
- Each character starts with 5 questions available.

🎭 *May the best detective win!*