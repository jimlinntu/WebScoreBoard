var mongoose = require("mongoose");

var playerSchema = new mongoose.Schema({
    name: String,
    profession: Number,
    social: Number,
    money: Number,
    love: Number,
    records: [{ date: Date, 
                profession: Number,
                social: Number,
                money: Number,
                love: Number
             }] // Input score records
});

module.exports = mongoose.model("Player", playerSchema);