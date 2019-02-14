var parse = require("csv-parse/lib/sync"),
    fs = require("fs"),
    Player = require("./models/player"),
    mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/dreamheartDB",  { useNewUrlParser: true });
var playerFormString = fs.readFileSync("playerForm.csv").toString();
var records = parse(playerFormString, {from: 2}); // throw away header row
Player.remove({}, function(err, players){
    if(err) console.log(err);
});

records.forEach(function(record){
    Player.create({name: record[0], 
                   profession: record[1], 
                   social: record[2],
                   money: record[3],
                   love: record[4],
                   sum: record[5],
                   rand: Math.random() // to break the tie
                }, function(err, player){
                       if(err) {
                           console.log(err);
                       }
                       else console.log(player);
                   });
});
