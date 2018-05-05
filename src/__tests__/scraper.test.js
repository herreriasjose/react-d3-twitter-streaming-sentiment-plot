import fs from 'fs';
import sqlite3 from 'sqlite3';
import Xray from 'x-ray';

describe('Utility Scraper test suite', () =>{

    const dummyDBPath = './dummy.db';

    test('gets Google Title', () => {
        const xray = Xray(); 
        xray('https://google.com', 'title')(function(err, res) {
            let title = null;
            if (err) {
                title = 'err';
            } else {
                title = res;
            };
            expect(title).toEqual('Google');
        });
    
  });

    test('get SQLite DB', () => {
        

        let db = new sqlite3.Database(dummyDBPath, (err) => {
            expect(err).toBe(null);
        });
            
        });

    test('delete SQLite DB', () => {
         
            fs.unlink(dummyDBPath,function(err){
                expect(err).toBe(null);
            });
        
        });
    

});

 