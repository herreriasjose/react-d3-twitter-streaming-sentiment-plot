import React, { Component } from 'react';
import './Summary.css';

// Here we will show a summary of the tweets we have received.


class Summary extends Component {


    constructor(props){
        super(props)
        this.state = {
            lastTweetNumber: 0,
            total: 0,
            neutral: 0,
            positive: 0,
            highlyPositive: 0,
            negative: 0,
            highlyNegative: 0
        };
    }

    componentWillReceiveProps(props) {

        if(props.dataTweets){

            let dataset = JSON.parse(props.dataTweets)    
            // We get the number of the last tweet scraped in the batch.
            let actualTweetNumber = dataset.lastTweet; 
            // In case our frontend requests too many batches and we receive a repeated one, we do not want to include it.
            if (actualTweetNumber > this.state.lastTweetNumber) {

                let total = 0, neutral = 0, positive = 0, highlyPositive = 0, negative = 0, highlyNegative = 0;

                total = dataset.tweets.length;

                dataset.tweets.forEach(t => {
                    
                    if (t.score > 4) {
                        highlyPositive += 1;
                    } else if (t.score > 0 ) {
                        positive += 1;
                    } else if (t.score === 0){
                        neutral += 1;
                    } else if (t.score < -4) {
                        highlyNegative += 1;
                    } else {
                        negative += 1;
                    }        
                    
                });


                this.setState({
                    lastTweetNumber : actualTweetNumber,
                    total : this.state.total + total,
                    neutral: this.state.neutral + neutral,
                    positive: this.state.positive + positive, 
                    highlyPositive: this.state.highlyPositive + highlyPositive,
                    negative: this.state.negative + negative,
                    highlyNegative: this.state.highlyNegative + highlyNegative
                    
                })
            }
        }
    }



    render(){

        if(this.state.total > 0){
            return (
                <div className="Summary-display">
                    <p className="detail">■<span className="black"> Number of tweets analyzed: {this.state.total}</span></p>
                    <p className="neutral">■<span className="black"> Neutral messages: {Math.round((this.state.neutral / this.state.total) * 100)}%</span></p>
                    <p className="positive">■<span className="black"> Positive messages: {Math.round((this.state.positive / this.state.total) * 100)}%</span></p>
                    <p className="very-positive">■<span className="black"> Highly positive messages: {Math.round((this.state.highlyPositive / this.state.total) * 100)}%</span></p>
                    <p className="negative">■<span className="black"> Negative messages: {Math.round((this.state.negative / this.state.total) * 100)}%</span></p>
                    <p className="very-negative">■<span className="black"> Highly negative messages: {Math.round((this.state.highlyNegative / this.state.total) * 100)}%</span></p>
                </div>
            );
      }
      else {
            return (<div></div>);
      }

    }

}



export default Summary;