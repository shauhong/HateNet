import { useEffect, useRef, useState } from 'react';
import { formatNumber, formatDate } from "../utils";
import logo from '../assets/logo.svg'
import { useData, useGlobal } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { config } from '../chart.config';
import ReactTooltip from 'react-tooltip';

const Post = ({ tweet, clickable, modal, toggable, reply, store }) => {
    const [toggle, setToggle] = useState(false);
    const [explain, setExplain] = useState({
        attention: [],
        tokens: [],
        boxes: [],
    });
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const navigate = useNavigate();
    const { closeModal } = useGlobal();
    const { explainText, explainMultimodal, loading } = useData();
    const colorMap = {
        0: "#f0f9ff",
        1: "#e0f2fe",
        2: "#bae6fd",
        3: "#7dd3fc",
        4: "#38bdf8",
        5: "#0ea5e9",
        6: "#0284c7",
        7: "#0369a1",
        8: "#075985",
        9: "#0c4a6e",
        10: "#0c4a6e"
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            let image = new Image();
            image.src = tweet.media[0].url;
            const context = canvas.getContext("2d");
            image.onload = () => {
                canvas.height = image.height;
                canvas.width = image.width;
                context.drawImage(image, 0, 0);
            }
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            explain.boxes.forEach((box, index) => {
                const attention = Math.floor(explain.attention.slice(explain.tokens.length)[index] * 10);
                context.fillStyle = colorMap[attention];
                context.globalAlpha = 0.5;
                const [x1, y1, x2, y2] = box;
                const w = x2 - x1;
                const h = y2 - y1
                context.fillRect(x1, y1, w, h);
            });
        }
    }, [explain.boxes]);

    const handleError = () => {
        imgRef.current.src = logo;
    }

    const handleToggle = (e) => {
        e.stopPropagation();
        setToggle(!toggle);
    }

    const compute_score = (influence) => {
        let total = 0;
        let negative = 0;
        for (let result in influence) {
            total += influence[result];
            negative += !["None", "Non-Hateful"].includes(result) ? influence[result] : 0;
        }
        if (total === 0) return 0;
        return Math.ceil(negative / total * 100);
    }

    const handleExplain = async (e) => {
        e.stopPropagation();
        if (tweet.media.length === 1) {
            let { attention, tokens, boxes } = await explainMultimodal(tweet.text, tweet.media[0].url);
            attention = [...attention.slice(1, tokens.length - 1), ...attention.slice(tokens.length)];
            tokens = tokens.slice(1, tokens.length - 1);
            setExplain({ attention, tokens, boxes });
        } else {
            let { attention, tokens } = await explainText(tweet.text);
            attention = attention.slice(1, attention.length - 1);
            attention = attention.map(element => element * 10);
            tokens = tokens.slice(1, tokens.length - 1);
            setExplain({ ...explain, attention, tokens });
        }
    }

    return (
        <>
            <div className={`w-full max-w-xs md:max-w-xl bg-white rounded-3xl border p-6 mx-auto ${clickable && 'cursor-pointer hover:bg-gray-50'} peer`}
                onClick={() => {
                    if (clickable) {
                        store();
                        navigate(`${tweet.tweet_id}`);
                    }
                }}
            >
                <div className="relative flex flex-start gap-4">
                    {
                        modal &&
                        <button className="group absolute top-0 -right-1" onClick={closeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    }
                    <div className="w-12">
                        <img
                            ref={imgRef}
                            src={tweet.author.profile_image_url}
                            onError={handleError}
                            alt=""
                            className="rounded-full object-contain w-full h-auto" />
                    </div>
                    <div className="flex-1">
                        <div className="space-x-1 grid grid-cols-4 md:block">
                            <span className="col-span-1 font-bold overflow-hidden whitespace-nowrap text-ellipsis md:overflow-auto md:whitespace-normal">
                                {tweet.author.name}
                            </span>
                            <span className="col-span-1 text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis md:overflow-auto md:whitespace-normal">
                                @{tweet.author.username}
                            </span>
                            <span className="col-span-1 text-left text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis md:overflow-auto md:whitespace-normal">
                                - {formatDate(tweet.created_at)}
                            </span>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div>
                                {
                                    explain.attention.length > 0
                                        ? tweet.text.split(" ").map((element, index) => {
                                            let weight = Math.max(Math.floor(explain.attention[index] * 10) - 1, 0);
                                            weight = Math.min(weight, 9);
                                            weight = weight * 100;
                                            return (
                                                <>
                                                    <span className={`bg-sky-${weight} rounded-md`}>{element}</span>
                                                    <span> </span>
                                                </>
                                            );
                                        })
                                        : tweet.text
                                }
                            </div>
                            {
                                tweet.media.length === 1
                                    ? <div className="rounded-3xl max-h-96 overflow-y-auto">
                                        <canvas ref={canvasRef} className="rounded-3xl object-cover w-full h-full" />
                                    </div>
                                    : tweet.media.length === 2
                                        ? <div className="rounded-3xl grid grid-cols-2 max-h-96 overflow-y-auto">
                                            <img
                                                src={tweet.media[0].url}
                                                alt=""
                                                className="col-span-1 rounded-l-3xl object-cover w-full h-full"
                                            />
                                            <img
                                                src={tweet.media[1].url}
                                                alt=""
                                                className="col-span-1 rounded-r-3xl object-cover w-full h-full"
                                            />
                                        </div>
                                        : tweet.media.length === 3
                                            ? <div className="rounded-3xl grid grid-rows-2 grid-cols-3 max-h-96 overflow-y-auto">
                                                <img
                                                    src={tweet.media[0].url}
                                                    alt=""
                                                    className="col-span-2 row-span-2 rounded-l-3xl object-cover w-full h-full"
                                                />
                                                <img
                                                    src={tweet.media[1].url}
                                                    alt=""
                                                    className="col-span-1 rounded-tr-3xl object-cover w-full h-full"
                                                />
                                                <img
                                                    src={tweet.media[2].url}
                                                    alt=""
                                                    className="col-span-1 rounded-br-3xl object-cover w-full h-full"
                                                />
                                            </div>
                                            : tweet.media.length === 4
                                                ? <div className="rounded-3xl grid grid-rows-2 grid-cols-2 max-h-96 overflow-y-auto">
                                                    <img
                                                        src={tweet.media[0].url}
                                                        alt=""
                                                        className="col-span-1 rounded-tl-3xl object-cover w-full h-full"
                                                    />
                                                    <img
                                                        src={tweet.media[1].url}
                                                        alt=""
                                                        className="col-span-1 rounded-tr-3xl object-cover w-full h-full"
                                                    />
                                                    <img
                                                        src={tweet.media[2].url}
                                                        alt=""
                                                        className="col-span-1 rounded-bl-3xl object-cover w-full h-full"
                                                    />
                                                    <img
                                                        src={tweet.media[3].url}
                                                        alt=""
                                                        className="col-span-1 rounded-br-3xl object-cover w-full h-full"
                                                    />
                                                </div>
                                                : <></>
                            }
                        </div>
                        <div className={` gap-x-2 justify-between items-center grid ${reply ? 'grid-cols-9' : 'grid-cols-11'}`}>
                            <div className="col-span-2 flex items-center gap-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-gray-500 opacity-70" viewBox="0 0 54 72">
                                    <path d="M38.723,12c-7.187,0-11.16,7.306-11.723,8.131C26.437,19.306,22.504,12,15.277,12C8.791,12,3.533,18.163,3.533,24.647 C3.533,39.964,21.891,55.907,27,56c5.109-0.093,23.467-16.036,23.467-31.353C50.467,18.163,45.209,12,38.723,12z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-500">{formatNumber(tweet.metrics.like_count)}</span>
                            </div>

                            <div className="col-span-2 flex items-center gap-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-gray-500 opacity-70" viewBox="0 0 75 72">
                                    <path d="M70.676 36.644C70.166 35.636 69.13 35 68 35h-7V19c0-2.21-1.79-4-4-4H34c-2.21 0-4 1.79-4 4s1.79 4 4 4h18c.552 0 .998.446 1 .998V35h-7c-1.13 0-2.165.636-2.676 1.644-.51 1.01-.412 2.22.257 3.13l11 15C55.148 55.545 56.046 56 57 56s1.855-.455 2.42-1.226l11-15c.668-.912.767-2.122.256-3.13zM40 48H22c-.54 0-.97-.427-.992-.96L21 36h7c1.13 0 2.166-.636 2.677-1.644.51-1.01.412-2.22-.257-3.13l-11-15C18.854 15.455 17.956 15 17 15s-1.854.455-2.42 1.226l-11 15c-.667.912-.767 2.122-.255 3.13C3.835 35.365 4.87 36 6 36h7l.012 16.003c.002 2.208 1.792 3.997 4 3.997h22.99c2.208 0 4-1.79 4-4s-1.792-4-4-4z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-500">{formatNumber(tweet.metrics.retweet_count + tweet.metrics.quote_count)}</span>
                            </div>

                            <div className="col-span-2 flex items-center gap-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-gray-500 opacity-70" viewBox="0 0 65 72">
                                    <path d="M41 31h-9V19c0-1.14-.647-2.183-1.668-2.688-1.022-.507-2.243-.39-3.15.302l-21 16C5.438 33.18 5 34.064 5 35s.437 1.82 1.182 2.387l21 16c.533.405 1.174.613 1.82.613.453 0 .908-.103 1.33-.312C31.354 53.183 32 52.14 32 51V39h9c5.514 0 10 4.486 10 10 0 2.21 1.79 4 4 4s4-1.79 4-4c0-9.925-8.075-18-18-18z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-500">{formatNumber(tweet.metrics.reply_count)}</span>
                            </div>

                            {
                                !reply &&
                                <div className="col-span-2 hidden md:flex items-center gap-x-1 group">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 fill-gray-500 opacity-70 ${toggable ? "cursor-pointer hover:fill-sky-500 hover:opacity-100" : "cursor-default"}`} viewBox="0 0 512 512" onClick={handleToggle}>
                                        <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 128c17.67 0 32 14.33 32 32c0 17.67-14.33 32-32 32S224 177.7 224 160C224 142.3 238.3 128 256 128zM296 384h-80C202.8 384 192 373.3 192 360s10.75-24 24-24h16v-64H224c-13.25 0-24-10.75-24-24S210.8 224 224 224h32c13.25 0 24 10.75 24 24v88h16c13.25 0 24 10.75 24 24S309.3 384 296 384z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-500">{compute_score(tweet.influence)}</span>
                                </div>
                            }

                            <div
                                className="col-span-3 hidden md:flex items-center gap-x-1 overflow-hidden cursor-pointer group"
                                data-tip="Explain"
                                onClick={handleExplain}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="flex-initial min-w-[1rem] h-4 w-4 fill-gray-500 opacity-70 group-hover:fill-sky-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-500 group-hover:text-sky-500 overflow-hidden whitespace-nowrap text-ellipsis">
                                    {
                                        loading.explain ? "Loading" : tweet.result
                                    }
                                </span>
                            </div>
                            <ReactTooltip place='bottom' />
                        </div>
                    </div>
                </div>
            </div >

            <div className={`${toggable ? toggle ? "block" : "hidden" : "hidden"} bg-white rounded-3xl border h-96 px-6 py-4 mx-auto max-w-xs md:max-w-lg flex flex-col`}>
                <div className="px-2 mb-2">
                    <span className="text-lg font-semibold">Influence</span>
                </div>
                <div className="h-full">
                    <Pie
                        data={{
                            labels: Object.keys(tweet.influence),
                            datasets: [
                                {
                                    data: Object.values(tweet.influence),
                                    backgroundColor: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
                                    borderColor: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
                                    borderWidth: 1,
                                    hoverOffset: 10,
                                    fill: true,
                                }
                            ]
                        }}
                        options={config.Pie.options}
                    />
                </div>
            </div>
        </>
    );
}

export default Post;