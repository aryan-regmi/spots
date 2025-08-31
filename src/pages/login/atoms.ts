import { atom } from 'jotai';

export const isValidAtom = atom({ username: true, password: true });
export const errorMessageAtom = atom<string>();
export const validatingAtom = atom(false);
