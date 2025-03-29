import { useGameStore } from './stores';
import { useMemo } from 'react';

const useGame = () => {
	const { tabs, currentTabIndex, setCurrentTabIndex } = useGameStore((state) => ({
		tabs: state.tabs,
		currentTabIndex: state.currentTabIndex,
		setCurrentTabIndex: state.setCurrentTabIndex,
	}));

	const uiTabsMemo = useMemo(() => {
		return tabs.map((tab) => ({
			...tab,
			icon: tab.character.icon,
			label: tab.character.name,
		}));
	}, [tabs]);

	const tab = tabs.length > 0 ? tabs[currentTabIndex] : null;
	const character = tab ? tab.character : null;
	const dialogue = tab ? tab.dialogue : null;
	const history = dialogue ? dialogue.history : [];
	const color = tab ? tab.dialogue.color : '';
	const music = tab ? tab.dialogue.music : [];

	return { tabs: uiTabsMemo, tab, character, dialogue, history, color, music };
};

const Game = () => {
	const tabsMemoized;
	return (
		<div className='aspect-square flex-grow bg-gray-800'>
			{/* Tabs */}
			<Tabs
				tabs={tabs.map((tab, index) => ({
					id: tab.character.name,
					icon: <img src={tab.character.icon} alt={tab.character.name} className='w-10 h-10' />,
					label: tab.character.name,
					onSelect: () => setCurrentTabIndex(index),
				}))}
			/>
		</div>
	);
};

export default Game;
