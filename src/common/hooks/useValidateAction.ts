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
    onValid: (data: T) => void,
    onInvalid: (response: ActionResponse<T, E>) => void
) {
    useEffect(() => {
        let response: ActionResponse<T, E> = fetcher.data;
        if (fetcher.state === 'idle' && response?.ok && response.data) {
            onValid(response.data);
        } else if (response?.error) {
            onInvalid(response);
        }
    }, [fetcher.data]);
}
