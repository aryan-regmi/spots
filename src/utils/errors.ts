/** Represents an error in the application. */
export type SpotsError = {
  kind: string;
  message: string;
  info?: any;
  _tag: '_SpotsError';
};

/** Interface that converts other errors into `SpotsError`. */
export interface IntoSpotsError<Self> {
  into: (self: Self) => SpotsError;
}
