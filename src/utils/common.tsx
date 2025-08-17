/** Asserts the given condtion. */
export function assert(
    condtion: unknown,
    message = 'Assertion failed'
): asserts condtion {
    if (!condtion) {
        // alert(message);
        throw new Error(message);
    }
}

/** The data returned by the `LoginForm` component. */
export type UserData = {
    username: string;
    password: string;
};
