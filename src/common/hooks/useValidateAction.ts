import { useEffect } from 'react';
import { FetcherWithComponents } from 'react-router-dom';

/** Represents the response from `actions`. */
export type ActionResponse<T, E = string> =
    | {
          ok: boolean;
          error?: E;
          data?: T;
      }
    | undefined;

/** Handles the response from an `action`. */
export default function useValidateAction<T, E = string>(
    fetcher: FetcherWithComponents<any>,
    onValid: (data: T) => Promise<void>,
    onInvalid: (response: ActionResponse<T, E>) => Promise<void>
) {
    useEffect(() => {
        async function run() {
            let response: ActionResponse<T, E> = fetcher.data;
            if (fetcher.state === 'idle' && response?.ok && response.data) {
                await onValid(response.data);
            } else if (response?.error) {
                await onInvalid(response);
            }
        }
        run();
    }, [fetcher.state, fetcher.data]);
}
