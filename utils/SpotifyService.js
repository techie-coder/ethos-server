const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config()

class SpotifyService {
  constructor(clientId, clientSecret) {
    this.spotifyApi = new SpotifyWebApi({ clientId, clientSecret });
    this.tokenExpirationTime = null;
  }

  async ensureValidToken() {
    const bufferTime = 300; // 5 minutes buffer before token expires
    if (!this.tokenExpirationTime || Date.now() >= this.tokenExpirationTime - (bufferTime * 1000)) {
      await this.authenticate();
    }
  }

  async authenticate() {
    try {
      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body['access_token']);
      // Set expiration time (3600s = 1 hour)
      this.tokenExpirationTime = Date.now() + (data.body['expires_in'] * 1000);
      console.log('Spotify API authenticated successfully');
    } catch (error) {
      console.error('Error authenticating Spotify:', error);
      throw error;
    }
  }

  async searchTrack(trackName) {
    try {
      await this.ensureValidToken();
      const data = await this.spotifyApi.searchTracks(trackName, { limit: 10 });
      if (data.body.tracks.items.length === 0) return null;
      return data.body.tracks.items.map(track => ({
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url || null
      }));
    } catch (error) {
      console.error('Error searching for track:', error);
      throw error;
    }
  }

  async getArtistAlbums(artistName) {
    try {
      await this.ensureValidToken();
      const artistData = await this.spotifyApi.searchArtists(artistName, { limit: 1 });
      if (artistData.body.artists.items.length === 0) return null;
      const artistId = artistData.body.artists.items[0].id;
      
      const albumsData = await this.spotifyApi.getArtistAlbums(artistId, { limit: 10 });
      return albumsData.body.items.map(album => ({
        name: album.name,
        image: album.images[0]?.url || null
      }));
    } catch (error) {
      console.error('Error fetching artist albums:', error);
      throw error;
    }
  }

  async getArtistTracks(artistName) {
    try {
      await this.ensureValidToken();
      const artistData = await this.spotifyApi.searchArtists(artistName, { limit: 1 });
      if (artistData.body.artists.items.length === 0) return null;
      const artistId = artistData.body.artists.items[0].id;
      
      const topTracksData = await this.spotifyApi.getArtistTopTracks(artistId, 'US');
      return topTracksData.body.tracks.map(track => ({
        name: track.name,
        image: track.album.images[0]?.url || null
      }));
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      throw error;
    }
  }

  async getAlbumTracks(albumName) {
    try {
      await this.ensureValidToken();
      const albumData = await this.spotifyApi.searchAlbums(albumName, { limit: 1 });
      if (albumData.body.albums.items.length === 0) return null;
      const albumId = albumData.body.albums.items[0].id;
      
      const tracksData = await this.spotifyApi.getAlbumTracks(albumId);
      return tracksData.body.items.map(track => ({
        name: track.name,
        image: albumData.body.albums.items[0].images[0]?.url || null
      }));
    } catch (error) {
      console.error('Error fetching album tracks:', error);
      throw error;
    }
  }
}

/*
(async () => {
  const spotifyService = new SpotifyService(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
  await spotifyService.authenticate();
  
  // Now tokens will be refreshed automatically when needed
  console.log(await spotifyService.searchTrack('Blinding Lights'));
  console.log(await spotifyService.getArtistAlbums('The Weeknd'));
  console.log(await spotifyService.getArtistTracks('The Weeknd'));
  console.log(await spotifyService.getAlbumTracks('After Hours'));
})();
*/
module.exports = SpotifyService;