import { useEffect, useRef, useState } from 'react';
import { IoMdArrowDropright } from 'react-icons/io';
import { GiRetroController } from 'react-icons/gi';
import { BsChatLeftTextFill } from 'react-icons/bs';
import { MdOutlineQuestionMark } from 'react-icons/md';

import { useGameStore } from '@/game/stores';
import { characters, charactersAssets } from '@/constants';
import { cn } from '@/utils/cn';
import Textbox from '../Textbox/component';
import Button from '../Button/component';
import { converseWithCharacter, Message } from '@/backend/api';
import { ModalPortal } from '../Modal/component';
import ChatHistory from '../Modal/ChatHistory';

type CharacterTabProps = {
	index: number;
	dead?: boolean;
};

function getLastCharacterMessage(chatHistory: Message[]) {
	for (let i = chatHistory.length - 1; i >= 0; i--) {
		if (chatHistory[i].role === 'model') {
			return chatHistory[i];
		}
	}
	return { role: '', text: '' };
}

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
	const [numQuestionsLeft, setNumQuestionsLeft] = useState(5);
	const noQuestionsLeft = numQuestionsLeft === 0;
	const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : { role: '', text: '' };
	const lastCharacterMessage = getLastCharacterMessage(chatHistory);
	const [didUserReadMessage, setDidUserReadMessage] = useState(false);
	const isInput = lastMessage.role === 'model' && didUserReadMessage && !noQuestionsLeft;

	const className = cn(
		'absolute inset-0 z-10 transition-opacity duration-500',
		dead ? 'animate-fade-out' : 'animate-fade-in',
		!visible && 'hidden'
	);

	const textboxClassname = cn(
		'w-[80%] mx-2 opacity-90 hover:mix-blend-normal focus:mix-blend-normal peer-focus:mix-blend-normal',
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
			setDidUserReadMessage(false);
			setChatHistory((prev) => {
				const updatedHistory = [
					...prev,
					{ role: 'user', text: inputValueCopy },
					{ role: 'model', text: result.response },
				];
				return updatedHistory;
			});
			setNumQuestionsLeft(result.questionsLeft);
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

	const openModal = useGameStore((state) => state.openModal);
	const setOpenModal = useGameStore.getState().setOpenModal;

	return (
		<div className={className}>
			{openModal === 'history' && currentTabIndex === index && (
				<ModalPortal title='Chat History' buttonLabel='Close' onClose={() => setOpenModal(null)}>
					<ChatHistory chatHistory={chatHistory} otherParty={characterName} />
				</ModalPortal>
			)}
			<audio src={audioSrc} loop ref={audioRef} />
			{audioOverlaySrc && <audio src={audioOverlaySrc} loop ref={audioOverlayRef} />}
			<img
				src={imageSrc}
				alt={`${characterName} ${dead ? 'dead' : 'idle'} animation`}
				className='w-full h-full object-cover select-none'
			/>
			<div className='absolute inset-0 flex items-end justify-start p-2 text-5xl leading-[0.6]'>
				<Textbox className={textboxClassname}>
					{isInput && (
						<>
							<textarea
								rows={1}
								autoFocus
								autoCorrect='off'
								autoCapitalize='off'
								spellCheck='false'
								className='w-full h-full bg-transparent placeholder-amber-950 focus:outline-none max-w-[80%]  overflow-auto p-2 pb-4'
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
							<WordStreamSpan
								className='max-w-[90%]  overflow-auto p-2 pb-4 scrollbar-hide select-none'
								visible={visible}
							>
								{noQuestionsLeft ? "I can't answer any more questions." : lastCharacterMessage?.text}
							</WordStreamSpan>
							<GiRetroController className='aspect-square absolute bottom-0 right-0 p-2' />
						</>
					)}
					<Button
						className='text-5xl absolute top-[-0.7rem] right-0 translate-x-[150%] w-fit aspect-video h-auto scale-[0.9]'
						aspect='square'
						onClick={() => {
							if (isInput) {
								sendMessage();
							} else {
								setDidUserReadMessage(true);
							}
						}}
					>
						{isInput ? (
							<IoMdArrowDropright
								className='aspect-square'
								style={{
									fill: '#403214',
								}}
							/>
						) : (
							<BsChatLeftTextFill
								className='aspect-square scale-40'
								style={{
									fill: '#403214',
								}}
							/>
						)}
					</Button>
					<Button
						className='text-5xl absolute top-[-0.7rem] right-0 translate-x-[250%] w-fit aspect-video h-auto scale-[0.9]'
						aspect='square'
						onClick={() => {
							setOpenModal('guess');
						}}
					>
						<MdOutlineQuestionMark className='aspect-square scale-70' />
					</Button>
					<span className='aspect-square absolute top-0 right-0 p-2 select-none'>{numQuestionsLeft}</span>
				</Textbox>
			</div>
		</div>
	);
};

const WordStreamSpan = ({
	children,
	visible,
	...props
}: { children: React.ReactNode; visible: boolean } & React.HTMLProps<HTMLSpanElement>) => {
	const text = typeof children === 'string' ? children : '';
	const words = text.split(' ');
	const [currentWord, setCurrentWord] = useState(0);
	const spanRef = useRef<HTMLSpanElement>(null);

	const openModal = useGameStore((state) => state.openModal);

	useEffect(() => {
		if (!visible || Boolean(openModal)) return;
		if (currentWord < words.length) {
			setTimeout(() => {
				setCurrentWord((prev) => prev + 1);
			}, 50 + Math.random() * 60);
		}
	}, [currentWord, words.length, visible, openModal]);

	useEffect(() => {
		if (spanRef.current) {
			spanRef.current.style.scrollBehavior = 'smooth';
			spanRef.current.scrollTop = spanRef.current.scrollHeight;
			spanRef.current.style.scrollBehavior = 'auto';
		}
	}, [currentWord]);

	return (
		<span {...props} ref={spanRef}>
			{words.slice(0, currentWord).join(' ')}
		</span>
	);
};

export default CharacterTab;
