import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Post, PostSkeleton } from '../components';
import { useData, useProject } from "../hooks";

const Timeline = () => {
    const [page, setPage] = useState(1);
    const [last, setLast] = useState(false);
    const { username } = useParams();
    const { project } = useProject();
    const { loading, timeline, fetchTimeline } = useData();
    const observer = useRef(null);
    const containerRef = useRef(null);

    const targetRef = useCallback(node => {
        if (loading.timeline) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                if (!last) {
                    setPage(page => page + 1);
                }
            }
        });
        if (node) observer.current.observe(node);
    }, [loading.timeline]);

    useEffect(() => {
        setPage(timeline[username] ? Math.max(Math.ceil(timeline[username].tweets.length / 25), 1) : 1);
        setLast(false);
        restore();
    }, [username]);

    useEffect(() => {
        if (!last) {
            fetchPage(page);
        }
    }, [page, last]);

    const fetchPage = async (page) => {
        const next = await fetchTimeline(project.name, username, page, 25);
        if (next !== undefined) {
            setLast(!next);
        }
    }

    const store = () => {
        window.history.pushState({ position: containerRef.current.scrollTop }, "");
    }

    const restore = () => {
        const position = window.history.state.position ? window.history.state.position : 0;
        containerRef.current.scrollTo(0, position);
    }

    const scrollToTop = () => {
        containerRef.current.scrollTo(0, 0);
    }

    return (
        <div className="h-screen overflow-hidden hover:overflow-auto scrollbar-gutter flex flex-col gap-y-4 pb-4" ref={containerRef}>
            <button className="absolute bottom-8 right-8 group" onClick={scrollToTop}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 stroke-gray-500 group-hover:stroke-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
            </button>
            {
                project && timeline[username] && timeline[username].tweets.map((tweet, index) => {
                    if (index === timeline[username].tweets.length - 1) {
                        return (
                            <div ref={targetRef} key={index}>
                                <Post tweet={tweet} clickable={true} hoverable={true} store={store} />
                            </div>
                        );
                    }
                    return (
                        <Post tweet={tweet} clickable={true} hoverable={true} store={store} key={index} toggable={true} />
                    );
                })
            }
            {
                loading.timeline && [...Array(3)].map((element, index) => <PostSkeleton loading={true} even={index % 2 === 0} key={index} />)
            }
        </div>
    );
}

export default Timeline;