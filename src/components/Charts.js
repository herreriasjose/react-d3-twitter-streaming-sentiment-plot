import React, { Component } from 'react';
import './Charts.css';
import * as d3 from 'd3'; 


// In this component we analyze and prepare the bar charts to be displayed.
 
class Charts extends Component {
 

    constructor(props){
       super(props);
 
       this.state = { 
        acceptNewTweets: true,                
        width: props.size[0],  
                      height: props.size[1],
                      lastTweetNumber: 0,
                      tweetsXplaces: [],
                     }
    }


    componentWillReceiveProps(props) {

        if(props.dataTweets){

            let dataset = JSON.parse(props.dataTweets)    
            // We get the number of the last scraped tweet in the batch we just received.
            let actualTweetNumber = dataset.lastTweet; 
        

            // In case our frontend requests too many batches and we receive a repeated one, we do not want to include it.

            if (true){
                let tweetsXplaces = []; // Let's create as many places (cities) as appears in the batch.

                dataset.places.forEach( (p,i) => {
                    tweetsXplaces.push([i,p,0,0,0,0,0]);
                }); 
                
                dataset.tweets.forEach( t => {
                    
                    tweetsXplaces.forEach( txp => {
                       if (txp[1] === t.location ){
                            
                            if (t.score > 4) {
                                txp[6] += 1;
                            } else if (t.score > 0 ) {
                                txp[5] += 1;
                            } else if (t.score === 0){
                                txp[4] += 1;
                            } else if (t.score < -4) {
                                txp[2] += 1;
                            } else {
                                txp[3] += 1;
                            }              
                       }
                   });             
                });

               // Let's add all the new tweets to the old ones. 
                
               if (this.state.tweetsXplaces.length > 0) {
                    tweetsXplaces.forEach((ele,i) => {       

                        let place = ele[1]; // Get the name of the city.
                        let scores = ele.slice(2,7); // Get the scores.
                        let oldScores = this.state.tweetsXplaces[i];
                        oldScores = oldScores.slice(2,7);                         
                        
                        if (oldScores) {

                            let sum = scores.map(function (num, j) {
                                return num + oldScores[j];
                            });
                            
                            tweetsXplaces[i] = [i,place,...sum];
                        }


                    });

                }            


               this.setState(
                  {
                      tweetsXplaces: tweetsXplaces,
                      date: props.date,
                      places: dataset.places,
                      lastTweetNumber: actualTweetNumber 

                  }
              );
              
             }
            }
 
     }


    updateCharts () {


        let charts = [];

        if(this.state.tweetsXplaces){
            
            if(document.getElementById("charts")) {
                document.getElementById("charts").innerHTML = "";
            };  // Let's wipe our "canvas".

            this.state.tweetsXplaces.forEach( (d,i) => {

                    let scores = (d.slice(2,7));
                    let scaleY = d3.scaleLinear().domain([0, d3.max(scores)]).range([0,70])
                    let place = d[1];

                    var svg = d3.select("#charts").append("svg")
                        .attr("height","100%")
                        .attr("width","100%");

                    svg.append("text")
                        .data(scores)
                        .attr("transform", "translate(" + (100 / 2) + " ," + (125) + ")")
                        .style("text-anchor", "middle")
                        .text(function(){ return place}); 

                    svg.selectAll("rect")
                        .data(scores)
                        .enter().append("rect")
                        .attr("height", function(d){
                            return scaleY(d);
                        })
                        .attr("width","40")
                        .attr("x", function(d, i) {return (i * 40) + 5})
                        .attr("y", function(d, i) {return 100 - scaleY(d);;})
                        .style("fill",function(d,i){ if (i === 0) return "#ff0000"; else if (i === 4) return "#2ECC40";
                                                                    else if (i === 3) return "#3D9970";
                                                                    else if (i === 2) return "#000000";
                                                                    else if (i === 1) return "#85144b"; });
            
            });
           
        }   
        
    }


    render() {    

        this.updateCharts();

        return (
            <div id="charts" className="Charts-display"/>             
            );
    
    }

}


export default Charts;