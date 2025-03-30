import { characters, charactersAssets } from '@/constants';
import { useGameStore } from '@/game/stores';
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

	const className = cn(
		'absolute inset-0 z-10 transition-opacity duration-500',
		dead ? 'animate-fade-out' : 'animate-fade-in',
		!visible && 'hidden'
	);

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
							<Button className='text-5xl absolute top-[-1.3rem] right-0 translate-x-[120%] w-fit aspect-video h-[50%] px-8 pb-3'>
								Send.
							</Button>
						</>
					)}
					{!isInput && (
						<>
							<span>{lastMessage}</span>
							<Button className='text-5xl absolute top-[-1.3rem] right-0 translate-x-[120%] w-fit aspect-video h-[50%] px-8 pb-3'>
								Okay.
							</Button>
						</>
					)}
				</Textbox>
			</div>
		</div>
	);
};

export default CharacterTab;
