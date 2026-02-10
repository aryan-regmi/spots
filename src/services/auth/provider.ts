import { createStore } from 'solid-js/store';
import { AuthServiceProvider } from './service';

/** Initalizes the authentication service provider. */
const initAuthProvider = () => {
  const [state, setState] = createStore({
    user: null,
    isReady: false,
  });
};
