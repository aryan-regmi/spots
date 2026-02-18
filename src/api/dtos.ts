/// The DTO used to register a user.
export type RegisterUserDto = {
  username: string;
  password: string;
  passwordConfirm: string;
};

/// The DTO used to login a user.
export type LoginUserDto = {
  username: string;
  password: string;
};

/// DTO returned from the `/login` endpoint.
export type LoginUserResponseDto = {
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
