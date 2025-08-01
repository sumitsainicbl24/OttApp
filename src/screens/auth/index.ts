import { Platform } from 'react-native'
import AddPlaylistMobile from './AddPlaylist/mobile/AddPlaylist.mobile'
import AddPlaylistTV from './AddPlaylist/tv/AddPlaylist.tv'
import PlaylistProcessedMobile from './PlaylistProcessed/mobile/PlaylistProcessed.mobile'
import PlaylistProcessedTV from './PlaylistProcessed/tv/PlaylistProcessed.tv'


const AddPlaylist = Platform.isTV ? AddPlaylistTV : AddPlaylistMobile
const PlaylistProcessed = Platform.isTV ? PlaylistProcessedTV : PlaylistProcessedMobile

export {
  AddPlaylist,
  PlaylistProcessed,
}
