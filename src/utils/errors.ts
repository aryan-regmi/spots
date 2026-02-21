import { AuthAPIError } from '@/api/auth';
import { StoreError } from '@/utils/tauriStore';

/** Represents an error in the application. */
export interface SpotsError {
  kind: SpotsErrorKind;
  message: string;
  info?: any;
}

/** The various error types in the application. */
export type SpotsErrorKind = StoreError | AuthAPIError;

/** Creates a new `SpotsError`. */
export function createError(kind: SpotsErrorKind, info?: any): SpotsError {
  if ('InvalidStore' in kind) {
    return {
      kind,
      message: kind.InvalidStore,
      info,
    };
  }

  if ('OpenError' in kind) {
    return {
      kind,
      message: kind.OpenError,
      info,
    };
  }

  if ('AddEntryError' in kind) {
    return {
      kind,
      message: kind.AddEntryError,
      info,
    };
  }

  if ('GetValueError' in kind) {
    return {
      kind,
      message: kind.GetValueError,
      info,
    };
  }

  if ('RemoveEntryError' in kind) {
    return {
      kind,
      message: kind.RemoveEntryError,
      info,
    };
  }

  if ('SaveError' in kind) {
    return {
      kind,
      message: kind.SaveError,
      info,
    };
  }

  if ('CloseError' in kind) {
    return {
      kind,
      message: kind.CloseError,
      info,
    };
  }

  if ('InvalidRegisterUserFormData' in kind) {
    return {
      kind,
      message: kind.InvalidRegisterUserFormData,
      info,
    };
  }

  if ('InvalidLoginUserFormData' in kind) {
    return {
      kind,
      message: kind.InvalidLoginUserFormData,
      info,
    };
  }

  if ('RegisterUserError' in kind) {
    return {
      kind,
      message: kind.RegisterUserError,
      info,
    };
  }

  if ('LoginUserError' in kind) {
    return {
      kind,
      message: kind.LoginUserError,
      info,
    };
  }

  // Exhaustiveness check
  const _exhaustive: never = kind;
  throw new Error(`Unhandled error kind: ${JSON.stringify(kind)}`);
}

/** Turns the error into a string. */
export function errorToString(err: SpotsError) {
  return `${err.kind}: ${err.message}: ${JSON.stringify(err.info)}`;
}
