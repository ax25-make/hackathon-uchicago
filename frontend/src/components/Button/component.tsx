import { useRef } from 'react';
import { cn } from '@/utils/cn';

const stylizedButtonBackdrops = {
	square: '/images/interface/button-square.png',
	regular: '/images/interface/button-regular.png',
	wide: '/images/interface/button-wide.png',
};

type ButtonProps = {
	children: React.ReactNode;
	aspect?: 'regular' | 'square' | 'wide';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, ...props }: ButtonProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null);

	const className = cn(
		'relative w-full h-full bg-no-repeat bg-center bg-contain cursor-pointer',
		'hover:sepia-50 active:bg-opacity-60 hover:scale-[1.05] transition-all duration-200',
		'text-2xl font-bold text-center',
		props.className
	);

	const backdropSrc = stylizedButtonBackdrops[props.aspect || 'wide'];

	return (
		<button
			ref={buttonRef}
			style={{
				backgroundImage: `url(${backdropSrc})`,
				color: '#403214',
			}}
			{...props}
			className={className}
		>
			{children}
		</button>
	);
};

export default Button;
