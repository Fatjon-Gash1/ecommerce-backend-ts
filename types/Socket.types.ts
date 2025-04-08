export interface ClientToServerEvents {
    message: (message: string) => void;
}

export interface ServerToClientEvents {
    notification: (notification: object) => void;
    [key: `order:${string}`]: (msg: string | object) => void;
}

export interface AdminServerToClientEvents extends ServerToClientEvents {
    activeAdmins: (count: number) => void;
    activeCustomers: (count: number) => void;
    adminLog: (log: object) => void;
    platformLog: (log: object) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface UserData {
    userId: number;
    username: string;
    type: UserType;
}

type UserType = 'admin' | 'manager' | 'customer';
