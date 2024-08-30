const uses = require("../data/uses-data");

function list(req, res) {
    const { urlId } = req.params;
    res.json({ data: uses.filter(urlId ? use => use.urlId == urlId : () => true) });
}

let lastUseId = uses.reduce((maxId, use) => Math.max(maxId, use.id), 0)

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

function exposurePropertyIsValid(req, res, next) {
    const { data: { exposure } = {} } = req.body;
    const validExposure = ["private", "public"];
    if (validExposure.includes(exposure)) {
        return next();
    }
    next({
        status: 400,
        message: `Value of the 'exposure' property must be one of ${validExposure}. Received: ${exposure}`,
    });
}

function syntaxPropertyIsValid(req, res, next) {
    const { data: { syntax } = {} } = req.body;
    const validSyntax = ["None", "Javascript", "Python", "Ruby", "Perl", "C", "Scheme"];
    if (validSyntax.includes(syntax)) {
        return next();
    }
    next({
        status: 400,
        message: `Value of the 'syntax' property must be one of ${validSyntax}. Received: ${syntax}`,
    });
}

function expirationIsValidNumber(req, res, next){
    const { data: { expiration }  = {} } = req.body;
    if (expiration <= 0 || !Number.isInteger(expiration)){
        return next({
            status: 400,
            message: `Expiration requires a valid number`
        });
    }
    next();
}

function create(req, res) {
    const { data: { urlId, time } = {} } = req.body;
    const newUse = {
        id: ++lastUseId, // Increment last id then assign as the current ID
        urlId: urlId,
        time: time,
    };
    uses.push(newUse);
    res.status(201).json({ data: newUse });
}

function useExists(req, res, next) {
    const { useId } = req.params;
    const foundUse = uses.find(use => use.id === Number(useId));
    if (foundUse) {
        res.locals.use = foundUse;
        return next();
    }
    next({
        status: 404,
        message: `Use id not found: ${useId}`,
    });
};

function read(req, res, next) {
    res.json({ data: res.locals.use });
};

function update(req, res) {
    const use = res.locals.use;
    const { data: { urlId, time } = {} } = req.body;

    // update the use
    use.urlId = urlId;
    use.time = time;


    res.json({ data: use });
}

function destroy(req, res) {
    const { useId } = req.params;
    const index = uses.findIndex((use) => use.id === Number(useId));
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedUses = uses.splice(index, 1);
    res.sendStatus(204);
}

module.exports = {
    create: [
        bodyDataHas("urlId"),
        bodyDataHas("time"),
        create
    ],
    list,
    read: [useExists, read],
    update: [
        useExists,
        bodyDataHas("urlId"),
        bodyDataHas("time"),
        update
    ],
    delete: [useExists, destroy],
};