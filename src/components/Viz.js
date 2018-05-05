import React, {Component} from 'react';
import './Viz.css';


import axios from 'axios';
import Spinner from '../components/UI/Spinner/Spinner';
import Charts from './Charts';
import Scroller from './Scroller';
import Summary from './Summary';


// This component organizes the presentation of the rest and makes requests for new tweets.

class Viz extends Component {


    constructor(props){
        super(props);
       
        this.state = {
                dataTweets: null,
                loading : true,
                error: false,
                };

        this.getTweets = this.getTweets.bind(this);
      
        setTimeout(this.getTweets,3000);
    }

 
    getTweets() {

        // Here we are going to request new tweets.

        axios.get("http://localhost:8080/datatweets/")
        // axios.get("/datatweets/") 
        // This way we could use it through "package.json" parameters.
            .then( response => {
                                this.setState({loading: false, dataTweets: response.data, date: new Date().toString()});
                    
                                setTimeout(this.getTweets,5000);
                                 
                            })
            .catch( error => {
                console.log('Error:',error);
                this.setState({loading:false, error:true});
                setTimeout(this.getTweets,15000);
        });
    }
        
 

    render(){
        
        let result = null;

        if ( this.state.loading ) {
            result = <Spinner />;
        } else if (this.state.error){
            result= <p>There is a problem connecting to the server.</p>
        };
         
   
        return (
            
        <div className="colmask">
            <div className="colmid">
                <div className="colleft">
                    <div className="col1">
                    <h4> Charts </h4>
                    {result}
                    <Charts size={[800,600]} date={this.state.date} dataTweets={this.state.dataTweets}/> 
                    </div>
                    <div className="col2">
                    <h4> Tweets analyzed</h4>
                    {result}
                    <Scroller dataTweets={this.state.dataTweets}/>
                    </div>
                    <div className="col3">
                    <h4>Summary</h4> 
                    {result}
                    <Summary dataTweets={this.state.dataTweets}/>
                    </div>
                </div>
            </div>
        </div>
        );
    }


}

export default Viz;