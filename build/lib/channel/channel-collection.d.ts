import { DocumentReference, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { ChannelID, IChannel, IChannelData, IChannelRecord } from './channel.interface';
import { UserID } from '../user/user.interface';
import firebase from 'firebase/compat';
import Unsubscribe = firebase.Unsubscribe;
import { DocumentData, WriteBatch } from '@firebase/firestore';
export declare function _docRef(id: ChannelID): DocumentReference;
export declare function batchRef(): WriteBatch;
export declare function createChannel(id: ChannelID, data: IChannelData): Promise<IChannel>;
export declare function getChannel(id: ChannelID): Promise<IChannel | null>;
export declare function findChannelsByTags(tags?: string[], take?: number, sortByLastUpdate?: boolean, after?: DocumentSnapshot): Promise<{
    channels: IChannel[];
    next: import("@firebase/firestore").QueryDocumentSnapshot<DocumentData>;
}>;
export declare function findChannelsByUser(userId: UserID, tags?: string[], take?: number, sortByLastUpdate?: boolean, after?: DocumentSnapshot): Promise<{
    channels: IChannel[];
    next: import("@firebase/firestore").QueryDocumentSnapshot<DocumentData>;
}>;
export declare function getChannelWithMultiChannels(id: ChannelID): Promise<[IChannel, IChannel[]] | null>;
export declare function getMultiChannelWithComposedChannels(id: ChannelID): Promise<[IChannel, IChannel[]] | null>;
export declare function updateUserNameForEachChannel(id: UserID, name: string, take?: number): Promise<void>;
/**
 * Function for updating multiple channel's docs with partial properties
 * @param props An array of channels containing the fields and values ​​to be updated in the document
 * @param updatedAt
 * @returns `Promise`
 */
export declare function updateBatchPartialChannels(records: Partial<IChannelRecord>[]): Promise<void>;
export declare function subscribeChannels(callback: (channels: IChannel[], channelData: QuerySnapshot) => void): Promise<Unsubscribe>;
export declare function subscribeChannel(channelId: string, callback: (channelData: DocumentSnapshot) => void): Promise<Unsubscribe>;
export declare function unsubscribeChannel(unsubscribe: Unsubscribe): Promise<void>;
//# sourceMappingURL=channel-collection.d.ts.map