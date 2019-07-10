var parse = require("csv-parse/lib/sync"),
    fs = require("fs"),
    Player = require("./models/player"),
    mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/tellmegoodgood2",  { useNewUrlParser: true });
var playerFormString = fs.readFileSync("playerForm.csv").toString();
var records = parse(playerFormString, {from: 2}); // throw away header row
Player.remove({}, function(err, players){
    if(err) console.log(err);
});

records.forEach(function(record, index){
    Player.create({name: record[0], 
                   talent: 0, 
                   sport: 0,
                   knowledge: 0,
                   game: 0,
                   comparison: 0,
                   response: 0,
                   rand: Math.random() // to break the tie
                }, function(err, player){
                       if(err) {
                           console.log(err);
                       }
                       else console.log(player);
                    // Turn off db connection
                    if(index == records.length-1){
                        mongoose.connection.close();
                    }
            });

});


