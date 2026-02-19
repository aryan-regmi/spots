import { StoreError } from '@/utils/tauriStore';

/** Represents an error in the application. */
export type SpotsError = {
  kind: SpotsErrorKind;
  message: string;
  info?: any;
};

/** The various error types in the application. */
export type SpotsErrorKind = StoreError;

/** Creates a new `SpotsError`. */
export function createError(kind: SpotsErrorKind, info?: any): SpotsError {
  if ('InvalidStore' in kind) {
    return {
      kind,
      message: kind.InvalidStore,
      info,
    };
  }

  if ('OpenStoreError' in kind) {
    return {
      kind,
      message: kind.OpenStoreError,
      info,
    };
  }

  // Exhaustiveness check
  const _exhaustive: never = kind;
  throw new Error(`Unhandled error kind: ${JSON.stringify(kind)}`);
}
