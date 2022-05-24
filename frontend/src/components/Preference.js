import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProject } from '../hooks';

const Preference = () => {
    const [params, setParams] = useSearchParams();
    const [form, setForm] = useState({
        state: params.get("state"),
        code: params.get("code"),
        twitter: "",
        name: 'personal',
        type: 'personal',
        isReply: 'is:reply',
        isRetweet: 'is:retweet',
        isQuote: 'is:quote',
        language: 'lang:en',
        media: 'has:images',
    });
    const { projects, fetchProjects, createProject, updateProject } = useProject();


    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            const project = projects[0]
            form.twitter = project.user.twitter_username
            form.isReply = project.raw.isReply;
            form.isRetweet = project.raw.isRetweet;
            form.isQuote = project.raw.isQuote;
            form.language = project.raw.language;
            form.media = project.raw.media;
            setForm({ ...form });
        }
    }, [projects]);

    const reset = () => {
        setForm({
            state: null,
            code: null,
            twitter: "",
            name: 'personal',
            type: 'personal',
            isReply: 'is:reply',
            isRetweet: 'is:retweet',
            isQuote: 'is:quote',
            language: 'lang:en',
            media: 'has:images',
        });
    }

    const handleChange = (e, field) => {
        form[field] = e.target.value;
        setForm({ ...form });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const raw = {
            isReply: form.isReply,
            isRetweet: form.isRetweet,
            isQuote: form.isQuote,
            language: form.language,
            media: form.media,
            twitter: form.twitter,
        };
        const payload = {
            name: form.name,
            project_type: form.type,
            raw: raw,
        };

        if (form.code && form.state) {
            payload.code = form.code;
            payload.state = form.state;
        }

        if (projects.length > 0) {
            updateProject(projects[0]._id.$oid, payload);
        } else {
            createProject(payload);
        }
    }

    return <div className='mx-auto max-w-3xl bg-white rounded-3xl shadow-md p-8'>
        <div className="mb-8">
            <p className="text-2xl font-semibold mb-2">Twitter Profile</p>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-lg font-medium mb-1">Connect to Twitter</p>
                    <p className="text-gray-500">Connect to Twitter account</p>
                </div>
                <div className="w-32 md:w-48">
                    <a className={`w-full ${form.code || projects[0] ? 'cursor-default bg-gray-100' : "btn"} rounded-full px-3 py-2 flex items-center justify-center gap-x-2`}
                        href={form.code || projects[0] ? "#" : `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=http://127.0.0.1:3000&scope=tweet.read%20tweet.write%20users.read%20follows.read%20follows.write%20offline.access%20mute.read%20mute.write%20block.read%20block.write&state=state&code_challenge=challenge&code_challenge_method=plain`}
                    >
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`${form.code || projects[0] ? "fill-black opacity-25" : "fill-white"} inline-block h-5 w-5`} viewBox="0 0 512 512">
                                <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
                            </svg>
                        </div>
                        <span className={`text-base font-semibold overflow-hidden whitespace-nowrap text-ellipsis ${form.code || projects[0] ? "text-black opacity-25" : "text-white"}`}>
                            {projects[0] ? projects[0].user.twitter_username : form.code ? 'Connected' : 'Connect'}
                        </span>
                    </a>
                </div>
            </div>
        </div>

        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <p className="text-2xl font-semibold">Tweet Type</p>
                <div className="w-32 md:w-48 flex justify-between">
                    <p className="font-semibold mx-auto">Accept</p>
                    <p className="font-semibold mx-auto">Decline</p>
                </div>
            </div>
            <div className="flex justify-between items-center mb-2">
                <div >
                    <p className="text-lg font-med=ium mb-1">Replies</p>
                    <p className="text-gray-500">All replies posted by you</p>
                </div>
                <div className="w-32 md:w-48 flex justify-between">
                    <div className="flex-initial mx-auto">
                        <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" value="is:reply" checked={form.isReply === "is:reply"} onChange={e => handleChange(e, 'isReply')} />
                    </div>
                    <div className="flex-initial mx-auto">
                        <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" value="" checked={form.isReply === ""} onChange={e => handleChange(e, 'isReply')} />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mb-2">
                <div className="">
                    <p className="text-lg font-medium mb-1">Retweets</p>
                    <p className="text-gray-500">All tweets retweeted by you</p>
                </div>
                <div className="w-32 md:w-48 flex justify-between">
                    <div className="flex-initial mx-auto">
                        <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" value="is:retweet" checked={form.isRetweet === "is:retweet"} onChange={e => handleChange(e, 'isRetweet')} />
                    </div>
                    <div className="flex-initial mx-auto">
                        <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" value="" checked={form.isRetweet === ""} onChange={e => handleChange(e, 'isRetweet')} />
                    </div>
                </div>
            </div>
        </div>

        <div className="mb-8">
            <p className="text-2xl font-semibold mb-2">Tweet Content</p>
            <div className="flex justify-between items-center mb-2">
                <div className="">
                    <p className="text-lg font-medium mb-1">Language</p>
                    <p className="text-gray-500">Select the language contained in the tweet</p>
                </div>
                <div className="w-32 md:w-48">
                    <select className="w-full bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" onChange={e => handleChange(e, 'language')}>
                        <option value="lang:en">English</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div className="">
                    <p className="text-lg font-medium mb-1">Media</p>
                    <p className="text-gray-500">Select the media contained in the tweet</p>
                </div>
                <div className="w-32 md:w-48">
                    <select className="w-full bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" onChange={e => handleChange(e, 'media')}>
                        <option value="has:images">All</option>
                        <option value="">Text Only</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-6">
            <button className="btn-invert rounded-full px-6 py-2" onClick={reset}>Reset</button>
            <button className="btn rounded-full px-6 py-2" onClick={handleSubmit}>Save</button>
        </div>
    </div>
}

export default Preference;