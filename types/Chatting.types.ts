export interface ChatroomResponse {
    id: number;
    type: 'one-on-one' | 'group' | 'support';
    groupAdmin?: number;
    name?: string;
    messages?: MessageResponse[];
}

export interface MessageResponse {
    id: number;
    senderId: number;
    message: string;
    systemMessage?: boolean;
    status?: 'original' | 'edited' | 'removed';
}
