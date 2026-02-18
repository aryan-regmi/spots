/// DTO returned from the `/login` endpoint.
export type LoginUserResponseDto = {
  status: string;
  user: FilterUserDto;
  token: string;
};

/// DTO for filtered user info.
export type FilterUserDto = {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};
