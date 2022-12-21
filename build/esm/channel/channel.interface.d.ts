import { UserID } from '../user/user.interface';
export declare type ChannelID = string | number;
export declare type FirmID = string | number;
export interface IChannelData {
    title: string;
    payload?: Record<string, any>;
    tags: string[];
    isMultiChannel?: boolean;
    composedChannels?: string[];
}
export interface IChannelRecord {
    id?: ChannelID;
    title: string;
    payload: string | null;
    tags: Record<string, boolean>;
    members: UserID[];
    updatedAt: number;
    isMultiChannel?: boolean;
    composedChannels?: string[];
}
export interface IChannel extends IChannelData {
    id: ChannelID;
    members: UserID[];
}
export interface IChannelMember {
    id: string;
    name: string;
    type: 'admin' | 'primary_owner' | 'member';
    unread: boolean;
    unreadMessageCounter?: number;
}
//# sourceMappingURL=channel.interface.d.ts.map