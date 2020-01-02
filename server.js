'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');


const methodOverride = require('method-override');


const PORT = process.env.PORT || 3002;

require('dotenv').config();


app.use(express.static('./public'));

//Middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride((req, res) => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body) {
    console.log(req.body['_method']);
    let method = req.body['_method'];
    delete req.body['_method'];
    return method; //returns PUT, PATCH, POST, GET, or DELETE.
  }
}))

//Templating Engines
app.set('view engine', 'ejs');
app.set('views', './views/pages')

//Database setup
const client = new pg.Client(process.env.DATABASE_URL)
client.connect()
client.on('error', err => console.error(err));

//Routes
app.get('/', search);
app.post('/results', newSearch);


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (e) => console.error(e));
client.connect();



//Search from index page
function search(request, response){

  response.render('index')
}

//Search functionality for users to choose from company name/symbol
function newSearch(request, response){

  let searchStr = request.body.search[0];
  let searchType = request.body.search[1];
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${searchStr}`;

  if (searchType === 'company') {
    let companySearch = searchAlpha(searchStr);
    companySearch.then( result => {

      companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${result}`;
      superagent.get(companyURL)
        .then(resultData => {

          const parseResult = JSON.parse(resultData.text);
          let parseResultProfile = parseResult.profile;
          let company = new Company(parseResultProfile)

          response.render('results', {company});

        })
        .catch(err => console.log(err));
    })
  }

  console.log('BACON', companyURL);
  superagent.get(companyURL)
    .then(resultData => {

      const parseResult = JSON.parse(resultData.text);
      let parseResultProfile = parseResult.profile;
      let company = new Company(parseResultProfile)

      response.render('results', {company});
    })
    .catch(err => console.log(err));
}

//logic to pull sticker information from the company name to send to the main API
function searchAlpha(userKey){

  return superagent.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${userKey}&apikey=${process.env.ALPHA_API_KEY}`).then(response => {

    let stickerObject = response.body.bestMatches[0];

    let symbolShare = stickerObject['1. symbol'];

    let nameShare = stickerObject['2. name'];
    console.log('data to parse to next API', symbolShare, nameShare);

    return symbolShare;

  })
    .catch(error => {
      console.error('catch on it ', error)
    })
}

//Save Companies
function saveCompany(request, response){
  let SQL = `INSERT INTO companies
  (name, symbol, price, sector, ceo, description, image)
    VALUES($1,$2,$3,$4,$5,$6,$7)`;
  let values = (SQL, [request.body.name, request.body.symbol, request.body.price, request.body.sector, request.body.ceo, request.body.description, request.body.image]);

  return client.query(SQL, values)
  .then(savedResults => {
    let SQL = `SELECT id FROM companies WHERE ceo=$1`;
    let values = [request.body.ceo];

    return client.query(SQL, values)
    .then(savedResults => {
      response.redirect(`/`)
    })
  })
}

app.get('/', (req, res) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=finance`).then(data => {
    const booksArray = data.body.items.map(book => new Book(book));
    const books = booksArray.slice(0, 3);
    res.render('index', { books });
  }).catch(error => {
    res.render('error', { error });
  });
});

app.get('/event', (req, res) => {
  console.log('data')
  superagent.get(`http://api.eventful.com/json/events/search?q=investing&where=Seattle&within=25&app_key=5DsQwPWqNz4zHmtM`).then(data => {

    let parsedData= JSON.parse(data.text);

    // let events = data.events.event[0].title;
    // console.log('data afetr data', JSON.parse(data.text))
    const eventsArray = parsedData.events.event.map(event => new Event(event));
    const events = eventsArray.slice(0, 3);
    // console.log('event', events)
    res.render('event', { events });


  }).catch(error => {
    console.log(error)
    res.render('error', { error });
  });
});

//Company Constructor
function Company(obj){
  this.name = obj.companyName;
  this.symbol = obj.symbol;
  this.price = obj.price;
  this.sector = obj.sector;
  this.ceo = obj.ceo;
  this.description = obj.description;
  this.image = obj.image;
}


//Book Constructor
function Book(bookObj) {
  this.image_url = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.thumbnail;
  this.title = bookObj.volumeInfo.title;
  this.authors = bookObj.volumeInfo.authors;
  this.link = bookObj.volumeInfo.previewLink;
}

//event constructor
function Event(eventObj) {
  this.title = eventObj.title,
  this.city = eventObj.city_name,
  this.start_time = eventObj.start_time
}


function errorHandler(request, response){
  if(response) response.status(500).render('error');

}

////DATABASE porfolio output 

app.get('/portfolio', (req, res) => {
  const instruction = 'SELECT * FROM company;';
  client.query(instruction).then(function (sqlData) {
    console.log(sqlData.rows);
    const companyArray = sqlData.rows;
    companyArray.length > 0 ? res.render('portfolio', { companyArray }) : res.render('error');
    console.log('portfolio', companyArray);
  });
});

//database insert 






// database  deletion 


// id SERIAL PRIMARY KEY,
// companyName VARCHAR(255),
// symbol VARCHAR(255),
// price Decimal(19,2),
// sector VARCHAR(255),
// ceo VARCHAR(255),
// companyDescription VARCHAR(255),
// companyImage VARCHAR(255)
// );





app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
