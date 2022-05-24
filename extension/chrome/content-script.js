const host = "http://127.0.0.1:5000"
const hate = []
const data = {}
let results = {}

document.body.onload = () => {
    chrome.storage.sync.get("data", (storage) => {
        if (storage.data) {
            results = storage.data;
        }
    });
    fetchHateTerms();
    const obserser = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type == "childList") {
                setTimeout(() => {
                    const target = mutation.target;
                    const tweets = target.querySelectorAll("article");
                    tweets.forEach(tweet => {
                        const anchors = tweet.querySelectorAll("a");
                        const anchor = Array.from(anchors).find(anchor => {
                            const regex = new RegExp("\w*\/status\/\w*");
                            const href = anchor.getAttribute("href");
                            return href && regex.test(href);
                        });
                        if (anchor) {
                            const href = anchor.getAttribute("href");
                            const tweetId = href.split("/")[3];
                            const content = tweet.querySelector("div[lang]");
                            const id = content.getAttribute("id");
                            if (!data.hasOwnProperty(id)) {
                                data[id] = {
                                    text: "",
                                    images: [],
                                    control: null,
                                }

                                const texts = content.querySelectorAll("span");
                                texts.forEach(text => {
                                    data[id].text += text.innerText;
                                    data[id].text = data[id].text.trim();
                                })

                                const images = tweet.querySelectorAll("div[data-testid='tweetPhoto']");
                                images.forEach(image => {
                                    data[id].images.push(image.querySelector("img").getAttribute("src"));
                                });

                                const control = tweet.querySelector("div[role='group']");
                                const div = document.createElement('div');
                                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                svg.setAttribute("viewBox", "0 0 512 512");
                                svg.classList.add("icon");
                                path.setAttribute("d", "M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z");
                                svg.appendChild(path);
                                div.appendChild(svg);
                                div.classList.add("btn")
                                div.addEventListener("click", () => detect(data[id], tweetId));
                                control.appendChild(div);
                                data[id].control = control;

                                let warning = false;
                                data[id].text.split(' ').forEach(text => {
                                    text = text.trim().toLowerCase();
                                    if (hate.includes(text)) {
                                        warning = true;
                                    }
                                })

                                if (warning) {
                                    const tag = document.createElement("div");
                                    tag.textContent = "Potentially Hateful"
                                    tag.classList.add("tag");
                                    content.prepend(tag);
                                }
                            }
                        }
                    });
                }, 1000)

            }
        })
    });
    const config = { attributes: true, childList: true, subtree: true };
    obserser.observe(document.body, config);
}

const fetchHateTerms = async () => {
    try {
        const url = `${host}/data/terms`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
        }
        const terms = await response.json();
        terms.forEach(term => hate.push(term));
    } catch (error) {
        console.error(error)
    }
}

const report = async (id, label, element) => {
    const headers = new Headers({
        'Content-Type': 'application/json'
    });
    const init = {
        method: "POST",
        headers,
        body: JSON.stringify({
            id,
            label
        })
    }
    try {
        const url = `${host}/report/`;
        const response = await fetch(url, init);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        element.classList.remove("report");
        element.classList.add("reported");
        removeReportListener(element);
    } catch (error) {
        console.error(error)
    }
}

const detect = async (data, id) => {
    let btn;
    let spinner;
    let init;
    let url;

    btn = data.control.getElementsByClassName("btn")[0];
    if (btn) {
        data.control.removeChild(btn);
    }
    spinner = document.createElement("span");
    spinner.classList.add("spinner");
    data.control.appendChild(spinner);

    const headers = new Headers({
        'Content-Type': "application/json",
    });

    try {
        if (data.images.length === 0) {
            init = {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ text: data.text })
            };
            url = `${host}/inference/text`
        } else {
            init = {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ text: data.text, image: data.images[0] })
            };
            url = `${host}/inference/multimodal`
        }
        const response = await fetch(url, init);
        if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
        };
        const { label } = await response.json();
        if (!results.hasOwnProperty(label)) {
            results[label] = 0
        }
        results[label] += 1
        chrome.storage.sync.set({ data: results })
        const element = document.createElement("span");
        element.classList.add("result");
        element.classList.add("report");
        element.textContent = label;
        element.addEventListener("click", (e) => { e.stopPropagation(); report(id, label, element) })
        data.control.removeChild(spinner)
        data.control.appendChild(element);
    } catch (err) {
        console.error("Error");
        if (spinner) {
            data.control.removeChild(spinner);
        }
        if (btn) {
            data.control.appendChild(btn);
        }
    }
}

const removeReportListener = (element) => {
    element.removeEventListener("click", "report");
}