import { fadeGlassyDurationAtom, fadeGlassyFallbackElementAtom } from '@/App';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

/** Resets the [FadeGlassy] fallback element.*/
export function useResetFadeGlassyFallback(
    fadeDuration = 50,
    loadingElement = undefined
) {
    const setFadeGlassyDuration = useSetAtom(fadeGlassyDurationAtom);
    const setFadeGlassyFallbackElement = useSetAtom(
        fadeGlassyFallbackElementAtom
    );
    return useEffect(() => {
        setFadeGlassyDuration(fadeDuration);
        setFadeGlassyFallbackElement(loadingElement);
    }, []);
}
