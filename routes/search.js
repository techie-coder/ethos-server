
const CLIENT_ID = "fe771e55e0c341f49faaae73243de8dc"
const CLIENT_SECRET = "ba2712d797cb4c3c9d9a1766da027319"
async function getAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
        },
        body: "grant_type=client_credentials",
    });
    const data = await response.json();
    console.log(data);
    return data.access_token;
}

async function searchSpotify(query) {
    const token = await getAccessToken();
    const limit = 10;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();
    console.log(data);
    if (!data.tracks || !data.tracks.items.length) {
        console.log("No results found.");
        return [];
    }

    return data.tracks.items.map(track => ({
        songName: track.name,
        artistName: track.artists.map(artist => artist.name).join(", "),
        albumName: track.album.name,
        albumCover:  track.album.images.length > 0 ? track.album.images[0].url : null
    }));
}

searchSpotify("Blinding lights").then(results => console.log(results));