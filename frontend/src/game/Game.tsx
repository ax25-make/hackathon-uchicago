import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { TabSelector } from '@/components/TabSelector/component';
import { cn } from '@/utils/cn';

import { useGameStore } from './stores';
import { characterData, characters } from '@/constants';
import CharacterTab from '@/components/CharacterTab/component';

export const DEBUG = true;

const useGame = () => {
	const initialized = useGameStore((state) => state.initialized);
	const loading = useGameStore((state) => state.loading);
	const isSceneMenu = useGameStore((state) => state.isSceneMenu);

	const setInitialGame = useGameStore.getState().setInitialGame;
	useEffect(() => {
		if (DEBUG) {
			setInitialGame(
				{
					setting: 'A dark and stormy night',
					color: '#c0ffee',
				},
				{
					backstory: 'A brave hero',
					objective: 'Save the world',
					facts: [],
					keys: [],
					inventory: [],
				},
				characterData
			);
		}
	}, []);

	return {
		initialized,
		loading,
		isSceneMenu,
	};
};

const Game = () => {
	const { initialized, loading, isSceneMenu } = useGame();
	if (!initialized) {
		return <GameInitializing />;
	}

	if (isSceneMenu) {
		return <GameMenu />;
	}

	return (
		<div className='aspect-square flex h-full flex-col flex-grow bg-gray-800 relative overflow-hidden min-h-[800px]'>
			{/* Tabs */}
			<GameLoadingOverlay loading={loading} />
			<TabSelector />
			{characters.map((character, index) => (
				<CharacterTab key={character} index={index} />
			))}
			<div className='absolute inset-0 z-10 glitch pointer-events-none' />
			<img
				src='/images/interface/logo.png'
				alt='Murder Mystery Logo'
				className='absolute right-0 bottom-0 p-2 z-[30] max-w-[19%] grayscale-animation'
			/>
		</div>
	);
};

const GameMenu = () => {
	return (
		<>
			<GameBackdrop />
		</>
	);
};

const GameBackdrop = () => {
	return (
		<div className='w-full bg-white h-full overflow-hidden pointer-events-none absolute'>
			<motion.img
				src='/images/backdrop.png'
				alt='Backdrop'
				className='w-full h-full object-cover pointer-events-none'
				initial={{ opacity: 1 }}
				animate={{
					opacity: [1, 0.6, 1, 0.3, 1],
				}}
				transition={{
					duration: 0.6,
					repeat: Infinity,
					repeatDelay: 3,
					ease: 'easeInOut',
				}}
			/>
		</div>
	);
};

const GameLoadingOverlay = ({ loading }: { loading: boolean }) => (
	<div className={cn('loading', loading && 'visible')}>
		<img src='/spinner.svg' alt='Loading...' width='150' height='150' />
	</div>
);

const GameInitializing = () => {
	const ref = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const loadingFrames = ['Loading', 'Loading.', 'Loading..', 'Loading...'];
		let index = 0;
		const interval = setInterval(() => {
			if (ref.current) {
				ref.current.innerText = loadingFrames[index];
				index = (index + 1) % loadingFrames.length;
			}
		}, 500);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className='flex flex-col items-center justify-center h-full'>
			<p ref={ref} className='text-white text-lg'>
				Loading...
			</p>
		</div>
	);
};

export default Game;
