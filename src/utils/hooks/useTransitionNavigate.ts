import { fadeDurationAtom, fadeInAtom, showOutletAtom } from '@/App';
import { useAtomValue, useSetAtom } from 'jotai';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';

/** Delays navigation until fade-out completes. */
export default function useTransitionNavigate() {
    const navigate = useNavigate();
    const setFadeIn = useSetAtom(fadeInAtom);
    const setShowOutlet = useSetAtom(showOutletAtom);
    const fadeDuration = useAtomValue(fadeDurationAtom);

    return async (to: To | number, options?: NavigateOptions) => {
        // Start fade out
        setFadeIn(false);
        setShowOutlet(false);

        // Delay navigation to give time for fade out
        setTimeout(() => {
            typeof to === 'number' ? navigate(to) : navigate(to, options);
        }, fadeDuration);
    };
}
