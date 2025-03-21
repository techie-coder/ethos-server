const express = require('express')
require('dotenv').config()
const authenticate = require('../middleware/authenticate');

const search = express.Router()

const SpotifyService = require("../utils/SpotifyService");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyService = new SpotifyService(CLIENT_ID, CLIENT_SECRET);

search.get('/track/:trackName', authenticate, async (req, res) => {
    const { trackName } = req.params;  // Fix: Correctly extract parameter
    try {
        const results = await spotifyService.searchTrack(trackName)
        if (!results) {
            return res.status(404).json({ message: "No tracks found" });
        }
        res.status(200).json(results)
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Error searching for tracks", error: err.message })
    }
})

search.get('/album/:albumName', authenticate, async (req, res) => {
    const { albumName } = req.params;  // Fix: Correctly extract parameter
    try {
        const results = await spotifyService.getAlbumTracks(albumName)
        if (!results) {
            return res.status(404).json({ message: "Album not found" });
        }
        res.status(200).json(results)
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Error searching for album", error: err.message })
    }
})

module.exports = search;