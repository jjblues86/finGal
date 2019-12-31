'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3001;

require('dotenv').config();


app.use(express.static('./public'));

//Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views/pages')

//Routes
app.get('/', search);
app.post('/results', newSearch);


function search(request, response){
  response.render('index')
}

function newSearch(request, response){

  // let searchType = request.body.search;
  let searchStr = request.body.search[0];
  let searchType = request.body.search[1];
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${searchStr}`;

  if(searchType === 'company'){
    let companySearch = searchAlpha(searchStr);
    companySearch.then( result => {
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
          response.render('searches/show', {company});
        })
        .catch(err => console.log(err));

    })
  }
  // console.log('this 1', searchType)

  console.log('BACON',companyURL);
  superagent.get(companyURL)
    .then(resultData => {

      // console.log('this 0', resultData)
      const parseResult = JSON.parse(resultData.text);
      // console.log('this 2', parseResult)
      let parseResultProfile = parseResult.profile;
      let company = new Company(parseResultProfile)
      // console.log('this 3', company)
      // console.log('this 4', company)
      response.render('searches/show', {company});
    })
    .catch(err => console.log(err));
  //////////////
}
/////////////////

// logic to pull sticker information from the company name to send to the main API
function searchAlpha(userKey){

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

////mock data rendering////
const fakeDatabase ={
  'Company': {
    symbol: 'AAPL',
    price: '291.45',
    beta: '1.139593',
    companyName: 'Apple Inc.',
    industry: 'Computer Hardware',
    website: 'http://www.apple.com',
    description: 'Apple Inc is designs, manufactures and markets mobile communication and media devices and personal computers, and sells a variety of related software, services, accessories, networking solutions and third-party digital content and applications.',
    sector: 'Technology',
    image: 'https://financialmodelingprep.com/images-New-jpg/AAPL.jpg'
  }
};

app.get('/results', (request, response) => {
  console.log('running app.get/results');
  // const company=Object.keys(fakeDatabase);
  response.send('working');
});
///////end of mock data/////
}


// app.get('/results', (request, response) => {
//   response.render('results');
// })

//Constructor
function Company(obj){
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
    const books= booksArray.slice(0, 3);
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


function errorHandler(request, response){
  if(response) response.status(500).render('error');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
