const express = require('express')
const dotenv = require('dotenv')
const authenticate = require('../middleware/authenticate');

const search = express.Router()

dotenv.config()

const { getAccessToken, searchSpotify } = require('../utils/search')


search.post('/', authenticate, async (req, res) => {
    client_id = process.env.SPOTIFY_CLIENT_ID
    client_secret = process.env.SPOTIFY_CLIENT_SECRET
    const query = req.body.query;

    try{
        let spotifyToken = await getAccessToken(client_id, client_secret)
        const results = await searchSpotify(spotifyToken, query)
        if(results){
            console.log(results)
            res.status(200).send(results)
        }else{
            res.status(401).send("Could not find tracks")
        }
    }catch(err){
        console.log(err)
        res.status(401).send("error searching for tracks!")
    }
})

module.exports = search;