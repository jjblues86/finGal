'use strict';
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.get('/', (request, response) => {
  response.render('index');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
