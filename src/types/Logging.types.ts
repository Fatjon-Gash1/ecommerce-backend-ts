export interface AdminLogResponse {
    id: number;
    category: string;
    log: string;
    createdAt: Date;
    adminId: number;
}

export interface PlatformLogResponse {
    type: string;
    message: string;
    createdAt: Date;
}
