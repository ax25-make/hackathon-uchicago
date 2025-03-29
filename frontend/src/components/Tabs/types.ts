export interface TabProps {
	id: string;
	icon: React.ReactNode;
	label: string;
	onSelect: () => void;
	selected: boolean;
}
export interface TabsProps {
	tabs: Omit<TabProps, 'selected'>[];
	selectedIndex: number;
}
