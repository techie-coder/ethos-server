
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
    const types = encodeURIComponent("track,artist,album,playlist");
    const endpoint = "https://api.spotify.com/v1/search";
    
    const url = `${endpoint}?q=${encodeURIComponent(query)}&type=${types}&limit=${limit}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (!data.tracks || !data.tracks.items.length) {
        console.log("No results found.");
        return [];
    }
    const tracks = data.tracks?.items.map(track => ({
        songName: track.name,
        artistName: track.artists.map(artist => artist.name).join(", "),
        albumName: track.album.name,
        albumCover: track.album.images.length > 0 ? track.album.images[0].url : null
    })) || [];

    const albums = data.albums?.items.map(album => ({
        albumName: album.name,
        artistName: album.artists.map(artist => artist.name).join(", "),
        albumCover: album.images.length > 0 ? album.images[0].url : null,
        spotifyUrl: album.external_urls.spotify
    })) || [];

    const playlists = data.playlists?.items.map(playlist => ({
        playlistName: playlist.name==null ?"":playlist.name,
        owner: playlist.owner.display_name,
        playlistCover: playlist.images.length > 0 ? playlist.images[0].url : null,
        spotifyUrl: playlist.external_urls.spotify
    })) || [];

    const artists = data.artist?.items.map(artist => ({
        artistName: artist.name,
        artistCover: artist.images.length > 0 ? artist.images[0].url : null
    })) || [];

    return { tracks, albums,artists, playlists };
}

searchSpotify("The weeknd").then(results => console.log(results));