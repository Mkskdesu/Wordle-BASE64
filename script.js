let wordData;
let wordList;
let entertext ="";
let started = false
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

window.addEventListener("load", async e => {
    wordData = btoa(await fetchData());
});

async function fetchData(params) {
    let returnValue;
    await fetch("wordles.txt")
    .then(res => res.text())
    .then(data => returnValue = getRandomWordFromWordList(data))
    .catch(async err => {
        await fetch("https://slc.is/data/wordles.txt")
        .then(res => res.text())
        .then(data => returnValue = getRandomWordFromWordList(data));
    });
    return returnValue;
}

function getRandomWordFromWordList(data) {
    wordList = data.split("\n");
    return wordList[Math.floor(Math.random() * wordList.length)];
}

function randomCreate() {
    const wordLength = 5;
    const wordCharacters = "abcdefghijklmnopqrstuvwxyz";
    const charactersLength = wordCharacters.length;
    let value = "";
    for (var i = 0; i < wordLength; i++) {
        value += wordCharacters[Math.floor(Math.random() * charactersLength)];
    }
    return value;
}

function createNotification(type) {
    const messageTable = {
        "length": "Please enter a 5 letter word.",
        "notfound": "Word not found in dictionary.",
        "type": "The word contains characters that cannot be used.",
        "giveup": "The answer is : " + atob(wordData)
    }
    let data = {
        time: "3000",
        type: "top",
        description: messageTable[type],
        controls: "hidden"
    }
    return data;
}

function start() {
    started = true;
    document.querySelector("#randomword").disabled = true;
    document.querySelector("#giveup").disabled = false;
}

function check(text) {
    if (!text) return;
    if (text.length != 5) new inAppNotification(createNotification("length"));
    else if (!text.match(/[A-Za-z]{5}$/)) new inAppNotification(createNotification("type"));
    else if (!wordList.includes(text)) new inAppNotification(createNotification("notfound"));
    else {
        if(!started) start();
        judge(text);
    }
}
function judge(text) {
    text = btoa(text);
    let wordTable = {};
    let textTable = {};
    let judgeTable = [];
    for (const i of wordData) {
        wordTable[i] = wordTable[i] ? wordTable[i] + 1 : 1;
    }
    for (const i of text) {
        textTable[i] = 0;
    }
    console.log(wordTable, textTable);
    for (const i in text) {
        if (text[i] == wordData[i]) {
            textTable[i] = textTable[i] + 1;
            judgeTable.push("green");
        } else if (wordTable[text[i]] && wordTable[text[i]] > textTable[text[i]]) {
            textTable[i] = textTable[i] + 1;
            judgeTable.push("yellow");
        } else {
            judgeTable.push("black");
        }
    }
    console.log(textTable,judgeTable);
    show(text, judgeTable);

}

async function show(text,judgeTable) {
    const container = document.createElement("div");
    container.classList.add("showdata");
    document.querySelector("#showarea").appendChild(container);

    container.insertAdjacentHTML('afterbegin','<blank></blank>');
    for (const i in text) {
        const data = document.createElement("span");
        data.classList.add("showdata-data",judgeTable[i]);
        data.innerText = text[i];
        container.appendChild(data);
        data.style.animation = "showdata-data-animation ease-out 0.5s forwards";
        await sleep(500)
    }
    container.insertAdjacentHTML('beforeend', '<blank></blank>');

}

document.querySelector("#randomword").addEventListener("click", e => {
    e.target.classList.add("clicked");
    e.target.innerText = "Random Word : ON (Click to regenerate word)";
    wordData = btoa(randomCreate());
});

document.querySelector("#enter").addEventListener("click", e => {
    let data = document.querySelector("#input").value
    check(data)
    data = ""
});
document.querySelector("#giveup").addEventListener("click", e => {
    show(wordData, Array(8).fill("green"));
    new inAppNotification(createNotification("giveup"));
    document.querySelector("#input").value = atob(wordData);
    document.querySelector("#input").disabled = true;

});

window.addEventListener("keydown", e => {
    if(e.key=="Enter") document.querySelector("#enter").click();
})