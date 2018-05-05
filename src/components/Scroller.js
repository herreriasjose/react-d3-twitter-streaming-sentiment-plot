import React from 'react';
import './Scroller.css';
import tweetImg from '../logo.svg';


// Here we will show the text, author, location, score, etc. of the latest tweets received.

const Scroller = (props) => { 

    if (props.dataTweets) {
        
        let dataset = JSON.parse(props.dataTweets)  
        let tweets = []

        dataset.tweets.forEach((element,i) => {

         let time = new Date(element.time * 1000).toString(); // Milliseconds here.
        
            tweets.push(<span key={i}><p><img src={tweetImg} alt="Tweet-img" className="tweet-img" /><strong>●●●●●●●●●●●</strong>: {element.text}. <strong>Location:</strong> {element.location}. <strong>Score:</strong> {element.score} <strong>Time:</strong> {time}</p></span>);
            
        });

        return(<div className="Scroller-display"><div>{tweets}</div></div>);

    } else {
        return(<div className="Scroller-display"></div>);
    }
}

export default Scroller;