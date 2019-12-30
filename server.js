'use strict';
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.get('/', (request, response) => {
  response.send('Welcome');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
