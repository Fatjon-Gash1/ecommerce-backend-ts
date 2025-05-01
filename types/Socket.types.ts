export interface ClientToServerEvents {
    message_request: (
        message: string,
        senderUserId: number,
        ...targetUserIds: number[]
    ) => void;
    message: (
        senderUserId: number,
        message: string,
        targetUserId: number,
        chatroomId?: number,
        support?: number
    ) => void;
    groupMessage: (
        message: string,
        senderUserId: number,
        roomId: string
    ) => void;
    createGroup: (creatorUserId: number, ...memberUserIds: number[]) => void;
    joinUserToGroup: (roomId: string) => void;
    addMemberToGroup: (
        ownerUserId: number,
        groupName: string,
        memberUserId: number
    ) => void;
    groupLeave: (userId: number, roomId: string, kicked?: boolean) => void;
    kickGroupMember: (
        ownerUserId: number,
        kickedUserId: number,
        roomId: string
    ) => void;
    deleteGroup: (
        ownerUserId: number,
        groupName: string,
        ...memberUserIds: number[]
    ) => void;
    updateGroupName: (chatroomId: number, newName: string) => void;
    viewMessage: (
        viewerUserId: number,
        targetUserId: number,
        chatroomId: number,
        messageSenderId: number,
        oneOnOne?: boolean
    ) => void;
    updateMessage: (
        messageId: number,
        newMessage: string,
        targetUserId?: number,
        chatroomId?: number
    ) => void;
    removeMessage: (
        messageId: number,
        targetUserId?: number,
        chatroomId?: number
    ) => void;
    contactSupport: (
        senderUserType: UserType,
        senderUserId: number,
        message: string
    ) => void;
    detachSupportAgent: (agentId: number) => void;
    groupTyping: (typerUserId: number, chatroomId: number) => void;
    groupTypingStopped: (typerUserId: number, chatroomId: number) => void;
    typing: (typerUserId: number, targetUserId: number) => void;
    typingStopped: (typerUserId: number, targetUserId: number) => void;
    markSupportTicketAsClosed: (
        chatroomId: number,
        targetUserId: number,
        resolved?: boolean
    ) => void;
}

export interface ServerToClientEvents {
    notification: (notification: object) => void;
    message: (payload: {
        from: number;
        message: string;
        chatroomId: number;
    }) => void;
    groupJoin: (messages: string[], groupName: string) => void;
    groupMessage: (
        message: string,
        senderUserId: number,
        roomId: string
    ) => void;
    [key: `order:${string}`]: (msg: string | object) => void;
    kickedFromGroup: (roomId: string, message: string) => void;
    addedGroupMember: (message: string) => void;
    groupDeleted: (groupName: string) => void;
    messageUpdated: (messageId: number, newMessage: string) => void;
    messageRemoved: (messageId: number) => void;
    groupNameUpdated: (chatroomId: number, newName: string) => void;
    groupSystemMessage: (message: string) => void;
    [key: `lastMessageViews:${string}`]: (
        viewers: string[],
        messageSenderId: number
    ) => void;
    ticketClosed: (chatroomId: number, resolved?: boolean) => void;
    groupTyping: (typerUserId: number) => void;
    groupTypingStopped: (typerUserId: number) => void;
    typing: (typerUserId: number) => void;
    typingStopped: (typerUserId: number) => void;
}

export interface AdminServerToClientEvents extends ServerToClientEvents {
    activeAdmins: (count: number) => void;
    activeSupport: (count: number) => void;
    activeCouriers: (count: number) => void;
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

type UserType = 'admin' | 'manager' | 'customer' | 'support';
