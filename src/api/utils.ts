/** The status of an API response. */
export type ApiResponseStatus =
  | 'Success'
  | 'Failure'
  | 'Started'
  | 'Pending'
  | 'Completed';

/** An API response. */
export type ApiResponse<T> = {
  status: ApiResponseStatus;
  value: T;
};

/** An error response from the API. */
export type ApiErrorResponse = ApiResponse<string> & {
  status: 'Failure';
};
