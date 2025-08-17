/** Asserts the given condtion. */
export function assert(
    condtion: unknown,
    message = 'Assertion failed'
): asserts condtion {
    if (!condtion) {
        throw new Error(message);
    }
}
