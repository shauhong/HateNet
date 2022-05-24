import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Post, PostSkeleton } from "../components";
import { useData, useProject } from "../hooks";

const Thread = () => {
    const [page, setPage] = useState(1);
    const [last, setLast] = useState(false);
    const containerRef = useRef(null);
    const observer = useRef(null);
    const { loading, replies, fetchReplies, timeline } = useData();
    const { username, id } = useParams();
    const { project } = useProject();
    const tweet = timeline[username].find(tweet => tweet.tweet_id === id);

    const targetRef = useCallback(node => {
        if (loading.replies) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                if (!last) setPage(page => page + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading.replies]);

    useEffect(() => {
        setPage(replies[id] ? Math.max(Math.ceil(replies[id].length / 25), 1) : 1);
        setLast(false);
    }, [username, id]);

    useEffect(() => {
        fetchPage(page);
    }, [page]);

    const fetchPage = async (page) => {
        const next = await fetchReplies(project.name, id, page, 25);
        if (next !== undefined) {
            setLast(!next);
        }
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
            <Post tweet={tweet} />
            <hr />
            {
                replies[id] && replies[id].map((reply, index) => {
                    if (index === replies[id].length - 1) {
                        return (
                            <div ref={targetRef} key={reply._id.$oid}>
                                <Post tweet={reply} hoverable={false} toggable={true} />
                            </div>
                        );
                    }
                    return <Post tweet={reply} hoverable={false} toggable={false} reply={true} />
                })

            }
            {
                loading.replies && [...Array(3)].map((element, index) => <PostSkeleton loading={true} even={index % 2 === 0} />)
            }
        </div>
    );
}

export default Thread;