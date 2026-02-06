/** Returns an handler that adds selected files to the music library.
 *
 * # Note
 * This must be attached to an <input type="file" /> element.
 * */
export function TrackImporter() {
  const musicLibService = useMusicLibraryService();

  /** Parses the given file as an audio file. */
  const parseAudioFile = (file: File) =>
    Effect.tryPromise({
      try: () => parseBlob(file),
      catch: (e) => console.error(e),
    });

  /** Extracts the track image from the audio blob.*/
  const extractTrackImg = (audioBlob: ICommonTagsResult) =>
    Effect.gen(function* () {
      if (audioBlob.picture && audioBlob.picture.length > 0) {
        const picture = audioBlob.picture[0];
        const base64String = btoa(
          String.fromCharCode(...new Uint8Array(picture.data))
        );
        const imgSrc = `data:${picture.format};base64,${base64String}`;
        return imgSrc;
      }
    });

  /** Adds the selected files to the music library. */
  const addTracksToMusicLibrary: JSX.EventHandler<HTMLInputElement, Event> = (
    e
  ) => {
    const program = Effect.gen(function* () {
      const event = e.target as HTMLInputElement;
      const files = Array.from(event.files || []);

      files.forEach((file) =>
        Effect.gen(function* () {
          // Add track to library
          const audioBlob = yield* parseAudioFile(file);
          const imgSrc = yield* extractTrackImg(audioBlob.common);
          const fileBuffer = yield* Effect.tryPromise({
            try: () => file.arrayBuffer(),
            catch: console.error,
          });
          const trackSrc = arrayBufferToBase64(fileBuffer);
          const trackID = yield* musicLibService.addTrack({
            src: trackSrc,
            imgSrc,
            title: audioBlob.common.title || file.name,
            artist: audioBlob.common.artist,
            album: audioBlob.common.album,
          });

          // Add track to `All Songs` playlist
          yield* musicLibService.addTrackToPlaylist(trackID, ALL_TRACKS.id);
        }).pipe(Effect.runFork)
      );
    });
    Effect.runFork(program);
  };

  return {
    parseAudioFile,
    extractTrackImg,
    addTracksToMusicLibrary,
  };
}
