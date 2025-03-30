import { createPortal } from 'react-dom';
import Button from '../Button/component';
const modalBackdropSrc = '/images/interface/modal.png';

type ModalProps = {
	onClose: () => void;
	buttonLabel?: string;
	children: React.ReactNode;
	title?: string;
};
const Modal = (props: ModalProps) => {
	const { onClose, buttonLabel, children, title } = props;
	return (
		<div
			className='aspect-square fixed z-[1000] h-full p-5 text-4xl fade-in slide-in'
			style={{ backgroundColor: 'rgba(50, 20, 20, 0.4)', color: '#403214' }}
		>
			<div
				className='flex flex-col items-center h-full bg-cover'
				style={{
					backgroundImage: `url(${modalBackdropSrc})`,
				}}
			>
				<div className='flex flex-col justify-around items-center w-full h-full p-10 gap-3'>
					<h2 className='text-[60pt] select-none leading-[0.7]'>{title}</h2>
					<div className='max-h-[90%] overflow-auto w-[100%]'>{children}</div>
					<Button className='text-[40pt] w-[30%] h-fit' aspect='regular' onClick={onClose}>
						{buttonLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};

export const ModalPortal = (props: React.PropsWithChildren<ModalProps>) => {
	return createPortal(<Modal {...props} />, document.getElementById('modal-root') as HTMLElement);
};

export default Modal;
