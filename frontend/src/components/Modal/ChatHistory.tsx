import { Message } from '@/backend/api';

export default function ChatHistory({ chatHistory, otherParty }: { chatHistory: Message[]; otherParty: string }) {
	return (
		<div className='w-full flex flex-col leading-[0.6] gap-3 min-h-[400px]'>
			{chatHistory.map((message, index) => {
				const isUser = message.role === 'user';
				const partyName = isUser ? '' : otherParty + ': ';
				return (
					<div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
						<span className={`text-2xl p-2 rounded-lg ${isUser ? 'text-gray-800' : ' text-black'}`}>
							{partyName}
							{message.text}
						</span>
					</div>
				);
			})}
		</div>
	);
}
