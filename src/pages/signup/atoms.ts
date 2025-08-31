import { atom } from 'jotai';

export const errorMessageAtom = atom<string>();
export const isValidAtom = atom(true);
export const validatingAtom = atom(false);
