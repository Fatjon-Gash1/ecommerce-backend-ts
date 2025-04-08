export interface AdminResponse {
    id?: number;
    role?: 'admin' | 'manager';
    createdAt?: Date;
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}
