const urls = require("../data/urls-data");

const uses = require("../data/uses-data");


function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Must include a ${propertyName}`
        });
    };
}

let lastUrlId = urls.reduce((maxId, url) => Math.max(maxId, url.id), 0)

function create(req, res) {
    const { data: { href } = {} } = req.body;
    const newUrl = {
        id: ++lastUrlId, // Increment last id then assign as the current ID
        href: href,

    };
    urls.push(newUrl);
    res.status(201).json({ data: newUrl });
}

function urlExists(req, res, next) {
    const { urlId } = req.params;
    console.log("looking for urlId: ", urlId);
    const foundUrl = urls.find(url => url.id === Number(urlId));
    console.log("foundUrl: ", foundUrl);
    if (foundUrl) {
        console.log("found the url: ",foundUrl);
        res.locals.url = foundUrl;
        return next();
    }
  
    console.log("didnt find  the url: ",urlId);
    const error = new Error(`Url id not found: ${urlId}`);
    error.status = 404;
  console.log("the new error created: ",error.message, " error status: ",error.status);
    next(error);
};

function read(req, res) {
    const url = res.locals.url;
    const { urlId } = Number(url.id);
    const newUse = {
        id: uses.length + 1,
        urlId: url.id,
        time: Number(Date.now()),
    };
    console.log("newUSe: ", newUse);

    uses.push(newUse);
    res.json({ data: url });
} // read

function update(req, res) {
    const url = res.locals.url;
    const { data: { href } = {} } = req.body;

    // update the url
    url.href = href;
    res.json({ data: url });
}

function list(req, res) {
    console.log("urls in list: ",urls);
    res.json({ data: urls });
}


module.exports = {
    create: [
        bodyDataHas("href"),
        create
    ],
    list,
    read: [urlExists, read],
    update: [
        urlExists,
        bodyDataHas("href"),
        update
    ],
    urlExists,
};







