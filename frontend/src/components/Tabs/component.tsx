import { TabProps, TabsProps } from './types';

const TabSelector = ({ tabs, selectedIndex }: TabsProps) => {
	return (
		<div className='w-full flex flex-row items-center justify-center'>
			{tabs.map((tab, index) => (
				<TabSelectorButton
					key={tab.id}
					id={tab.id}
					icon={tab.icon}
					label={tab.label}
					onSelect={tab.onSelect}
					selected={selectedIndex === index}
				/>
			))}
		</div>
	);
};

const TabSelectorButton = ({ icon, label, onSelect }: TabProps) => {
	return (
		<button className='aspect-square cursor-pointer flex flex-col items-center justify-center' onClick={onSelect}>
			{icon}
			<span className='text-sm text-gray-300'>{label}</span>
		</button>
	);
};
export { TabSelector, TabSelectorButton };
