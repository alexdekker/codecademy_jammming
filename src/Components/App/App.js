import React from 'react';
import { SearchBar } from '../SearchBar/SearchBar';
import { SearchResults } from '../SearchResults/SearchResults';
import { Playlist }  from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: [],
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);    
    this.updateSearchTerm = this.updateSearchTerm.bind(this);
  }
  addTrack(track) {
    // verifica se o id da track passada já existe na plalistTracks, se existir interrompe o médodo
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    let npl = this.state.playlistTracks;
    npl.push(track);
    this.setState({ playlistTracks: npl });
  }
  removeTrack(track) {
    // verifica se o id da track passada existe na plalistTracks, se existir continua
    let npl = this.state.playlistTracks;
    npl = npl.filter(item => item !== track);
    this.setState({ playlistTracks: npl });
  }
  updatePlaylistName(listName) {
    this.setState({ playlistName: listName });
  }
  savePlaylist() {
    let trackURIs = [];
    this.state.playlistTracks.map(track=>trackURIs.push(track.uri));
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: []
      })
    );
  }
  updateSearchTerm(term) {
    this.setState({ searchTerm: term });
  }
  search(term) {
    Spotify.search(term).then((tracks) => {
      console.log(tracks);
      this.setState({
        searchResults: tracks
      });
    });
  }
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} 
              onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist}/>
          </div>
        </div>
      </div>
    );
  }
  componentDidMount() {
    Spotify.getAccessToken();
  }
}

export default App;
