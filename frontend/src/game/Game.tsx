import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { IoIosInformationCircle } from 'react-icons/io';
import { IoMdChatboxes } from 'react-icons/io';

import { TabSelector } from '@/components/TabSelector/component';
import { cn } from '@/utils/cn';

import { characterData, characters } from '@/constants';
import CharacterTab from '@/components/CharacterTab/component';
import { generateGame } from '@/backend/api';
import Modal from '@/components/Modal/component';
import Instructions from '@/components/Modal/Instructions';
import CaseFile from '@/components/Modal/CaseFile';

import { useGameStore } from './stores';
import Guess from '@/components/Modal/Guess';

export const DEBUG = true;

const useGame = () => {
	const loading = useGameStore((state) => state.loading);
	const isSceneMenu = useGameStore((state) => state.isSceneMenu);
	const setLoading = useGameStore.getState().setLoading;
	const setError = useGameStore.getState().setError;
	const gameOver = useGameStore((state) => state.gameOver);

	const setInitialGame = useGameStore.getState().setInitialGame;
	const hasCalledGenerateGame = useRef(false);
	useEffect(() => {
		const makeGame = async () => {
			setLoading(true);
			if (hasCalledGenerateGame.current) {
				return;
			}
			const result = await generateGame();
			hasCalledGenerateGame.current = true;
			if (!result.success) {
				setError('Failed to generate game. Please refresh the page or try again later.');
				return;
			}
			setInitialGame(result!.story, characterData);
		};
		makeGame();
	}, []);

	return {
		loading,
		isSceneMenu,
		gameOver,
	};
};

const Game = () => {
	const { isSceneMenu, gameOver } = useGame();
	const openModal = useGameStore((state) => state.openModal);

	const isGameOverAndModalClosed = gameOver && openModal === null;

	if (isSceneMenu || isGameOverAndModalClosed) {
		return <GameMenu />;
	}

	return <GameScene />;
};

const GameScene = () => {
	const { loading } = useGame();
	const currentOpenModal = useGameStore((state) => state.openModal);
	const setCurrentOpenModal = useGameStore.getState().setOpenModal;

	return (
		<div className='aspect-square flex flex-col flex-grow bg-gray-800 relative overflow-hidden h-[800px] border-dashed border-1 border-amber-800 shadow-xl mx-auto my-auto'>
			{/* Tabs */}
			{currentOpenModal === 'instructions' && (
				<Modal title='Instructions' buttonLabel='Next' onClose={() => setCurrentOpenModal('case')}>
					<Instructions />
				</Modal>
			)}
			{currentOpenModal === 'case' && (
				<Modal title='Case' buttonLabel='Start' onClose={() => setCurrentOpenModal(null)}>
					<CaseFile />
				</Modal>
			)}
			{currentOpenModal === 'guess' && (
				<Modal title='Submit your verdict!' buttonLabel='Return' onClose={() => setCurrentOpenModal(null)}>
					<Guess />
				</Modal>
			)}
			<div id='modal-root' />
			<div className='absolute top-[3rem] right-0 p-3 z-[50]  transition-transform flex flex-col gap-2'>
				<button className='hover:cursor-pointer hover:scale-110' onClick={() => setCurrentOpenModal('instructions')}>
					<IoIosInformationCircle size={20} />
				</button>
				<button className='hover:cursor-pointer hover:scale-110' onClick={() => setCurrentOpenModal('history')}>
					<IoMdChatboxes size={20} />
				</button>
			</div>
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
	const loading = useGameStore((state) => state.loading);
	const error = useGameStore((state) => state.error);
	const gameOver = useGameStore((state) => state.gameOver);
	return (
		<motion.div
			className='aspect-square flex h-full flex-col flex-grow bg-white relative overflow-hidden min-h-[800px] border-dashed border-1 border-white shadow-xl'
			initial={{ opacity: 1 }}
			animate={{
				opacity: error ? [1] : [1, 0.6, 1, 0.3, 1],
			}}
			transition={{
				duration: 0.6,
				repeat: Infinity,
				repeatDelay: 3,
				ease: 'easeInOut',
			}}
		>
			<GameBackdrop />
			<div className='flex flex-col justify-center items-center p-10 mt-[-1rem] h-full z-[50] gap-10'>
				<img src='/images/interface/logo.png' alt='Murder Mystery Logo' className='w-[300px] sepia-50' />
				{loading && error === null && !gameOver && <GameLoading />}
				{error && !gameOver && (
					<span className='text-4xl text-center text-amber-500 drop-shadow-lg max-w-[70%]'>{error}</span>
				)}
				{gameOver && (
					<span className='text-4xl text-center text-amber-500 drop-shadow-lg max-w-[70%]'>
						Play again by refreshing the page.
					</span>
				)}
			</div>
		</motion.div>
	);
};

const GameBackdrop = () => {
	return (
		<div className='w-full bg-white h-full overflow-hidden pointer-events-none absolute'>
			<img src='/images/backdrop.png' alt='Backdrop' className='w-full h-full object-cover pointer-events-none' />
		</div>
	);
};

const GameLoadingOverlay = ({ loading }: { loading: boolean }) => (
	<div className={cn('loading', loading && 'visible')}>
		<img src='/spinner.svg' alt='Loading...' width='150' height='150' />
	</div>
);

const GameLoading = () => {
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
		<p ref={ref} className='text-white text-6xl'>
			Loading...
		</p>
	);
};

export default Game;
