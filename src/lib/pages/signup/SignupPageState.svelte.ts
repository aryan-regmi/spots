import { passwordSchema, usernameSchema } from '@/utils/inputParsers';
import { type AuthContext } from '@/auth/types';
import type { NavContext } from '@/router/types';
import { getUserByUsername, hashPassword, insertUser } from '@/api/users';
import { createEndpoint } from '@/api/network';

/** The state of the signup page. */
export class SignupPageState {
  constructor() { }

  /** Determines if the input is being validated. */
  isValidating = $state(false);

  /** State of the username input. */
  usernameState = new InputState(async (username: string) => {
    this.isValidating = true;

    // Validate the schema
    const validationResult = usernameSchema.safeParse(username);
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        this.usernameState.errMsgs = [
          ...this.usernameState.errMsgs,
          issue.message,
        ];
      }
    }

    // Validate the username in the server
    if (validationResult.success && username.length > 0) {
      const user = await getUserByUsername(username);
      if (user) {
        this.usernameState.errMsgs = [
          ...this.usernameState.errMsgs,
          'Username already exists!',
        ];
        this.isValidating = false;
        return false;
      }
    }

    this.isValidating = false;
    return false;
  });

  /** State of the password input. */
  passwordState = new InputState(async (password: string) => {
    this.isValidating = true;

    // Validate the schema
    const validationResult = passwordSchema.safeParse(password);
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        this.passwordState.errMsgs = [
          ...this.passwordState.errMsgs,
          issue.message,
        ];
        return false;
      }
    }

    this.isValidating = false;
    return validationResult.success;
  });

  /** State of the confirm password input. */
  confirmPasswordState = new InputState(
    async ({
      password,
      confirmPassword,
    }: {
      password: string;
      confirmPassword: string;
    }) => {
      return confirmPassword === password;
    }
  );

  /** Validates the login (username and password). */
  validateAndLogin = async (
    authorize: AuthContext['authorize'],
    navigateTo: NavContext['navigateTo']
  ) => {
    this.isValidating = true;
    const usernameIsValid = await this.usernameState.validateInput();
    const passwordIsValid = await this.passwordState.validateInput();
    if (usernameIsValid && passwordIsValid) {
      // Hash password
      const hashedPassword = await hashPassword(this.passwordState.input);

      // Save user to database
      const newUser = await insertUser(
        this.usernameState.input,
        hashedPassword
      );

      // Create network endpoint
      await createEndpoint(newUser.id);

      // Authorize and redirect to dashboard
      await authorize(newUser);
      navigateTo('/dashboard', { replace: true });
    }
    this.isValidating = false;
  };
}

type ValidateFn = (args?: any) => Promise<boolean>;

class InputState {
  constructor(validateInput: ValidateFn) {
    this.validateInput = validateInput;
  }

  input = $state('');
  errMsgs = $state<string[]>([]);
  firstRender = true;
  validateInput;
}
