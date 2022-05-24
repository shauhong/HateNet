import { useContext } from 'react';
import { GlobalContext } from '../contexts/GlobalContext';

const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobal is used out of scope of provider");
    }
    return context;
}

export default useGlobal;