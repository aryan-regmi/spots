import { useEffect } from 'react';
import { FetcherWithComponents } from 'react-router-dom';

/** Represents the response from `actions`. */
export type ActionResponse<T> =
    | {
          ok: boolean;
          error?: string;
          data?: T;
      }
    | undefined;

/** Handles the response from an `action`. */
export default function useValidateAction<T>(
    fetcher: FetcherWithComponents<any>,
    onValid: (data: T) => void,
    onInvalid: (response: ActionResponse<T>) => void
) {
    useEffect(() => {
        let response: ActionResponse<T> = fetcher.data;
        if (fetcher.state === 'idle' && response?.ok && response.data) {
            onValid(response.data);
        } else if (response?.error) {
            onInvalid(response);
        }
    }, [fetcher.data]);
}
