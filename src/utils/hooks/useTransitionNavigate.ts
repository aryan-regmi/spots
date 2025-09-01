import { fadeInAtom, showOutletAtom } from '@/App';
import { useAtom } from 'jotai';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';

/** Delays navigation until fade-out completes. */
export default function useTransitionNavigate(duration = 100) {
    const navigate = useNavigate();
    const [, setFadeIn] = useAtom(fadeInAtom);
    const [, setShowOutlet] = useAtom(showOutletAtom);

    return async (to: To | number, options?: NavigateOptions) => {
        // Start fade out
        setFadeIn(false);
        setShowOutlet(false);

        // Delay navigation to give time for fade out
        setTimeout(() => {
            typeof to === 'number' ? navigate(to) : navigate(to, options);
        }, duration);
    };
}
