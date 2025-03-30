import { useTabSelector } from './hooks';
import { TabProps } from './types';

const TabSelector = () => {
	const { tabs, currentTabIndex } = useTabSelector();
	return (
		<div className='w-full flex flex-row items-center justify-center gap-1'>
			{tabs.map((tab, index) => (
				<TabSelectorButton key={tab.id} {...tab} selected={currentTabIndex === index} />
			))}
		</div>
	);
};

const TabSelectorButton = ({ icon, label, onSelect, selected }: TabProps) => {
	return (
		<button
			className='cursor-pointer items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-lg px-2 py-1 grow bg-gray-700 block max-w-full'
			onClick={onSelect}
		>
			{label}
		</button>
	);
};
export { TabSelector, TabSelectorButton };
