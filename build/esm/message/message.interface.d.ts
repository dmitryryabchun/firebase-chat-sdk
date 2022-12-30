import { IChannelMember } from '../channel/channel.interface';
import { UserID } from '../user/user.interface';
export interface IMessageData {
    message: string;
    payload?: Record<string, any>;
    tags: string[];
}
export interface IMessageRecord {
    message: string;
    payload: string;
    sender: UserID;
    createdAt: number;
    isDeleted?: boolean;
    tags: string[];
}
export interface IMessage extends IMessageData {
    id: string;
    sender: UserID;
    createdAt: number;
    isDeleted?: boolean;
}
export interface IChannelLastMessage {
    createdAt: number;
    id: string;
    message: string;
    sender: IChannelMember;
    isSelfMessage: boolean;
}
//# sourceMappingURL=message.interface.d.ts.map