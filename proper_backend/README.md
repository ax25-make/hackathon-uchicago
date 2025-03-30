***This is the basic functionality for using Gemini to initialize game state***

Examples:

1. Endpoint: /generate_game
Description: Initializes the setting of the game, including the background story as well as who the murderer is...

Backend rememberes this state:
- who the murderer is
- who the characters are (name, )

Returned to the front-end:
- setting: description of the world of the game
- character names: to render them

```curl -X POST http://localhost:5005/generate_game```

`

`

