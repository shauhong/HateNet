import { useGlobal } from '../hooks';

const Modal = () => {
    const { modal, content } = useGlobal();

    return (
        <>
            {
                modal &&
                <div className="fixed inset-0 z-40 bg-gray-500 bg-opacity-50 overflow-y-auto overflow-x-hidden flex justify-center items-center">
                    {content}
                </div>
            }
        </>
    );
}

export default Modal;