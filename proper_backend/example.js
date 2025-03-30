const BASE_URL = "http://127.0.0.1:5005";
let conversationHistories = {}, questionsRemaining = {}, gameInitialized = false;

const fetchAPI = (endpoint, data = null) =>
    fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : null,
    }).then((res) => (res.status === 204 ? res : res.json()));

const generateGame = () =>
    fetchAPI("generate_game")
        .then(() => (gameInitialized = true))
        .catch((e) => console.error("❌ Game Init Error:", e.message));

const converseWithCharacter = (characterIndex, query) =>
    fetchAPI("converse", { character_index: characterIndex, query })
        .then((data) => {
            if (data.query_successful) {
                console.log(`💬 ${data.response}`);
                updateGameState(characterIndex, query, data.response, data.questions_remaining);
            }
        })
        .catch((e) => console.error("❌ Query Error:", e.message));

const guessMurderer = (characterIndex) =>
    gameInitialized
        ? fetchAPI("guess", { character_index: characterIndex })
            .then((data) =>
                console.log(data.result ? `🎉 Correct! ${characterIndex} was the murderer!` : `❌ Wrong guess.`)
            )
            .catch((e) => console.error("❌ Guess Error:", e.message))
        : console.error("⚠️ Game not initialized.");

const updateGameState = (characterIndex, query, response, questionsLeft) => {
    conversationHistories[characterIndex] ||= [];
    conversationHistories[characterIndex].push({ role: "user", text: query });
    conversationHistories[characterIndex].push({ role: "character", text: response });
    questionsRemaining[characterIndex] = questionsLeft;
};
