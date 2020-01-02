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
app.use(methodOverride((request, response) => {
  if(request.body && typeof request.body === 'object' && '_method' in request.body) {
    console.log(request.body['_method']);
    let method = request.body['_method'];
    delete request.body['_method'];
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
app.post('/save', saveCompany);
app.post('/results', newSearch);
// app.get('/portfolio', companySaved);


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

  // let savedCompany = new DbCompany(request.body);
  // console.log('saving', savedCompany)
  // let outcome = Object.values(savedCompany);

  //adds to database
  let SQL = `INSERT INTO companies
  (name, price, sector, ceo, description, image)
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING id`;
  let values = (SQL, [request.body.name, request.body.price, request.body.sector, request.body.ceo, request.body.description, request.body.image]);

  console.log('sql', values)

  //this should redirect to the portfolio page
  return client.query(SQL, values)
    .then(savedResults => {
      console.log('save 2', savedResults)
      const select = `SELECT * FROM companies`;
      return client.query(select)
        .then(savedResults => {
          console.log('save 3', savedResults)

          response.render('portfolio', {companyArray: savedResults.rows});
        })
        .catch(err => errorHandler(err));
    })
    .catch(err => errorHandler(err));
}

app.get('/portfolio', (req, res) => {
  const instruction = 'SELECT * FROM companies;';
  client.query(instruction).then(function (sqlData) {
    console.log(sqlData.rows);
    const companyArray = sqlData.rows;
    companyArray.length > 0 ? res.render('portfolio', { companyArray }) : res.render('error');
    console.log('portfolio', companyArray);
  });
});

//Saved Companies
// function companySaved(request, response){
//   const select = `SELECT * FROM companies`;
//   return client.query(select)
//     .then(data => {
//       const savedData = data.rows;
//       console.log('saved 4', savedData);
//       response.render('portfolio', {company: savedData});
//     })
//     .catch(err => errorHandler(err));
// }

app.get('/books', (req, res) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=finance`).then(data => {
    const booksArray = data.body.items.map(book => new Book(book));
    const books = booksArray.slice(0, 3);
    res.render('books', { books });
  }).catch(error => {
    res.render('error', { error });
  });
});

app.get('/event', (req, res) => {
  console.log('data')
  superagent.get(`http://api.eventful.com/json/events/search?q=investing&where=Seattle&within=25&app_key=${process.env.EVENTS_API_KEY}`).then(data => {

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

// function DbCompany(obj){
//   this.name = obj.name;
//   this.symbol = obj.symbol;
//   this.price = obj.price;
//   this.sector = obj.sector;
//   this.ceo = obj.ceo;
//   this.description = obj.description;
//   this.image = obj.image;
// }


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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
