const express = require("express");

const app = express();

app.use(express.json());



const urlsRouter = require("./urls/urls.router");
const usesRouter = require("./uses/uses.router");
app.use("/urls", urlsRouter); // Note: app.use
app.use("/uses", usesRouter);


app.use((req, res, next) => {
    res.status(404).json({ error: `Not found: ${req.originalUrl}` });
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error);
  console.log("in error handler, the  error received: ",error.message, " error status: ",error.status);
    res.status(error.status || 500).json({ error: error.message });
});
module.exports = app;
