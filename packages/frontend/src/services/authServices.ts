import { apiClient } from './apiClient';
import { User, AuthUser } from '../admin/providers/data/multiStakeholderDataProvider';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    refresh_token: string;
    user: AuthUser;
    expires_in: number;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordReset {
    token: string;
    password: string;
    confirm_password: string;
}

export class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthUser> {
        const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
        if (response.success) {
            return response.user;
        }
        throw new Error('Login failed');
    }

    async logout(): Promise<void> {
        await apiClient.post('/api/v1/auth/logout', {});
    }

    async getCurrentUser(): Promise<AuthUser> {
        return apiClient.get<AuthUser>('/api/v1/auth/me');
    }

    async refreshToken(): Promise<string> {
        const response = await apiClient.post<{ token: string }>('/api/v1/auth/refresh', {});
        return response.token;
    }

    async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
        await apiClient.post('/auth/password-reset/request', data);
    }

    async resetPassword(data: PasswordReset): Promise<void> {
        await apiClient.post('/auth/password-reset/confirm', data);
    }

    async verifyEmail(token: string): Promise<void> {
        await apiClient.post('/auth/verify-email', { token });
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await apiClient.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
        });
    }

    isAuthenticated(): boolean {
        return apiClient.isAuthenticated();
    }

    getStakeholderType(): string | null {
        return apiClient.getStakeholderType();
    }

    getTenantId(): string | null {
        return apiClient.getTenantId();
    }
}

export const authService = new AuthService();
