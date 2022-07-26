import { useState } from "react";
import { parseTime } from '../utils';
import { useCache, useGlobal } from '../hooks';

const useData = () => {
    const [data, setData] = useState({});
    const [aggregate, setAggregate] = useState({});
    const [TFIDF, setTFIDF] = useState({});
    const [monitor, setMonitor] = useState({});
    const [progress, setProgress] = useState({});
    const { tweets, timeline, blocks, next, replies, setTimeline, setBlocks, setReplies } = useCache();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState({
        aggregate: false,
        data: false,
        monitor: false,
        timeline: false,
        progress: false,
        tweets: false,
        user: false,
        replies: false,
        term: false,
        explain: false,
    });
    const { openToast } = useGlobal();

    const fetchData = async (project) => {
        if (!data.hasOwnProperty(project)) {
            try {
                const response = await fetch(`/data/${encodeURIComponent(project)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const json = await response.json();
                data[project] = parseData(json);
                setData({ ...data });
            } catch (error) {
                const message = {
                    type: 'fail',
                    content: 'Failed to fetch tweets'
                };
                openToast(message);
            }
        }
    };

    const fetchAggregate = async (project, kind) => {
        if (!aggregate.hasOwnProperty(project)) {
            try {
                setLoading({ ...loading, aggregate: true });
                const response = await fetch(`/data/${encodeURIComponent(project)}/aggregate?` + new URLSearchParams({ kind }));
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setLoading({ ...loading, aggregate: false });
                if (!aggregate.hasOwnProperty(project)) {
                    aggregate[project] = {};
                }
                aggregate[project][kind] = data;
                setAggregate({ ...aggregate });
            } catch (error) {
                const message = {
                    type: 'fail',
                    content: 'Failed to fetch aggregate'
                };
                openToast(message);
            } finally {
                setLoading({ ...loading, aggregate: false });
            }
        }
    }

    const fetchMonitor = async (project, username) => {
        if (!monitor.hasOwnProperty(project) || !monitor[project].hasOwnProperty(username)) {
            try {
                const response = await fetch(`/data/${encodeURIComponent(project)}/recent/${encodeURIComponent(username)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const json = await response.json()
                if (!monitor.hasOwnProperty(project)) {
                    monitor[project] = {};
                }
                monitor[project][username] = json;
                setMonitor({ ...monitor });
            } catch (error) {
                const message = {
                    type: 'fail',
                    content: 'Failed to fetch monitored user'
                };
                openToast(message);
            }
        }
    }

    const fetchUser = async (username) => {
        try {
            const response = await fetch(`/data/user/${username}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const user = await response.json();
            setUser(user);
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to fetch user'
            }
            openToast(message);
        }
    }

    const fetchProgress = async (project) => {
        try {
            const response = await fetch(`/data/${project}/progress`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            progress[project] = data;
            setProgress({ ...progress })
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to fetch progress'
            };
            openToast(message);
        }
    }

    const fetchTweets = async (project, sort, term, status, page, results, scope) => {
        try {
            setLoading({ ...loading, tweets: true });
            const params = new URLSearchParams({ page, results, scope });
            if (term !== "") {
                params.set('term', term);
            }
            if (sort) {
                params.set('sort', sort);
            }
            if (status) {
                params.set('status', status);
            }
            const response = await fetch(`/data/${project}/tweets?` + params);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let { tweets, next, total } = await response.json();
            setLoading({ ...loading, tweets: false });
            tweets = tweets.map(tweet => parseTweet(tweet));
            return { tweets, next, total };
        } catch (error) {
            const message = {
                type: 'fail',
                content: "Failed to fetch tweets"
            };
            openToast(message);
        } finally {
            setLoading({ ...loading, tweets: false });
        }
    }

    const fetchTimeline = async (project, username, page, results) => {
        if (!timeline.hasOwnProperty(username) || timeline[username].next) {
            try {
                setLoading({ ...loading, timeline: true });
                const response = await fetch(`/data/${encodeURIComponent(project)}/${encodeURIComponent(username)}/timeline?` + new URLSearchParams({ page, results }));
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const { tweets, next } = await response.json();
                setLoading({ ...loading, timeline: false });
                const parsed = tweets.map(tweet => parseTweet(tweet));
                if (!timeline.hasOwnProperty(username)) {
                    timeline[username] = {
                        tweets: [],
                        next: true
                    }
                }
                timeline[username].tweets = timeline[username].tweets.concat(parsed);
                timeline[username].next = next;
                setTimeline({ ...timeline });
                return next;
            } catch (error) {
                const message = {
                    type: 'fail',
                    content: 'Failed to fetch timeline'
                };
                openToast(message);
            } finally {
                setLoading({ ...loading, timeline: false });
            }
        }
    }

    const fetchReplies = async (project, id, page, results) => {
        // if (!replies.hasOwnProperty(id) || replies[id].length < page * results) {
        if (!replies.hasOwnProperty(id) || replies[id].next) {
            try {
                setLoading({ ...loading, replies: true });
                const response = await fetch(`/data/${encodeURIComponent(project)}/replies/${encodeURIComponent(id)}?` + new URLSearchParams({ page, results }));
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const { tweets, next } = await response.json();
                setLoading({ ...loading, replies: false });
                const parsed = tweets.map(tweet => parseTweet(tweet));

                if (!replies.hasOwnProperty(id)) {
                    replies[id] = {
                        tweets: [],
                        next: true
                    }
                }

                replies[id].tweets = replies[id].tweets.concat(parsed);
                replies[id].next = next;


                // if (id in replies) {
                //     replies[id] = replies[id].concat(parsed);
                // } else {
                //     replies[id] = parsed;
                // }
                setReplies({ ...replies });
                return next;
            } catch (error) {
                const message = {
                    type: "fail",
                    content: "Failed to fetch replies"
                }
                openToast(message);
            } finally {
                setLoading({ ...loading, replies: false });
            }
        }
    }

    const fetchReport = async (page, results, asc) => {
        try {
            setLoading({ ...loading, tweets: true });
            const params = new URLSearchParams({ page, results, asc });
            const response = await fetch("/report/?" + params);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            let { tweets, next, total } = await response.json();
            setLoading({ ...loading, tweets: false });
            tweets = tweets.map(tweet => parseTweet(tweet));
            return { tweets, next, total }
        } catch (error) {
            const message = {
                type: 'fail',
                content: 'Failed to retrieve reported tweets'
            }
            openToast(message);
        } finally {
            setLoading({ ...loading, tweets: false });
        }
    }

    const addToProjects = async (tweet, projects) => {
        projects = projects.map(project => project.name);
        const headers = new Headers({
            'Content-Type': 'application/json',
        });
        const init = {
            method: "POST",
            headers,
            body: JSON.stringify({
                projects
            })
        };
        try {
            const response = await fetch(`/report/add/${tweet.tweet_id}`, init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const { success } = await response.json();
            if (success) {
                const message = {
                    type: "success",
                    content: "Successfully added reported tweet"
                };
                openToast(message);
            }
        } catch {
            const message = {
                type: "fail",
                content: "Failed to add reported tweets to projects"
            }
            openToast(message);
        }
    }

    const fetchBlocks = async () => {
        if (!blocks.retrieved) {
            try {
                const response = await fetch("/block/");
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                let blocks = await response.json()
                blocks = blocks.map(block => block.username);
                setBlocks({ users: blocks, retrieved: true });
            } catch (error) {
                const message = {
                    type: "fail",
                    content: "Failed to retrieve blocking list"
                };
                openToast(message);
            }
        }
    }

    const block = async (username) => {
        const headers = new Headers({
            "Content-Type": "application/json",
        })
        const body = {
            username
        }
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        }
        try {
            const response = await fetch("/block/", init);
            if (!response.ok) {
                throw new Error(`HTTP status: ${response.status}`);
            }
            blocks.users = [...blocks.users, username];
            setBlocks({ ...blocks });
            const message = {
                type: "success",
                content: `Successfully blocked ${username}`
            };
            openToast(message);
        } catch (error) {
            const message = {
                type: "fail",
                content: `Failed to block user ${username}`
            };
            openToast(message);
        }
    }

    const unblock = async (username) => {
        const headers = new Headers({
            "Content-Type": "application/json",
        });
        const body = {
            username
        }
        const init = {
            method: "DELETE",
            headers: headers,
            body: JSON.stringify(body)
        }
        try {
            const response = await fetch("/block/", init);
            if (!response.ok) {
                throw new Error(`HTTP status: ${response.status}`);
            }
            blocks.users = blocks.users.filter(block => block !== username);
            setBlocks({ ...blocks });
            const message = {
                type: "success",
                content: `Successfully unblocked ${username}`
            };
            openToast(message);
        } catch (error) {
            const message = {
                type: "fail",
                content: `Failed to unblock user ${username}`
            }
            openToast(message);
        }
    }

    const fetchTFIDF = async (project, kind, scope, documents) => {
        const headers = new Headers({
            'Content-Type': 'application/json'
        });
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ documents })
        }
        if (!(TFIDF[project] && TFIDF[project][kind] && TFIDF[project][kind][scope]))
            try {
                setLoading({ ...loading, term: true });
                let response = await fetch("/data/tf-idf", init);
                if (!response.ok) {
                    throw new Error(`HTTP status: ${response.status}`);
                }
                response = await response.json();
                setLoading({ ...loading, term: false });
                if (!TFIDF.hasOwnProperty(project)) {
                    TFIDF[project] = {};
                }
                if (!TFIDF[project].hasOwnProperty(kind)) {
                    TFIDF[project][kind] = {};
                }
                TFIDF[project][kind.toLowerCase()][scope.toLowerCase()] = response;
                setTFIDF({ ...TFIDF });
            } catch (error) {
                const message = {
                    type: "fail",
                    content: "Failed to compute metrics"
                }
                openToast(message);
            } finally {
                setLoading({ ...loading, term: false });
            }
    }

    const explainText = async (text) => {
        const headers = new Headers({
            'Content-Type': "application/json"
        });
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ text: text })
        }
        try {
            setLoading({ ...loading, explain: true });
            const response = await fetch("/inference/text/explain", init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const { attentions } = await response.json();
            setLoading({ ...loading, explain: false });
            return { attentions };
        } catch (error) {
            const message = {
                type: "fail",
                content: "Failed to provide explanation",
            }
            openToast(message);
        } finally {
            setLoading({ ...loading, explain: false });
        }
    }

    const explainMultimodal = async (text, image) => {
        const headers = new Headers({
            'Content-Type': "application/json"
        });
        const init = {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ text, image })
        };
        try {
            setLoading({ ...loading, explain: true });
            const response = await fetch("/inference/multimodal/explain", init);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const { attentions, mask } = await response.json();
            setLoading({ ...loading, explain: false });
            return { attentions, mask }
        } catch (error) {
            const message = {
                type: "fail",
                content: "Failed to provide explanation",
            }
            openToast(message);
        } finally {
            setLoading({ ...loading, explain: false });
        }
    }

    const parseData = (data) => {
        data.tweets = data.tweets.map(tweet => {
            return parseTweet(tweet);
        })
        data.progress['in progress'] = data.progress.total - data.progress.completed;
        return data;
    }

    const parseTweet = (tweet) => {
        tweet.created_at = parseTime(tweet.created_at.$date);
        tweet.media_type = tweet.media.length > 0 ? tweet.media[0].media_type : 'None';
        return tweet;
    }

    return { data, aggregate, monitor, user, progress, tweets, timeline, loading, next, blocks, replies, TFIDF, fetchData, fetchAggregate, fetchMonitor, fetchUser, fetchProgress, fetchTimeline, fetchTweets, fetchReport, addToProjects, fetchBlocks, block, unblock, fetchReplies, fetchTFIDF, explainText, explainMultimodal };
};

export default useData;