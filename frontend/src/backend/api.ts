// const BASE_URL = "http://127.0.0.1:5005";
const BASE_URL = 'https://eacfa2dc9071.ngrok.app';
export type Message = { role: string; text: string };
const defaultQuestionsLeft = 5;
const conversationHistories = Array.from({ length: 5 }, () => [] as Message[]),
	questionsRemaining = Array.from({ length: 5 }, () => defaultQuestionsLeft);
let gameInitialized = false;

const fetchAPI = (endpoint: string, data: object = {}) =>
	fetch(`${BASE_URL}/${endpoint}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: data ? JSON.stringify(data) : null,
	}).then((res) => (res.status === 204 ? res : res.json()));

// const generateGame = () =>
//     fetchAPI("generate_game")
//         .then(() => (gameInitialized = true))
//         .catch((e) => console.error("❌ Game Init Error:", e.message));

export const generateGame = async () => {
	try {
		const data = await fetchAPI('generate_game');
		gameInitialized = true;
		return { success: true, story: data.story };
	} catch (e) {
		// @ts-expect-error I don't care
		console.error('❌ Game Init Error:', e.message);
		// @ts-expect-error I don't care
		return { success: false, error: e.message };
	}
};

// const converseWithCharacter = (characterIndex: number, query: string) =>
// 	fetchAPI('converse', { character_index: characterIndex, query })
// 		.then((data) => {
// 			if (data.query_successful) {
// 				console.log(`💬 ${data.response}`);
// 				updateGameState(characterIndex, query, data.response, data.questions_remaining);
// 			}
// 		})
// 		.catch((e) => console.error('❌ Query Error:', e.message));

export const converseWithCharacter = async (characterIndex: number, query: string) => {
	try {
		const data = await fetchAPI('converse', { character_index: characterIndex, query });
		if (data.query_successful) {
			return { success: true, response: data.response, questionsLeft: data.questions_remaining };
		} else {
			return { success: false, error: 'Query unsuccessful' };
		}
	} catch (e) {
		// @ts-expect-error I don't care
		console.error('❌ Query Error:', e.message);
		// @ts-expect-error I don't care
		return { success: false, error: e.message };
	}
};

export const guessMurderer = async (characterIndex: number) => {
	if (!gameInitialized) {
		const error = '⚠️ Game not initialized.';
		console.error(error);
		return { success: false, error };
	}

	try {
		const data = await fetchAPI('guess', { character_index: characterIndex });
		return {
			success: true,
			correct: data.result,
			message: data.result ? `🎉 Correct! ${characterIndex} was the murderer!` : `❌ Wrong guess.`,
		};
	} catch (e) {
		// @ts-expect-error I don't care
		console.error('❌ Guess Error:', e.message);
		// @ts-expect-error I don't care
		return { success: false, error: e.message };
	}
};

// const guessMurderer = (characterIndex) =>
// 	gameInitialized
// 		? fetchAPI('guess', { character_index: characterIndex })
// 				.then((data) =>
// 					console.log(data.result ? `🎉 Correct! ${characterIndex} was the murderer!` : `❌ Wrong guess.`)
// 				)
// 				.catch((e) => console.error('❌ Guess Error:', e.message))
// 		: console.error('⚠️ Game not initialized.');

export const updateGameState = (characterIndex: number, query: string, response: string, questionsLeft: number) => {
	conversationHistories[characterIndex] ||= [];
	conversationHistories[characterIndex].push({ role: 'user', text: query });
	conversationHistories[characterIndex].push({ role: 'character', text: response });
	questionsRemaining[characterIndex] = questionsLeft;
};
