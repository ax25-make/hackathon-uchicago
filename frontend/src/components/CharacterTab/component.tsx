import { useEffect, useRef } from 'react';
import { IoMdArrowDropright } from 'react-icons/io';
import { GiRetroController } from 'react-icons/gi';

import { useGameStore } from '@/game/stores';
import { characters, charactersAssets } from '@/constants';
import { cn } from '@/utils/cn';
import Textbox from '../Textbox/component';
import Button from '../Button/component';

type CharacterTabProps = {
	index: number;
	dead?: boolean;
};

const CharacterTab = (props: CharacterTabProps) => {
	const { index, dead } = props;
	const characterName = characters[index];
	const assets = charactersAssets[characterName];

	const currentTabIndex = useGameStore((state) => state.currentTabIndex);
	const visible = currentTabIndex === index;
	const imageSrc = dead ? assets.deathSrc : assets.idleSrc;

	const audioSrc = assets.musicSrc;
	const audioOverlaySrc = assets.musicOverlaySrc;
	const audioRef = useRef<HTMLAudioElement>(null);
	const audioOverlayRef = useRef<HTMLAudioElement>(null);
	const audioStartTime = assets.musicStartTime; // first tim

	const className = cn(
		'absolute inset-0 z-10 transition-opacity duration-500',
		dead ? 'animate-fade-out' : 'animate-fade-in',
		!visible && 'hidden'
	);

	const firstPlay = useRef(true);
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
	}, [visible, audioRef, audioOverlayRef]);

	// fake
	const isInput = false;
	const messages = ['You are a brave hero!', 'You have a quest to complete.', 'Your journey begins now.'];
	const lastMessage = messages.length > 0 ? messages[messages.length - 1] : '';
	const textboxClassname = cn(
		'w-[80%] mx-2  mix-blend-screen  hover:mix-blend-normal focus:mix-blend-normal peer-focus:mix-blend-normal',
		!isInput && 'scrollbar-hide'
	);

	return (
		<div className={className}>
			<audio src={audioSrc} loop ref={audioRef} />
			{audioOverlaySrc && <audio src={audioOverlaySrc} loop ref={audioOverlayRef} />}
			<img
				src={imageSrc}
				alt={`${characterName} ${dead ? 'dead' : 'idle'} animation`}
				className='w-full h-full object-cover'
			/>
			<div className='absolute inset-0 flex items-end justify-start p-2 text-5xl'>
				<Textbox className={textboxClassname}>
					{isInput && (
						<>
							<textarea
								rows={1}
								autoFocus
								autoCorrect='off'
								autoCapitalize='off'
								spellCheck='false'
								className='w-full h-full bg-transparent placeholder-amber-950 focus:outline-none'
								placeholder='Type your message...'
							/>
						</>
					)}
					{!isInput && (
						<>
							<span>{lastMessage}</span>
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
