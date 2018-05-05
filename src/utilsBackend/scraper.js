const fs = require('fs');
const Xray = require('x-ray');
const xray = Xray();
const sqlite3 = require('sqlite3').verbose();
const logger = require('./logger');
const Parser = require('./parser');
const parse = Parser.parse;

const level = process.env.LOG_LEVEL || 'info';



class Scraper {

  constructor(){ 

      const tweetsDBPath = '../../public/databases/tweets.db';
      this.tweetsFilePath = '../../public/datasets/tweets.json';
        
      this.timelastGetTweets = null; 
      this.timeLastSummary = new Date();
      this.lastTweetIncluded = 0;

      this.places = [];


      this.db = new sqlite3.Database(tweetsDBPath, (err) => {
        if (err) {
          logger.error(err.message);
        }
          logger.info('Connected to the tweets database.');
      });

      if (!fs.existsSync(this.tweetsFilePath)) {

            let dummy = { text: "",
              name: "",
              screenName: "",
              userId : -1,
              time: -1,
              location: "",
              coordinates: "",
              score: 0,
              }

            
              fs.writeFile(this.tweetsFilePath, JSON.stringify(dummy), function(err) {
                if(err) {
                    return logger.debug(err);
                }
            logger.debug(`The file 'tweets.json' was recreated`);

          });

      };

    
      this.checkTimeRequest = this.checkTimeRequest.bind(this);
      setInterval(this.checkTimeRequest,1000); 

 

}



getTweets(locations) {

  this.places = [];
  
  locations.forEach(parameters => {
    
    this.places.push({ location: parameters.location, tweets: []});
  });

  

  let now = new Date();

  if((now - this.timelastGetTweets) > 10000) {

      this.timelastGetTweets = now;

      let self = this;

      this.places.forEach ( place => {

      setTimeout(() => { // Be polite. Take your time between requests.

        xray(`https://twitter.com/search?f=tweets&vertical=news&q=the%20near%3A${place.location}&src=typd`, 'body@html')(function(err, body) {

        if( level === 'debug') {
            fs.writeFile(`../../public/datasets/${place.location}.html`, body, function(err) {
                if(err) {
                    return logger.debug(err);
                }
              //  logger.debug(`The file ${place.location}.html was saved`);
            });
        };

        if(err) {
                return logger.error(err);
                };

      //  logger.debug(`${place.location} raw data was downloaded`);
      

      // Let's scrape this place
      
        self.scrape(place,body);


        });
        }, Math.random() * 2); 
      });

  } 
  
    
}


checkTimeRequest() {
  
  let now = new Date();
 // logger.debug('Checking!',now - this.timeLastSummary )
  if( ((now - this.timelastGetTweets) < 5000) && (now - this.timeLastSummary ) > 10000  ){
    this.createSummary();
    logger.debug("Now a new Summary!!")
  } 
}

 
scrape(place,body){


  /* At this time (2018-04-20), Twitter's webpage shows each tweet using data sparsed
         within 3 different divs. So first, we'll get those in 3 different batches.
         Each of these contains so many divs as tweets there are in total. */

  logger.debug(`I'm scraping ${place.location}.`);

  // let originalTweets = [];
  // let contexts = [];
  // let contents = [];
   

  // xray(body,['.original-tweet'])(function(err,divs){
  //   let num = divs.length;
  //   logger.debug(`I have found ${num} '.original-tweets' classes.`);
  //   divs.forEach(div => {
  //     originalTweets.push(div);
  //   })
  //   });

  // xray(body,['.context'])(function(err,divs){
  //  // Notice that, apparently, this section is empty under certain circumstances. 
  //   let num = divs.length;
  //   logger.debug(`I have found ${num} '.context' classes.`);
  //   divs.forEach(div => {
  //     contexts.push(div);
  //   })
  // });
  // xray(body,['.content'])(function(err,divs){
  //   let num = divs.length;
  //   logger.debug(`I have found ${num} '.content' classes.`);
  //   divs.forEach(div => {
  //     contents.push(div);
  //   })
  // });

  // Here we are going to get the user id values.

  // Here we are going to save the id, name and screen-name of the author of each tweet.
  
    let dataUserIds = [];
    let dataNames = [];
    let dataScreenNames = [];
    let dataTimes = [];
    let dataTexts = [];

  xray(body,['.original-tweet@data-user-id'])(function(err,ids){

    if (err) {
      return logger.error('Error getting user ids: ', err);
    } else { 
    let num = ids.length;
   // logger.debug(`I have found ${num} 'data-user-ids' values.`);
    ids.forEach(id => {
      dataUserIds.push(id.toString());
    });    
  }
});

   // Here we are going to get the user name values.

  xray(body,['.original-tweet@data-name'])(function(err,names){
    if (err) {
      return logger.error('Error getting user names: ', err);
    } else { 
        let num = names.length;
      //  logger.debug(`I have found ${num} 'data-name' values.`);
        names.forEach(name => {
          dataNames.push(name)
        });   
      } 
  });

  // Here we are going to get the user screen-name values.

  xray(body,['.original-tweet@data-screen-name'])(function(err,names){
    if (err) {
      return logger.debug('Error getting user screen-names: ', err);
    } else { 
    let num = names.length;
   // logger.debug(`I have found ${num} 'data-screen-name' values.`);
    names.forEach(name => {
      dataScreenNames.push(name);
    });    
    }
});

   // Here we are going to get the date of creation.


   xray(body,['._timestamp@data-time'])(function(err,dates){

     if (err) {
       return logger.error('Error getting dates: ', err);
     } else {
      let num = dates.length;
    //  logger.debug(`I have found ${num} 'data-time' values.`);
      dates.forEach(date => {
        dataTimes.push(date);
      });
     }
        
});



   // Here we are going to get the text of each tweet.


   xray(body,['.tweet-text@text'])(function(err,tweets){

    if (err) {
      return logger.error('Error getting tweets: ', err);
    } else {
      let num = tweets.length;
    //  logger.debug(`I have found ${num} 'tweet' texts.`);
      tweets.forEach(tweet => {
       dataTexts.push(tweet);
     });
    }
       
});


/* Python Code for the scraping of other features

                  
            try:
                # Here we get the number of retweets of this tweet.
                retweet_container = tweet_raw[2].find("span", {"class": "ProfileTweet-action--retweet"})
                retweet_container = retweet_container.find("span", {"class": "ProfileTweet-actionCount"})
                tweet_extracted.content['retweet_count'] = retweet_container["data-tweet-stat-count"]
            except Exception as e:
                    self.logger.debug("Exception trying to get the number of retweets.", exc_info=True)
                
            try:
                # Here we get the number of retweets. of this tweet.
                favorite_container = tweet_raw[2].find("span", {"class": "ProfileTweet-action--favorite"})
                favorite_container = favorite_container.find("span", {"class": "ProfileTweet-actionCount"})
                tweet_extracted.content['favorites_count'] = favorite_container["data-tweet-stat-count"]
            except Exception as e:
                    self.logger.debug("Exception trying to get the number of favorites.", exc_info=True) 
            

            try:
                # Here we'll get the number of replies.
                favorite_container = tweet_raw[2].find("span", {"class": "ProfileTweet-action--reply"})
                favorite_container = favorite_container.find("span", {"class": "ProfileTweet-actionCount"})
                tweet_extracted.content['replies_count'] = favorite_container["data-tweet-stat-count"]
            except Exception as e:
                    self.logger.debug("Exception trying to get the number of replies.", exc_info=True) 
                
            
            try:
                # Here we'll get the language.
                language_container = tweet_raw[2].find("p",{"class": "tweet-text"})
                tweet_extracted.content['lang'] = language_container['lang']
            except Exception as e:
                    self.logger.debug("Exception trying to get the language of a tweet.", exc_info=True)
            
            try:
                # And here we'll extract the hashtags.
                text = tweet_extracted.content["text"]
                hashtags = re.findall('#[A-zÀ-ú0-9]+',text)
                tweet_extracted.content['hashtags'] = ','.join(hashtags)
            except Exception as e:
                    self.logger.debug("Exception trying to get the hashtags of a tweet.", exc_info=True)


              # Here we'll check if this is retweeted.    
            if (tweet_raw[1].find("span",{"class":"js-retweet-text"})):
                # NOTE: Using from: since: until: searches in Twitter website, none retweet will be returned
                # NOTE: You need a search like https://twitter.com/search?q=from%3AUser%20since%3A2017-09-02%20until%3A2017-10-02%20filter%3Anativeretweets&src=typd
                # It's a retweet, so we need some juggling here.
                tweet_extracted.content['retweeted'] = 1
                tweet_extracted.content['original_author'] = {"id":id,"name":name,"screen_name":screen_name}  
                tweet_extracted.content['id'] = tweet_raw[0]['data-retweet-id']
                try:
                    reply_to_users_container = tweet_raw[0]['data-reply-to-users-json']
                    # Here we are going to extract the id of the retweeter
                    matches = list(re.findall('"id_str":"\d*', reply_to_users_container))
                    matches = matches[1]
                    id = re.findall('\d+',matches)[0]
                    # # Here we are going to extract the screen-name of the retweeter
                    # matches = list(re.findall('"screen_name":"\w*', reply_to_users_container))
                    # matches = matches[1]
                    # screen_name = re.findall(':"(\w+)',matches)[0]
                    # And finally here we are going to extract the name of the retweeter
                    matches = list(re.findall('"name":"\w*', reply_to_users_container))
                    matches = matches[1]
                    name = re.findall(':"(\w+)',matches)[0]
                except Exception as e:
                    self.logger.debug("Exception trying to extract data from a retweet.", exc_info=True)

                tweet_extracted.content['user']["id"] = id
                tweet_extracted.content['user']["name"] = name
                tweet_extracted.content['url'] = "http://twitter.com/" + tweet_extracted.content['original_author']['name'] + '/status/' + tweet_extracted.content['id']
                
            else:
                # It's not a retweet.
                tweet_extracted.content['retweeted'] = 0
                tweet_extracted.content['url'] = "http://twitter.com/" + tweet_extracted.content['user']['screen_name'] + '/status/' + tweet_extracted.content['id']


*/


  // Here I have the number of tweets in the last batch.

  let numOfTweets = dataTexts.length;
  logger.debug("The number of main values apparently matches.");

  let db = this.db;
   
  db.run("CREATE TABLE if not exists previousTweets (id INTEGER PRIMARY KEY, text TEXT NOT NULL, name TEXT, screenName TEXT, userId INT, time INT, location TEXT, score INT)");
  
  for(let i = 0; i < numOfTweets; i++){

        db.serialize(() => {
                
          let stmt = db.prepare("INSERT INTO previousTweets VALUES (NULL,(?),(?),(?),(?),(?),(?),(?))");

          let score = parse(dataTexts[i]);          

          stmt.run(  [dataTexts[i],dataNames[i],dataScreenNames[i],dataUserIds[i],dataTimes[i],place.location,score] );
          
          stmt.finalize();
        }); 



  //    }
      
    };

  }



  createSummary(){


    this.timeLastSummary = new Date();

    let db = this.db;
  
    var query = "SELECT text,screenName,location,score,time FROM previousTweets WHERE id > " + this.lastTweetIncluded; 
        
    db.all(query, (err, rows) => {
        
        if(err) {
          logger.debug("Error:", err);
          return;
        }

        logger.info("Tweets from:", this.lastTweetIncluded);      
        
        this.lastTweetIncluded += rows.length;

        logger.info("To:", this.lastTweetIncluded);  
        let summary = {
          lastTweet: this.lastTweetIncluded,
          places: this.places.map(a => a.location),
          tweets: []
        }
        rows.forEach(row => {
            summary.tweets.push(
                {text: row.text,
                screenName: row.screenName,
              location: row.location,
            score: row.score,
          time:row.time }
            )
        });
        fs.writeFile(this.tweetsFilePath, JSON.stringify(summary), function(err) {
          if(err) {
              return logger.debug(err);
          }
      logger.debug(`The file 'tweets.json' has changed`);

    });


      }); 
     
  }

  
 }


module.exports = Scraper;
 