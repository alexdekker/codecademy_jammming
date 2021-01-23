let accessToken;
const clientId='4874ecd18dc6432bbc36570aa4cb8a81';
const redirectUri='http://dkr-jammming.surge.sh';

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      // this creates the parameters allowing us to grab new access token when it expires 
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
      console.log('sem token, redirecionando para: ' + accessUrl);
      console.log('window.location.href = ' + window.location.href)
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
        return response.json();
      }).then((jsonResponse) => {
          if (!jsonResponse.tracks) {
            console.log('jsonResponse está vazio');
            console.log('term = ' + term);
            console.log('acTkn = ' + accessToken);
            console.log('jsonResponse.id = ' + jsonResponse.id);
            return [];
          }
          return jsonResponse.tracks.items.map((track) => {
            return {
              id: track.id,
              name: track.name,
              artist: track.artists[0].name,
              album: track.album.name,
              uri: track.uri
            };
          })
        });
  },
  savePlaylist(playlistName, trackURIs) {
    if (!playlistName || !Array.isArray(trackURIs) || !trackURIs.length) return;
    const acTkn = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${acTkn}` }
    let userId;
    return fetch('https://api.spotify.com/v1/me', { headers: headers }
      ).then(response => response.json()
      ).then(jsonResponse => {
          userId = jsonResponse.id
          return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ name: playlistName })
          }).then(response => response.json()
          ).then((jsonResponse) => {
              const playlistId = jsonResponse.id;
              return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ uris: trackURIs })
              })
          });
      });
  }
};

export default Spotify;