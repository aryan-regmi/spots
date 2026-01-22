export type User = {
  username: string;
  hashedPassword: string;
  authToken: string;
};

export async function authenticateUser(
  username: string,
  password: string
): Promise<User | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // NOTE: Artificial delay

  if (username === 'user' && password === '1') {
    let user = {
      username: username,
      hashedPassword: password,
      authToken: username + password,
    };
    sessionStorage.setItem('auth-token', user.authToken);
    return user;
  }
}
