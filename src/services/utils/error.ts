/** The error returned from a service. */
export interface ServiceError extends Error {
  /** The type/kind of the error. */
  kind: string;

  /** The error message. */
  message: string;

  /** Any addition error information. */
  info?: any;
}
