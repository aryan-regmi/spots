import { createContext } from 'react';

type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser?: string;
    authorize: (username: string) => Promise<void>;
    unauthorize: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
