import { atom } from 'jotai';
import TrackMetadata from '@/utils/music/types/trackMetadata';

/** All of the tracks a user has access to. */
export const allTracksAtom = atom<TrackMetadata[]>([]);
