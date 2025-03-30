import Button from '../Button/component';
import { useTabSelector } from './hooks';
import { TabProps } from './types';

const TabSelector = () => {
	const { tabs, currentTabIndex } = useTabSelector();
	return (
		<div className='w-full grid grid-cols-5 gap-2 absolute top-0 left-0 z-[20] p-2'>
			{tabs.map((tab, index) => (
				<TabSelectorButton key={tab.id} {...tab} selected={currentTabIndex === index} />
			))}
		</div>
	);
};

const TabSelectorButton = ({ label, onSelect, selected }: TabProps) => {
	return (
		<Button className={selected ? 'sepia-100' : 'sepia-0'} onClick={onSelect}>
			<span className='cursor-pointer items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-3xl px-2 py-1 max-w-full'>
				{label}
			</span>
		</Button>
	);
};
export { TabSelector, TabSelectorButton };
