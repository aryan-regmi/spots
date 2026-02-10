import { AuthService } from '@/services/auth/service';
import {
  DBService,
  PlaylistRecord,
  TrackRecord,
} from '@/services/database/service';
import {
  PLAYLISTS_STORE_NAME,
  TRACKS_STORE_NAME,
} from '@/services/database/indexDBProvider';
import { okAsync } from 'neverthrow';
import { useLogger } from '../logger/provider';

// TODO: Stream music instead of directly downloading?
//  - Tauri events from the backend to signal when track/playlist is ready

/** Loads the music library from the database. */
async function loadMusicLibrary<DB>(db: DBService<DB>, auth: AuthService) {
  const logger = useLogger();
  if (!db.state.isReady || !auth.state.isReady || auth.state.user === null) {
    return null;
  }
  const user = auth.state.user;
  logger.info('Loading music library');

  // Get tracks from DB
  const tracksData = await db
    .readAllRecords<TrackRecord>(TRACKS_STORE_NAME)
    .andThen((tracks) => {
      const allTracks = tracks;
      const currentTrack = tracks.find((t) => t.isCurrent === true);
      return okAsync({ allTracks, currentTrack });
    })
    .match(
      (data) => {
        logger.info('Tracks loaded');
        return data;
      },
      (err) => {
        logger.error(err.kind, err.message, err.info);
        return null;
      }
    );

  // Get playlists from DB
  const playlistsData = await db
    .readAllRecords<PlaylistRecord>(PLAYLISTS_STORE_NAME)
    .andThen((playlists) => {
      // Get only downloaded/pinned playlists
      const allPlaylists = playlists.filter(
        (p) => p.pinned.includes(user.id) || p.download.includes(user.id)
      );
      const currentPlaylist = playlists.find((p) => p.isCurrent === true);
      return okAsync({ allPlaylists, currentPlaylist });
    })
    .match(
      (data) => {
        logger.info('Playlists loaded');
        return data;
      },
      (err) => {
        logger.error(err.kind, err.message, err.info);
        return null;
      }
    );

  return { tracksData, playlistsData };
}
