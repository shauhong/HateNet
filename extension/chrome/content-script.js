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
                                const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");

                                svg.classList.add("icon");
                                svg.setAttribute("viewBox", "0 0 374 667");
                                path1.setAttribute("d", "M3.04126 321.598C3.1496 293.846 3.00018 34.9219 3.00018 34.9219C54.9049 -14.2155 81.8542 -6.22287 127.653 34.9219V220.96C181.912 270.737 211.185 267.86 261.818 220.96V164.424C309.641 130.415 331.369 144.548 351.427 164.424C371.486 184.3 387.766 249.327 351.427 284.745C142.068 284.055 5.7543 295.89 3.04126 321.598C3.03033 324.398 3.01677 324.845 3.00018 322.436C2.99824 322.155 3.01196 321.876 3.04126 321.598Z");
                                path2.setAttribute("d", "M3.00018 34.9219C3.00018 34.9219 3.18127 348.725 3.00018 322.436C2.81909 296.147 139.807 284.048 351.427 284.745C387.766 249.327 371.486 184.3 351.427 164.424C331.369 144.548 309.641 130.415 261.818 164.424V220.96C211.185 267.86 181.912 270.737 127.653 220.96V34.9219C81.8542 -6.22287 54.9049 -14.2155 3.00018 34.9219Z");
                                path3.setAttribute("d", "M372.678 345.555C372.333 373.305 370.275 632.221 370.275 632.221C317.954 680.914 291.073 672.692 245.627 631.159L247.213 445.127C193.38 394.89 164.083 397.517 113.053 443.984L112.571 500.518C64.4597 534.118 42.8529 519.801 22.9644 499.754C3.07601 479.708 -12.6488 414.544 23.99 379.437C233.336 381.912 369.746 371.239 372.678 345.555C372.712 342.755 372.73 342.309 372.726 344.718C372.725 344.999 372.709 345.278 372.678 345.555Z");
                                path4.setAttribute("d", "M370.275 632.221C370.275 632.221 372.769 318.428 372.726 344.718C372.683 371.007 235.597 381.938 23.99 379.437C-12.6488 414.544 3.07602 479.707 22.9644 499.754C42.8529 519.801 64.4597 534.118 112.571 500.518L113.053 443.984C164.083 397.517 193.38 394.89 247.213 445.127L245.627 631.159C291.073 672.692 317.954 680.914 370.275 632.221Z");
                                svg.appendChild(path1);
                                svg.appendChild(path2);
                                svg.appendChild(path3);
                                svg.appendChild(path4);
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