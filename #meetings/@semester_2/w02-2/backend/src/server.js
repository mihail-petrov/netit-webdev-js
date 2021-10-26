const express      = require('express');
const app          = express();
const workspaceApi = require('./@client/api/workspace.api');

app.use(express.json())

app.use((request, response, next) => {

    response.ok = (data) => {
        response.status(200).json(data);
    };

    response.notFound = (data) => {
        response.status(404).json(data);
    };

    response.badRequest = (data) => {
        response.status(400).json(data);
    };

    next();
});

app.get('/', (request, response) => {
    response.sendFile(`${__dirname}/frontend/index.html`);
});

// Workspace APi
app.use('/api/workspace', workspaceApi);


module.exports = app;