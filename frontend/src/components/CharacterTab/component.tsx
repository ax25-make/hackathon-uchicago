import { useEffect, useRef, useState } from 'react';
import { IoMdArrowDropright } from 'react-icons/io';
import { GiRetroController } from 'react-icons/gi';

import { useGameStore } from '@/game/stores';
import { characters, charactersAssets } from '@/constants';
import { cn } from '@/utils/cn';
import Textbox from '../Textbox/component';
import Button from '../Button/component';
import { converseWithCharacter, Message } from '@/backend/api';

type CharacterTabProps = {
	index: number;
	dead?: boolean;
};

const CharacterTab = (props: CharacterTabProps) => {
	const { index, dead } = props;
	const characterName = characters[index];
	const assets = charactersAssets[characterName];

	const firstPlay = useRef(true);

	const currentTabIndex = useGameStore((state) => state.currentTabIndex);
	const visible = currentTabIndex === index;
	const imageSrc = dead ? assets.deathSrc : assets.idleSrc;

	const audioSrc = assets.musicSrc;
	const audioOverlaySrc = assets.musicOverlaySrc;
	const audioRef = useRef<HTMLAudioElement>(null);
	const audioOverlayRef = useRef<HTMLAudioElement>(null);
	const audioStartTime = assets.musicStartTime; // first time

	const [input, setInput] = useState('');
	const [chatHistory, setChatHistory] = useState<Message[]>([{ role: 'model', text: assets.startMessage }]);
	const [noQuestionsLeft, setNoQuestionsLeft] = useState(false);
	const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : { role: '', text: '' };
	const lastCharacterMessage = chatHistory.reverse().find((message) => message.role === 'model');
	const isInput = lastMessage.role !== 'model';

	const className = cn(
		'absolute inset-0 z-10 transition-opacity duration-500',
		dead ? 'animate-fade-out' : 'animate-fade-in',
		!visible && 'hidden'
	);

	const textboxClassname = cn(
		'w-[80%] mx-2  mix-blend-screen  hover:mix-blend-normal focus:mix-blend-normal peer-focus:mix-blend-normal',
		!isInput && 'scrollbar-hide'
	);

	const setLoading = useGameStore.getState().setLoading;

	async function sendMessage() {
		setLoading(true);
		if (input.trim() === '') {
			return;
		}
		const inputValueCopy = input.trim();
		const result = await converseWithCharacter(index, inputValueCopy);
		if (result.success) {
			setInput('');
			setChatHistory((prev) => [
				...prev,
				{ role: 'user', text: inputValueCopy },
				{ role: 'model', text: result.response },
			]);
			if (result.questionsLeft === 0) {
				setNoQuestionsLeft(true);
			}
		} else {
			console.error('Error sending message:', result.error);
		}
		setLoading(false);
	}

	useEffect(() => {
		if (visible && audioRef.current) {
			audioRef.current.volume = 1.0;
			if (firstPlay.current) {
				audioRef.current.currentTime = audioStartTime;
				firstPlay.current = false;
			}
			audioRef.current.play();
			if (audioOverlayRef.current) {
				audioOverlayRef.current.play();
				audioOverlayRef.current.volume = 0.1;
			}
		}
		const onUserFirstInteraction = () => {
			// @ts-expect-error I don't care
			if (window.firstInteraction) {
				return;
			}
			// @ts-expect-error I don't care
			window.firstInteraction = true;
			if (audioRef.current && visible) {
				audioRef.current.play();
				audioOverlayRef.current?.play();
			}
		};
		document.addEventListener('click', onUserFirstInteraction);
		document.addEventListener('touchstart', onUserFirstInteraction);

		const effectAudioRef = audioRef.current;
		const effectAudioOverlayRef = audioOverlayRef.current;

		return () => {
			effectAudioRef?.pause();
			effectAudioOverlayRef?.pause();

			document.removeEventListener('click', onUserFirstInteraction);
			document.removeEventListener('touchstart', onUserFirstInteraction);
		};
	}, [visible, audioRef, audioOverlayRef, audioStartTime]);

	return (
		<div className={className}>
			<audio src={audioSrc} loop ref={audioRef} />
			{audioOverlaySrc && <audio src={audioOverlaySrc} loop ref={audioOverlayRef} />}
			<img
				src={imageSrc}
				alt={`${characterName} ${dead ? 'dead' : 'idle'} animation`}
				className='w-full h-full object-cover'
			/>
			<div className='absolute inset-0 flex items-end justify-start p-2 text-5xl leading-[0.7]'>
				<Textbox className={textboxClassname}>
					{isInput && (
						<>
							<textarea
								rows={1}
								autoFocus
								autoCorrect='off'
								autoCapitalize='off'
								spellCheck='false'
								className='w-full h-full bg-transparent placeholder-amber-950 focus:outline-none max-w-[80%]  overflow-auto'
								placeholder='Type your message...'
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										sendMessage();
									}
									if (e.key === 'Escape') {
										setInput('');
									}
								}}
							/>
						</>
					)}
					{!isInput && (
						<>
							<span className='max-w-[90%]  overflow-auto'>{lastCharacterMessage?.text}</span>
							<GiRetroController className='aspect-square absolute bottom-0 right-0 p-2' />
						</>
					)}
					<Button
						className='text-5xl absolute top-[-0.7rem] right-0 translate-x-[150%] w-fit aspect-video h-auto scale-[0.9]'
						aspect='square'
					>
						<IoMdArrowDropright className='aspect-square' />
					</Button>
				</Textbox>
			</div>
		</div>
	);
};

export default CharacterTab;
