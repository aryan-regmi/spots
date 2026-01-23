export type AuthUser = {
  username: string;
};

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // NOTE: Artificial delay

  if (username === 'user' && password === '1') {
    let user = {
      username: username,
      hashedPassword: password,
    };
    localStorage.setItem('auth-token', user.username);
    return user;
  }

  return null;
}
