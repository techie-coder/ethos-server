const express = require('express')
const ytdlp = require("../utils/ytdlp");
const authenticate = require('../middleware/authenticate');

const getAudioUrl = express.Router();

getAudioUrl.get("/:trackName", authenticate, async (req, res) => {
    let trackName = req.params.trackName;
    try{
        const audioUrl = await ytdlp.getAudioUrl(trackName);
        res.status(200).json(audioUrl);
    }catch(err){
        console.log(err);
        res.status(401).send("Error while fetching audio url!")
    }
})

module.exports = getAudioUrl;