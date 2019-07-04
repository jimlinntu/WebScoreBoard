var mongoose = require("mongoose");

var playerSchema = new mongoose.Schema({
    name: String,
    talent: Number, 
    sport: Number,
    knowledge: Number,
    game: Number,
    comparison: Number,
    response: Number,
    rand: Number,
    records: [{ date: Date, 
                talent: Number, 
                sport: Number,
                knowledge: Number,
                game: Number,
                comparison: Number,
                response: Number,
             }] // Input score records
});

module.exports = mongoose.model("Player", playerSchema);
