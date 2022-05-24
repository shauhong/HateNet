import { createContext, useState } from "react";

const CacheContext = createContext();

const CacheProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [project, setProject] = useState(null);
    const [tweets, setTweets] = useState({});
    const [timeline, setTimeline] = useState({});
    const [replies, setReplies] = useState({});
    const [blocks, setBlocks] = useState([]);
    const [next, setNext] = useState({
        timeline: {},
        tweets: {},
    });

    const clearCache = () => {
        setProject(null);
        setProjects([]);
        setTweets({});
        setTimeline({});
        setReplies({});
        setBlocks([]);
    }

    const value = { project, projects, tweets, timeline, blocks, next, replies, setProject, setProjects, setTweets, setTimeline, setNext, setBlocks, clearCache, setReplies }

    return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
}

export { CacheContext, CacheProvider };