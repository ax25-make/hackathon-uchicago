***Use this example as boilerplate to help build a proper Gemini Backend***
***Prerequisites***
- Create a virtual environment and
```bash
pip install -r requirements.txt
```
- Create a .env file with:
`GEMINI_API_KEY={your gemini api key}`

***Usage (examples are local)***

1. Restart Session (remove conversation history)
```bash
curl -X POST http://127.0.0.1:5005/start_session -H "Content-Type: application/json"
```

`
{
  "conversation": [
    {
      "parts": [
        {
          "text": "Hello Gemini, how are you?"
        }
      ],
      "role": "user"
    },
    {
      "parts": [
        {
          "text": "I am doing well, thank you for asking! As a large language model, I don't experience emotions or have personal feelings in the same way humans do. However, I am functioning optimally and ready to assist you with your requests. How can I help you today?\n"
        }
      ],
      "role": "model"
    }
  ],
  "response": "I am doing well, thank you for asking! As a large language model, I don't experience emotions or have personal feelings in the same way humans do. However, I am functioning optimally and ready to assist you with your requests. How can I help you today?\n"
}
`

2. Converse (remembers conversation history)
```bash
curl -X POST http://127.0.0.1:5005/send_message -H "Content-Type: application/json" -d '{"message": "what was the last message I sent you?"}'
```

`
{
  "conversation": [
    {
      "parts": [
        {
          "text": "Hello Gemini, how are you?"
        }
      ],
      "role": "user"
    },
    {
      "parts": [
        {
          "text": "I am doing well, thank you for asking! As a large language model, I don't experience emotions or have personal feelings in the same way humans do. However, I am functioning optimally and ready to assist you with your requests. How can I help you today?\n"
        }
      ],
      "role": "model"
    },
    {
      "parts": [
        {
          "text": "what was the last message I sent you?"
        }
      ],
      "role": "user"
    },
    {
      "parts": [
        {
          "text": "The last message you sent me was: \"Hello Gemini, how are you?\"\n"
        }
      ],
      "role": "model"
    }
  ],
  "response": "The last message you sent me was: \"Hello Gemini, how are you?\"\n"
}
`
