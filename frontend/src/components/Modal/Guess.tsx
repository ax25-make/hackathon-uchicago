import { guessMurderer } from '@/backend/api';
import { characters, charactersAssets } from '@/constants';
import { useGameStore } from '@/game/stores';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const winMusicSrc = '/music/win.wav';
const loseMusicSrc = '/music/lose.wav';
const wrongMusicSrc = '/music/wrong.wav';

function WinScene() {
	useEffect(() => {
		// @ts-expect-error I don't care
		document.querySelectorAll('audio:not(#win)').forEach((e) => e.pause());
	}, []);

	return (
		<div className='w-full flex flex-col items-center'>
			<audio id='win' src={winMusicSrc} autoPlay loop />
			<h3 className='text-[200pt] font-bold select-none leading-[0.6] fade-in'>
				<RainbowWord>VICTORY!</RainbowWord>
			</h3>
			<p></p>
			<div className='pyro'>
				<div className='before'></div>
				<div className='after'></div>
			</div>
		</div>
	);
}

const satuaratedRetroColor = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];
function RainbowWord({ children }: { children: string | React.ReactNode }) {
	const [offset, setOffset] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setOffset((prev) => (prev + 1) % satuaratedRetroColor.length);
		}, 100);
		return () => clearInterval(interval);
	}, []);
	if (typeof children !== 'string') {
		return <>{children}</>;
	}
	const text = children as string;
	return (
		<>
			{text.split('').map((letter, index) => {
				const color = satuaratedRetroColor[(index + offset) % satuaratedRetroColor.length];
				return (
					<span key={index} style={{ color }}>
						{letter}
					</span>
				);
			})}
		</>
	);
}

function LoseScene() {
	useEffect(() => {
		// @ts-expect-error I don't care
		document.querySelectorAll('audio:not(#win)').forEach((e) => e.pause());
	}, []);

	return (
		<div className='w-full flex flex-col items-center'>
			<audio id='win' src={loseMusicSrc} autoPlay loop />
			<audio id='win' src={wrongMusicSrc} autoPlay />
			<h3 className='text-[200pt] font-bold select-none leading-[0.6] fade-in'>
				<RedFlashWord>WRONG!</RedFlashWord>
			</h3>
		</div>
	);
}

export function RedFlashWord({ children }: { children: string | React.ReactNode }) {
	return (
		<motion.span
			initial={{ opacity: 0.4 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: 1,
				repeat: Infinity,
				type: 'spring',
			}}
			className='text-red-900 font-bold text-[200pt] leading-[0.6] fade-in'
		>
			{children}
		</motion.span>
	);
}

export default function Guess() {
	const [gameOutcome, setGameOutcome] = useState(null);
	const setLoading = useGameStore.getState().setLoading;
	const setGameOver = useGameStore.getState().setGameOver;

	// Pause all audio when the user guesses
	if (gameOutcome === true) {
		return <WinScene />;
	} else if (gameOutcome === false) {
		return <LoseScene />;
	}

	return (
		<div className='w-full flex leading-[0.6] gap-3 flex-wrap relative'>
			{characters.map((characterName, index) => {
				const character = charactersAssets[characterName];
				// @ts-expect-error I don't care
				const onMouseOver = (e) => {
					e.currentTarget.src = character.deathSrc;
				};
				// @ts-expect-error I don't care
				const onMouseLeave = (e) => {
					e.currentTarget.src = character.idleSrc;
				};
				const onClick = async () => {
					setLoading(true);
					const result = await guessMurderer(index);
					if (result.success) {
						setGameOutcome(result.correct);
						setGameOver(true);
					}
					setLoading(false);
				};
				return (
					<button onClick={onClick} key={index} className='flex flex-col items-center hover:opacity-90'>
						<img
							src={character.idleSrc}
							alt={character.name}
							className='w-[200px] h-[200px] object-cover'
							onMouseOver={onMouseOver}
							onMouseLeave={onMouseLeave}
							onClick={onClick}
						/>
					</button>
				);
			})}
		</div>
	);
}
