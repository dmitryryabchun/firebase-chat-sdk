import { UserID } from '../user/user.interface';

export type ChannelID = string | number;
export type FirmID = string | number;

export interface IChannelData {
    title: string;
    payload?: Record<string, any>;
    tags: string[];
    isMultiChannel?: boolean;
    composedChannels?: string[];
}

export interface IChannelRecord {
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
