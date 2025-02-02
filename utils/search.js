
const CLIENT_ID = "b7e9610c657f4ea0b0342417f3cd0764"
const CLIENT_SECRET = "ced93a72d74b4e959dfc25124d7a5331"

/**
 * 
 * @param {Spotify API client id} client_id 
 * @param {Spotify API client secret} client_secret 
 * @returns The access token that is required to access the spotify api.
 */
async function getAccessToken(client_id, client_secret) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(client_id + ":" + client_secret),
        },
        body: "grant_type=client_credentials",
    });
    const data = await response.json();

    return data.access_token;
}
/**
 * 
 * @param {The access token provided by spotify api} token 
 * @param {The term to be searched} query 
 * @returns A list contaiing the tracks, albums, playlists and artists as arrays
 */
async function searchSpotify(token, query) {
    const limit =10
    const endpoint = "https://api.spotify.com/v1/search";
    const types = encodeURIComponent("track,album,playlist,artist");
    const url = `${endpoint}?q=${encodeURIComponent(query)}&type=${types}&limit=${limit}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();
    const tracks = data.tracks?.items.map(track => ({
        songName: track.name,
        artistName: track.artists.map(artist => artist.name).join(", "),
        albumName: track.album.name,
        albumCover: track.album.images.length > 0 ? track.album.images[0].url : null
    })) || [];

    const albums = data.albums?.items.map(album => ({
        albumName: album.name,
        artistName: album.artists.map(artist => artist.name).join(", "),
        albumCover: album.images.length > 0 ? album.images[0].url : null
    })) || [];

    const playlists = data.playlists?.items
    ?.filter(playlist => playlist && playlist.name)  // Ensure valid playlists
    ?.map(playlist => ({
        playlistName: playlist.name,
        owner: playlist.owner?.display_name || "Unknown",  // Handle missing owner
        playlistCover: playlist.images?.length > 0 ? playlist.images[0].url : null
    })) || [];


    const artists = data.artists?.items?.map(artist => ({
        artistName: artist.name,
        artistCover: artist.images.length > 0 ? artist.images[0].url : null
    })) 
    console.log(data)
    return { tracks, albums, playlists, artists };
}
//const token = getAccessToken(CLIENT_ID, CLIENT_SECRET)
searchSpotify('BQAdIE1qbyAQ7Yay-a_9C1K3B89c14nop243jyUgDCRQD1tMRacrOO37v15mwsnOgY6Sbyx8f4DVv2IRjBywENEJL5p8ga-CFMDwXB4aU2Glcy606sx7n0C3GviTa2UKvOGp7u19xFI'
     , "Ed Sheeran").then(results => console.log(results));
//module.exports = { getAccessToken, searchSpotify };