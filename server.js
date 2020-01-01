'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

require('dotenv').config();


app.use(express.static('./public'));

//Middleware
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

//Routes
app.get('/', search);
app.post('/searches', newSearch);


function search(request, response) {
  response.render('index')
}

function newSearch(request, response) {

  // let searchType = request.body.search;
  let searchStr = request.body.search[0];
  let searchType = request.body.search[1];
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${searchStr}`;

  if (searchType === 'company') {
    let companySearch = searchAlpha(searchStr);
    companySearch.then(result => {
      // console.log('this 0', result)
      companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${result}`;
      superagent.get(companyURL)
        .then(resultData => {

          // console.log('this 0', resultData)
          const parseResult = JSON.parse(resultData.text);
          // console.log('this 2', parseResult)
          let parseResultProfile = parseResult.profile;
          let company = new Company(parseResultProfile)
          // console.log('this 3', company)
          // console.log('this 4', company)
          response.render('searches/show', { company });
        })
        .catch(err => console.log(err));

    })
  }
  // console.log('this 1', searchType)

  console.log('BACON', companyURL);
  superagent.get(companyURL)
    .then(resultData => {

      // console.log('this 0', resultData)
      const parseResult = JSON.parse(resultData.text);
      // console.log('this 2', parseResult)
      let parseResultProfile = parseResult.profile;
      let company = new Company(parseResultProfile)
      // console.log('this 3', company)
      // console.log('this 4', company)
      response.render('searches/show', { company });
    })
    .catch(err => console.log(err));
  //////////////
}
/////////////////

// logic to pull sticker information from the company name to send to the main API
function searchAlpha(userKey) {

  return superagent.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${userKey}&apikey=7R6ONK4007JF3LU7`).then(response => {

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


// app.get('/results', (request, response) => {
//   response.render('results');
// })

//Constructor
function Company(obj) {
  this.name = obj.companyName;
  this.symbol = obj.symbol;
  this.price = obj.price;
  this.sector = obj.sector;
  this.ceo = obj.ceo;
  this.description = obj.description;
  this.image = obj.image;
}

// x.items[0].volumeInfo.title
app.get('/books', (req, res) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=finance`).then(data => {
    const booksArray = data.body.items.map(book => new Book(book));
    const books = booksArray.slice(0, 3);
    res.render('books', { books });
  }).catch(error => {
    res.render('error', { error });
  });
});

function Book(bookObj) {
  this.image_url = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.thumbnail;
  this.title = bookObj.volumeInfo.title;
  this.authors = bookObj.volumeInfo.authors;
  this.link = bookObj.volumeInfo.previewLink;
}

function errorHandler(request, response) {
  if (response) response.status(500).render('error');
}



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


//event constructor

function Event(eventObj) {
  this.title = eventObj.title,
    this.city = eventObj.city_name,
    this.start_time = eventObj.start_time
  // this.summary = summary
}


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
