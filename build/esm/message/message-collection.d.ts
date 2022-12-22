import { DocumentSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { IMessage, IMessageData, IMessageRecord } from './message.interface';
import { ChannelID } from '../channel/channel.interface';
import { UserID } from '../user/user.interface';
import firebase from 'firebase/compat';
import Unsubscribe = firebase.Unsubscribe;
export declare function postMessage(channel: ChannelID, sender: UserID, data: IMessageData, messageId?: string): Promise<IMessage>;
export declare function getMessages(channel: ChannelID, take?: number, after?: DocumentSnapshot): Promise<{
    messages: IMessage[];
    next: import("@firebase/firestore").QueryDocumentSnapshot<DocumentData>;
}>;
export declare function updateMessage(channel: ChannelID, messageId: string, changes: Partial<IMessageRecord>): Promise<void>;
export declare function subscribeMessage(channelId: ChannelID, callback: (docs: IMessage[], docsData: QuerySnapshot) => void): Promise<Unsubscribe>;
export declare function unsubscribeMessage(unsubscribe: Unsubscribe): Promise<void>;
//# sourceMappingURL=message-collection.d.ts.map