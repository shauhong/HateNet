import { useContext } from "react";
import { CacheContext } from "../contexts/CacheContext";

const useCache = () => {
    const context = useContext(CacheContext);

    if (!context) {
        throw new Error("useCache is used out of scope of provider");
    }

    return context;
}

export default useCache;