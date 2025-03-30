import { useMemo } from 'react';

import { useGameStore } from '@/game/stores';

import { TabProps } from './types';
import { getIcon } from './utils';

export function useTabSelector() {
	const setCurrentTabIndex = useGameStore.getState().setCurrentTabIndex;
	const tabs = useGameStore((state) => state.tabs);
	const currentTabIndex = useGameStore((state) => state.currentTabIndex);

	const uiTabs = useMemo<Omit<TabProps, 'selected'>[]>(() => {
		return tabs.map((tab, index) => ({
			id: tab.character.name,
			label: tab.character.name,
			icon: getIcon(tab.character.icon),
			onSelect: () => setCurrentTabIndex(index),
		}));
	}, [tabs]);

	return {
		tabs: uiTabs,
		currentTabIndex,
	};
}
