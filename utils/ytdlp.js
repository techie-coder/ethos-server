//ln -s $(which python3) /usr/local/bin/python
const ytdlp = require('yt-dlp-exec');

async function getAudioUrl(searchTerm) {
    const result = await ytdlp.exec(searchTerm, {
        format: "bestaudio",
        defaultSearch: "ytsearch",
        getUrl: true,
    });
    return result.stdout;
}

//getAudioUrl("Timeless by The Weeknd, Playboi Carti").then(console.log).catch(console.error);
module.exports = { getAudioUrl };