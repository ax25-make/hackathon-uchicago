import { cn } from '@/utils/cn';

const textboxBackdrop = '/images/interface/textbox.png';
const nameBackdrop = '/images/interface/namebox.png';

type TextboxProps = {
	children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;
const Textbox = (props: TextboxProps) => {
	const className = cn('flex', props.className);
	return (
		<div
			className={className}
			style={{
				color: '#403214',
			}}
		>
			<div className='relative'>
				<img src={textboxBackdrop} alt='Textbox' className='object-contain' />
				<div className='absolute inset-x-5 inset-x-end-3 inset-y-2 flex'>{props.children}</div>
			</div>
		</div>
	);
};

export default Textbox;
