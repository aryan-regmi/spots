/// Represents an API response.
export type Response<T> = {
  /// Whether this represents a succesful response or an error response.
  success: boolean;

  /// The actual response.
  value: T;
};

/// Represents an error response.
export type ErrorResponse = Response<{ kind: string; message: string }>;
