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

  
  async getPlaylistTracks(playlistId) {
    try {
      const data = await this.spotifyApi.getPlaylistTracks(playlistId, { limit: 50 });
      return data.body.items.map((item) => ({
        name: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
      }));
    } catch (err) {
      console.error(`Error fetching playlist ${playlistId}:`, err);
      return [];
    }
  }
  /*
  async getNewReleases(limit = 10) {
  
    try {
      const data = await this.spotifyApi.getNewReleases({ limit });
      const albums = data.body.albums.items.map((album) => ({
        name: album.name,
        artist: album.artists.map((a) => a.name).join(", "),
        image: album.images[0]?.url || "No image available",
      }));
  
      console.log("\n🔥 New Releases 🔥");
      albums.forEach((album, index) => {
        console.log(`${index + 1}. 🎵 ${album.name} - ${album.artist}`);
        console.log(`   🖼  Image: ${album.image}\n`);
      });
  
      return albums;
    } catch (err) {
      console.error("Error fetching new releases:", err);
      return [];
    }
  }
    */
  async getAlbumPopularity(albumId) {
    try {
      const tracks = await this.spotifyApi.getAlbumTracks(albumId, { limit: 1 });
      if (tracks.body.items.length > 0) {
        const track = await this.spotifyApi.getTrack(tracks.body.items[0].id);
        return track.body.popularity;
      }
    } catch (err) {
      console.error("Error fetching album popularity:", err);
    }
    return 0;
  }
  
  // Fetch and Sort New Releases by Popularity
  async getSortedNewReleases() {
  
    try {
      const data = await this.spotifyApi.getNewReleases({ limit: 50 });
      let albums = await Promise.all(
        data.body.albums.items.map(async (album) => {
          const popularity = await this.getAlbumPopularity(album.id);
          return {
            name: album.name,
            artist: album.artists.map((a) => a.name).join(", "),
            image: album.images[0]?.url || "No image available",
            popularity: popularity,
          };
        })
      );
  
      // Sort by popularity (descending)
      albums.sort((a, b) => b.popularity - a.popularity);
      const top10 = albums.slice(0, 10);
  
      console.log("\n🔥 Top 10 New Releases by Popularity 🔥");
      top10.forEach((album, index) => {
        console.log(`${index + 1}. 🎵 ${album.name} - ${album.artist}`);
        console.log(`   ⭐ Popularity: ${album.popularity}`);
        console.log(`   🖼  Image: ${album.image}\n`);
      });
  
      return top10;
    } catch (err) {
      console.error("Error fetching sorted new releases:", err);
      return [];
    }
  }

}


(async () => {
  const spotifyService = new SpotifyService(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
  await spotifyService.authenticate();
  //console.log(await spotifyService.getPlaylistTracks("2YRe7HRKNRvXdJBp9nXFza"))
  //console.log(await spotifyService.fetchPlaylistDetails("Top 50 - Global"))
  // Now tokens will be refreshed automatically when needed
  /*
  console.log(await spotifyService.searchTrack('Blinding Lights'));
  console.log(await spotifyService.getArtistAlbums('The Weeknd'));
  console.log(await spotifyService.getArtistTracks('The Weeknd'));
  console.log(await spotifyService.getAlbumTracks('After Hours'));
  */
})();
module.exports = SpotifyService;