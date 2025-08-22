declare module 'argon2-wasm' {
    export interface Argon2HashOptions {
        pass: string | Uint8Array;
        salt: string | Uint8Array;
        time?: number;
        mem?: number;
        hashLen?: number;
        parallelism?: number;
        type?: number;
    }

    export interface Argon2HashResult {
        hash: Uint8Array;
        encoded: string;
    }

    export interface VerifyOptions {
        pass: string | Uint8Array;
        encoded: string;
    }

    export interface VerifyResult {
        verified: boolean;
    }

    export function hash(options: Argon2HashOptions): Promise<Argon2HashResult>;
}
