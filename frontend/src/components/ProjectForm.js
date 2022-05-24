import { useState } from 'react';
import { useGlobal } from "../hooks";
import { parseDate } from '../utils';
import { Dropdown } from '../components';

const ProjectForm = ({ submit, project }) => {
    const { closeModal } = useGlobal();
    const [form, setForm] = useState({
        name: project ? project.name : "",
        type: project ? project.project_type : "historical",
        start: project && project.start ? parseDate(project.start) : "",
        end: project && project.end ? parseDate(project.end) : "",
        isReply: project ? project.raw.isReply : "is:reply",
        isRetweet: project ? project.raw.isRetweet : "is:retweet",
        isQuote: project ? project.raw.isQuote : "is:quote",
        phrase: "",
        phrases: project ? project.raw.phrases : [],
        hashtag: "",
        hashtags: project ? project.raw.hashtags : [],
        mention: "",
        mentions: project ? project.raw.mentions : [],
        reply: "",
        replies: project ? project.raw.replies : [],
        user: "",
        users: project ? project.raw.users : [],
        language: project ? project.raw.language : "lang:en",
        media: project ? project.raw.media : "has:images",
    });

    const handleChange = (e, field) => {
        form[field] = e.target.value;
        setForm({ ...form });
    }

    const handleAdd = (field) => {
        const last = field.split("").pop();
        const regex = new RegExp("y");
        let list;
        if (regex.test(last)) {
            list = field.substr(0, field.length - 1) + "ies";
        } else {
            list = field + 's';
        }
        const exist = form[list].find(item => item === form[field]);
        if (!exist) {
            form[list].push(form[field]);
        }
        form[field] = "";
        setForm({ ...form });
    }

    const handleRemove = (remove, field) => {
        const filtered = form[field].filter(item => item !== remove);
        form[field] = filtered;
        setForm({ ...form });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const profile = {
            STANDALONE: {
                OR: [...form.phrases, ...form.hashtags, ...form.mentions.map(mention => "@" + mention), ...form.users.map(user => "from:" + user), ...form.replies.map(reply => "to:" + reply)],
            },
            CONJUNCTION: {
                AND: [form.language].filter(element => element !== ""),
                OR: [form.isReply, form.isRetweet, form.isQuote, form.media].filter(element => element !== "")
            }
        }
        const raw = {
            phrases: form.phrases,
            hashtags: form.hashtags,
            mentions: form.mentions,
            users: form.users,
            replies: form.replies,
            isReply: form.isReply,
            isRetweet: form.isRetweet,
            isQuote: form.isQuote,
            language: form.language,
            media: form.media
        }
        const payload = {
            name: form.name,
            project_type: form.type,
            start: form.start,
            end: form.end,
            raw: raw,
            profile: profile,
        };
        submit(payload);
        closeModal();
    }

    return (
        <div className="w-full max-w-3xl bg-white border rounded-3xl mx-4">
            <div className="flex justify-between px-6 py-4 border-b">
                <p className="text-2xl font-semibold">Project</p>
                <button className="group" onClick={closeModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-6 py-4 border-b max-h-[70vh] overflow-auto">
                <div className={(form.type === "historical" || form.type === 'filtered') && "mb-8"}>
                    <p className="text-2xl font-semibold mb-2">Project Information</p>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="text-lg font-medium mb-1">Project Name</p>
                            <p className="text-gray-500">Enter project name here</p>
                        </div>
                        <div className="w-32 md:w-56">
                            <input type="text" className="w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" value={form.name} onChange={e => handleChange(e, 'name')} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="text-lg font-medium mb-1">Project Type</p>
                            <p className="text-gray-500">Select project type here</p>
                        </div>
                        <select onChange={e => handleChange(e, 'type')} className="w-32 md:w-56 rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" >
                            <option value="historical" selected={form.type === "historical"} >Historical</option>
                            <option value="filtered" selected={form.type === "filtered"}>Filtered Stream</option>
                            <option value="volume" selected={form.type === "volume"}>Volume Stream</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="text-lg font-medium mb-1">Start Date</p>
                            <p className="text-gray-500">Select project starting date here</p>
                        </div>
                        <div className="w-32 md:w-56">
                            <input type="datetime-local" className="w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" value={form.start} onChange={e => handleChange(e, 'start')} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg font-medium mb-1">End Date</p>
                            <p className="text-gray-500">Select project ending date here</p>
                        </div>
                        <div className="w-32 md:w-56">
                            <input type="datetime-local" className="w-full rounded-3xl bg-gray-100 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" value={form.end} onChange={e => handleChange(e, 'end')} />
                        </div>
                    </div>
                </div>
                <>
                    {
                        (form.type === "historical" || form.type === "filtered") &&
                        <>
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-2xl font-semibold">Tweet Type</p>
                                    <div className="w-32 md:w-56 flex justify-between">
                                        <p className="font-semibold mx-auto">Accept</p>
                                        <p className="font-semibold mx-auto">Decline</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <div >
                                        <p className="text-lg font-medium mb-1">Replies</p>
                                        <p className="text-gray-500">All replies posted by user</p>
                                    </div>

                                    <div className="w-32 md:w-56 flex justify-between">
                                        <div className="flex-initial mx-auto">
                                            <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" name="tweet" value="is:reply" checked={form.isReply === 'is:reply'} onChange={e => handleChange(e, 'isReply')} />
                                        </div>

                                        <div className="flex-initial mx-auto">
                                            <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" name="tweet" value="" checked={form.isReply === ''} onChange={e => handleChange(e, 'isReply')} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Retweet</p>
                                        <p className="text-gray-500">All tweets retweeted by user</p>
                                    </div>

                                    <div className="w-32 md:w-56 flex justify-between">
                                        <div className="flex-initial mx-auto">
                                            <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" name="retweet" value="is:retweet" checked={form.isRetweet === 'is:retweet'} onChange={e => handleChange(e, 'isRetweet')} />
                                        </div>

                                        <div className="flex-initial mx-auto">
                                            <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" name="retweet" value="" checked={form.isRetweet === ''} onChange={e => handleChange(e, 'isRetweet')} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Quote Tweets</p>
                                        <p className="text-gray-500">All tweets quoted by user</p>
                                    </div>

                                    <div className="w-32 md:w-56 flex justify-between">
                                        <div className="flex-initial mx-auto">
                                            <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" name="quote" value="is:quote" checked={form.isQuote === 'is:quote'} onChange={e => handleChange(e, 'isQuote')} />
                                        </div>

                                        <div className="flex-initial mx-auto">
                                            <input type="radio" className="p-2 checked:bg-sky-500 focus:ring-0" name="quote" value="" checked={form.isQuote === ''} onChange={e => handleChange(e, 'isQuote')} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="">
                                <p className="text-2xl font-semibold mb-2">Tweet Content</p>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Phrase</p>
                                        <p className="text-gray-500">Add the target phrase contained in the tweet</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56 relative flex items-center">

                                        <input type="text" value={form.phrase} onChange={e => handleChange(e, 'phrase')} className="peer w-4/5 bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" />
                                        <button className="absolute right-1 bg-gray" onClick={() => handleAdd('phrase')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <div className="hidden hover:block peer-focus:block absolute top-full z-10 w-4/5 bg-white rounded-2xl">
                                            <Dropdown items={form.phrases} handleClick={(item) => handleRemove(item, 'phrases')} />
                                        </div>

                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Hashtag</p>
                                        <p className="text-gray-500">Add the hashtag contained in the tweet</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56 relative flex items-center">

                                        <input type="text" value={form.hashtag} onChange={e => handleChange(e, 'hashtag')} className="peer w-4/5 bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" />
                                        <button className="absolute right-1 bg-gray" onClick={() => handleAdd('hashtag')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <div className="hidden hover:block peer-focus:block absolute top-full z-10 w-4/5 bg-white rounded-2xl">
                                            <Dropdown items={form.hashtags} handleClick={(item) => handleRemove(item, 'hashtags')} />
                                        </div>

                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Mention</p>
                                        <p className="text-gray-500">Add the mentioned user in the tweet</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56 relative flex items-center">

                                        <input type="text" value={form.mention} onChange={e => handleChange(e, 'mention')} className="peer w-4/5 bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" />
                                        <button className="absolute right-1 bg-gray" onClick={() => handleAdd('mention')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <div className="hidden hover:block peer-focus:block absolute top-full z-10 w-4/5 bg-white rounded-2xl">
                                            <Dropdown items={form.mentions} handleClick={(item) => handleRemove(item, 'mentions')} />
                                        </div>

                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">User</p>
                                        <p className="text-gray-500">Add the tweets that is posted by a particular user</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56 relative flex items-center">

                                        <input type="text" value={form.user} onChange={e => handleChange(e, 'user')} className="peer w-4/5 bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" />
                                        <button className="absolute right-1 bg-gray" onClick={() => handleAdd('user')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <div className="hidden hover:block peer-focus:block absolute top-full z-10 w-4/5 bg-white rounded-2xl">
                                            <Dropdown items={form.users} handleClick={(item) => handleRemove(item, 'users')} />
                                        </div>

                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Reply To</p>
                                        <p className="text-gray-500">Add the tweets that is in reply to particular user</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56 relative flex items-center">

                                        <input type="text" value={form.reply} onChange={e => handleChange(e, 'reply')} className="peer w-4/5 bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" />
                                        <button className="absolute right-1 bg-gray" onClick={() => handleAdd('reply')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                        <div className="hidden hover:block peer-focus:block absolute top-full z-10 w-4/5 bg-white rounded-2xl">
                                            <Dropdown items={form.replies} handleClick={(item) => handleRemove(item, 'replies')} />
                                        </div>

                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <p className="text-lg font-medium mb-1">Language</p>
                                        <p className="text-gray-500">Select the language contained in the tweet</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56">
                                        <select className="w-full bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" onChange={e => handleChange(e, 'langauge')}>
                                            <option value="lang:en" selected={form.language === 'lang:en'}>English</option>
                                        </select>

                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="">
                                        <p className="text-lg font-medium mb-1">Media</p>
                                        <p className="text-gray-500">Select the media contained in the tweet</p>
                                    </div>

                                    <div className="flex-shrink-0 w-32 md:w-56">
                                        <select className="w-full bg-gray-100 rounded-3xl border-transparent focus:border-sky-500 focus:bg-white focus:ring-0" onChange={e => handleChange(e, 'media')}>
                                            <option value="has:images" selected={form.media === 'has:images'}>All</option>
                                            <option value="" selected={form.language === ''}>Text Only</option>
                                        </select>

                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </>
            </div>
            <div className="flex justify-end gap-6 px-6 py-4">
                <button className="btn-invert rounded-full px-6 py-2" onClick={closeModal}>Cancel</button>
                <button className="btn rounded-full px-6 py-2" onClick={handleSubmit}>Confirm</button>
            </div>
        </div>
    );
}

export default ProjectForm;