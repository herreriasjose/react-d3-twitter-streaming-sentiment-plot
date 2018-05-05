
 
const cors = require('cors');	
const express = require('express');
const fs = require('fs');
const path = require('path');	

const app = express();
const dataTweets = express.Router();

const logger = require('../utilsBackend/logger')
const Scraper = require('../utilsBackend/scraper');
let scraper = new Scraper();

const level = process.env.LOG_LEVEL || 'debug';

const tweetsFilePath = '../../public/datasets/tweets.json';


app.use(cors());

app.use('/datatweets',dataTweets);


dataTweets.use(function(req,res,next) {
 
    logger.debug("Method: " + req.method + " URL: " + req.url);
    next();
    
  }); 
  
  
dataTweets.get('/', function(req, res, next) {
    
    logger.debug('New requests');

    // Here we make the requests.
    // Notice that we are no using the coordinates in this particular project.

    scraper.getTweets([
              {location:"Newcastle", coordinates: [null,null]},
              {location:"London", coordinates: [null,null]},
              {location:"Plymouth", coordinates: [null,null]},
              ]); 

    
    // Our scraper will prepare a summary of the latest tweets and save it to tweet.json.    
    // This is the file we are serving.   

    fs.readFile(tweetsFilePath, 'utf8', function (err,data) {
          if (err) {
            return logger.debug(err);
          }
          res.json(data);
        });
  });


app.listen(8080, function(){
    logger.info("Backend Server running on port 8080");
});
