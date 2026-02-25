import { AuthAPIError } from '@/api/auth';
import { StoreError } from '@/utils/tauriStore';

/** Represents an error in the application. */
export interface SpotsError {
  kind: SpotsErrorKind;
  info?: any;
}

/** The various error types in the application. */
export type SpotsErrorKind = StoreError | AuthAPIError;

/** Creates a new `SpotsError`. */
export function createError(kind: SpotsErrorKind, info?: any): SpotsError {
  if ('InvalidStore' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('OpenError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('AddEntryError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('GetValueError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('RemoveEntryError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('SaveError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('CloseError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('InvalidRegisterUserFormData' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('InvalidLoginUserFormData' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('RegisterUserError' in kind) {
    return {
      kind,
      info,
    };
  }

  if ('LoginUserError' in kind) {
    return {
      kind,
      info,
    };
  }

  // Exhaustiveness check
  const _exhaustive: never = kind;
  throw new Error(`Unhandled error kind: ${JSON.stringify(kind)}`);
}

/** Extracts error information into strings. */
export function extractError(err: SpotsError) {
  const errString = JSON.stringify(err).split(':');
  const kind = errString[1].split('{')[1].replace('"', '').replace('"', '');
  console.log(kind);
  const message = errString[2].split('}')[0].replace('"', '').replace('"', '');
  console.log(message);
  const data = {
    kind,
    message,
    info: JSON.stringify(err.info),
  };
  return data;
}
