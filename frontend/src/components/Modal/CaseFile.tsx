import { useGameStore } from '@/game/stores';

export default function CaseFile() {
	const story = useGameStore((state) => state.story);
	return (
		<div className='w-full flex flex-col leading-[0.6] gap-3'>
			{story
				.replace(/“/g, '"')
				.replace(/”/g, '"')
				.split('\n')
				.map((line, index) => (
					<p key={index}>{line}</p>
				))}
		</div>
	);
}
