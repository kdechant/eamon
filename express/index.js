const express = require('express');
const apiRoutes = require('./routes/api')

const app = express();
const port = 3000;


app.get('/', (req, res) => {
    res.send('home page');
});

app.use('/api', apiRoutes);

app.listen(port, () => console.log(`Eamon Remastered listening on port ${port}!`));
