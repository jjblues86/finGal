'use strict';
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.get('/', (request, response) => {
  response.render('index');
});

app.get('/results', (request, response) => {
  response.render('results');
})

//Constructor

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
