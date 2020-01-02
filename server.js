'use strict';
const express = require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3002;

require('dotenv').config();


app.use(express.static('./public'));

//Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views/pages')

//Routes
// app.get('/', search);
app.post('/results', newSearch);



// function search(request, response) {
//   response.render('index')
// }

//Search functionality for users to choose from company name/symbol
function newSearch(request, response) {

  let searchStr = request.body.search[0];
  let searchType = request.body.search[1];
  let companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${searchStr}`;
  if (searchType === 'company') {
    let companySearch = searchAlpha(searchStr);
    companySearch.then(result => {

      companyURL = `https://financialmodelingprep.com/api/v3/company/profile/${result}`;
      superagent.get(companyURL)
        .then(resultData => {

          const parseResult = JSON.parse(resultData.text);
          let parseResultProfile = parseResult.profile;
          let company = new Company(parseResultProfile)

          response.render('results', { company });

        })
        .catch(err => console.log(err));
    })
  }
  superagent.get(companyURL)
    .then(resultData => {

      const parseResult = JSON.parse(resultData.text);
      let parseResultProfile = parseResult.profile;
      let company = new Company(parseResultProfile)
      // getStockNews(searchStr);

      getStockNews(searchStr).then(news => {
        const newsArray = news.map(news => new News(news));
        response.render('results', { newsArray, company });
      });

      // response.render('results', { newsArray });
    }).catch(err => console.log(err));



  // console.log('222222222222222', getStockNews(searchStr).then(news => {
  //   const newsArray = news.body.data.map(news => new News(news));
  //   console.log('kkkkkkkkkkkk',news.body);
  //   response.render('results', { newsArray });
  // }));
  // getStockNews(searchStr).then(news => {
  //   // const newsArray = news.body.data.map(news => new News(news));
  //   // console.log('kkkkkkkkkkkk',news.body);
  // });
}

// Get News from API using a ticker
function getStockNews(ticker) {
  let newsURL = `https://stocknewsapi.com/api/v1?tickers=${ticker}&items=5&token=${process.env.STOCK_NEWS_API}`;
  return superagent.get(newsURL).then(data => {
    // const newsArray = data.body.data.map(news => new News(news));
    let newsObj = data.body.data;
    // res.render('results', { newsArray });
    return newsObj;
  }).catch(error => {
    console.error('error', error);
  });
}

//logic to pull sticker information from the company name to send to the main API
function searchAlpha(userKey) {

  return superagent.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${userKey}&apikey=7R6ONK4007JF3LU7`).then(response => {

    let stickerObject = response.body.bestMatches[0];

    let symbolShare = stickerObject['1. symbol'];

    let nameShare = stickerObject['2. name'];
    // console.log('data to parse to next API', symbolShare, nameShare);

    return symbolShare;


  })
    .catch(error => {
      console.error('catch on it ', error)
    })
}

// //Search for Books
// app.get('/results', (req, res) => {
//   superagent.get(`https://www.googleapis.com/books/v1/volumes?q=finance`).then(data => {
//     const booksArray = data.body.items.map(book => new Book(book));
//     const books = booksArray.slice(0, 3);
//     res.render('results', { books });
//   }).catch(error => {
//     res.render('error', { error });
//   });
// });


//Company Constructor
function Company(obj) {
  this.name = obj.companyName;
  this.symbol = obj.symbol;
  this.price = obj.price;
  this.sector = obj.sector;
  this.ceo = obj.ceo;
  this.description = obj.description;
  this.image = obj.image;
}

app.get('/', (req, res) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=finance`).then(data => {
    const booksArray = data.body.items.map(book => new Book(book));
    const books = booksArray.slice(0, 3);

    superagent.get(`http://api.eventful.com/json/events/search?q=investing&where=Seattle&within=25&app_key=5DsQwPWqNz4zHmtM`).then(data => {

      let parsedData = JSON.parse(data.text);
      // let events = data.events.event[0].title;
      // console.log('data afetr data', JSON.parse(data.text))
      const eventsArray = parsedData.events.event.map(event => new Event(event));

      const events = eventsArray.slice(0, 3);
      res.render('index', { books, events });
    }).catch(error => {
      res.render('error', { error });
    });
  });

  // app.get('/event', (req, res) => {

  //   // console.log('event', events)
  //   res.render('event', { events });
  // }).catch(error => {
  //   console.log(error)
  //   res.render('error', { error });
  // });
});

// app.get('/results', (req, res) => {
//   superagent.get(`https://stocknewsapi.com/api/v1?tickers=FB&items=5&token=${process.env.STOCK_NEWS_API}`).then( data => {

//     const newsArray = data.body.data.map(news => new News(news));
//     console.log(newsArray)

//     res.render('results', { newsArray });
//   })
// });


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

// News Constructor
function News(newsObj) {
  this.tickers = newsObj.tickers;
  this.title = newsObj.title;
  this.date = newsObj.date;
  this.news_url = newsObj.news_url
  this.imageUrl = newsObj.image_url;
}

function errorHandler(request, response) {
  if (response) response.status(500).render('error');

}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
