import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  getDocs,
  getFirestore,
  limit, onSnapshot,
  query,
  QueryConstraint,
  setDoc,
  startAfter,
  where,
  QuerySnapshot,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { ChannelID, IChannel, IChannelData, IChannelMember, IChannelRecord } from './channel.interface';
import { docWithId } from '../_utils/firebase-snapshot.utils';
import { UserID } from '../user/user.interface';
import { arrayToObject, objectToArray } from '../_utils/array.utils';
import firebase from 'firebase/compat';
import Unsubscribe = firebase.Unsubscribe;
import { DocumentData, documentId, WriteBatch } from '@firebase/firestore';
import { IChannelLastMessage } from '../message/message.interface';
import { splitIntoChunks } from '../_utils/chunks.util';

const _collectionPath = '/channels';

function _collectionRef(): CollectionReference {
    const db = getFirestore();
    return collection(db, _collectionPath);
}

export function _docRef(id: ChannelID): DocumentReference {
    const db = getFirestore();
    return doc(db, `${_collectionPath}/${id}`);
}

export function batchRef(): WriteBatch {
  const db = getFirestore();
  return writeBatch(db);
}

function channelRecordToChannel(record: IChannelRecord, id: ChannelID): IChannel {
    let payload = null;
    try {
        payload = JSON.parse(record.payload || 'null');
    } catch {
    }
    return {
        id: id,
        title: record.title,
        payload: payload,
        tags: objectToArray(record.tags),
        members: record.members,
        isMultiChannel: !!record.isMultiChannel,
        ...(record.isMultiChannel && {
            composedChannels: record.composedChannels
        }),
    };
}

export async function createChannel(id: ChannelID, data: IChannelData): Promise<IChannel> {
    // TODO: Check if channel already exists
    const tags = arrayToObject(data.tags);
    const channel: IChannelRecord = {
        title: data.title,
        payload: JSON.stringify(data.payload || null),
        tags,
        members: [],
        updatedAt: Date.now(),
        isMultiChannel: !!data.isMultiChannel,
        ...(data.isMultiChannel && {
            composedChannels: data.composedChannels
        }),
    };
    await setDoc(_docRef(id), channel);
    return channelRecordToChannel(channel, id);
}

export async function getChannel(id: ChannelID): Promise<IChannel | null> {
    const doc = await getDoc(_docRef(id));
    if (!doc.exists()) {
        return null;
    }
    const channel: IChannelRecord = docWithId(doc);
    return channelRecordToChannel(channel, doc.id);
}

export async function findChannelsByTags(tags: string[] = [], take = 10, sortByLastUpdate = false, after?: DocumentSnapshot) {
    const queryConstraints = [
        limit(take),
    ];
    if (sortByLastUpdate) {
        queryConstraints.push(
            orderBy('updatedAt', 'desc')
        );
    }
    if (after) {
        queryConstraints.push(startAfter(after));
    }
    for (const tag of tags) {
        queryConstraints.push(
            where(`tags.${tag}`, '==', true)
        )
    }
    return _findByQuery(queryConstraints);
}

export async function findChannelsByUser(userId: UserID, tags: string[] = [], take = 10, sortByLastUpdate = false, after?: DocumentSnapshot) {
    const queryConstraints = [
        where('members', 'array-contains', userId),
        limit(take),
    ];
    if (sortByLastUpdate) {
        queryConstraints.push(
            orderBy('updatedAt', 'desc')
        );
    }
    if (after) {
        queryConstraints.push(startAfter(after));
    }
    for (const tag of tags) {
        queryConstraints.push(
            where(`tags.${tag}`, '==', true)
        )
    }
    return _findByQuery(queryConstraints);
}

export async function getChannelWithMultiChannels(id: ChannelID): Promise<[IChannel, IChannel[]] | null> {
    const doc = await getDoc(_docRef(id));
    if (!doc.exists()) {
        return null;
    }
    const _channel: IChannelRecord = docWithId(doc);
    const _multiChannels = await _findByQuery([
        where('composedChannels', 'array-contains', doc.id),
    ]);
    return [
        channelRecordToChannel(_channel, doc.id),
        _multiChannels.channels
    ];
}

export async function getMultiChannelWithComposedChannels(id: ChannelID): Promise<[IChannel, IChannel[]] | null> {
    const doc = await getDoc(_docRef(id));
    if (!doc.exists()) {
        return null;
    }
    const multiChannel: IChannelRecord = docWithId(doc);
    if (!multiChannel.composedChannels) {
        return [
            channelRecordToChannel(multiChannel, doc.id),
            []
        ]
    }
    let composedChannelsPromises: Promise<DocumentSnapshot<DocumentData>>[] = []
    multiChannel.composedChannels.forEach(_id => {
        composedChannelsPromises.push(getDoc(_docRef(_id)));
    })
    return Promise.all(composedChannelsPromises).then(list => {
        return [
            channelRecordToChannel(multiChannel, doc.id),
            list.filter(ch => ch.exists()).map(ch => channelRecordToChannel(docWithId(ch), ch.id) )
        ];
    });
}

export async function updateUserNameForEachChannel(id: UserID, name: string, take = 1000): Promise<void> {
    const batch = batchRef();
    const queryConstraints = [
        where('members', 'array-contains', id),
        limit(take),
    ];
    const channels = await _findByQuery(queryConstraints);
    if(!channels.channels.length){
        return;
    }
    channels.channels.forEach((channel) => {
        if (channel && channel.payload && Object.keys(channel.payload).length !== 0) {
            const _members = channel.payload.members as IChannelMember[];
            const targetUserIndx = _members.findIndex(m => Number(m.id) === Number(id));
            if (targetUserIndx === -1) {
              return;
            }
            _members[targetUserIndx].name = name;
            const _lastMessage = channel.payload.lastMessage ? <IChannelLastMessage>channel.payload.lastMessage : null;
            if (_lastMessage && _lastMessage.sender && Number(_lastMessage.sender.id) === Number(id)) {
              _lastMessage.sender.name = name;
            }
            batch.update(_docRef(channel.id), {
                payload: JSON.stringify(channel.payload)
            });
        }
    })
    await batch.commit();
}

/**
 * Function for updating multiple channel's docs with partial properties
 * @param props An array of channels containing the fields and values ​​to be updated in the document
 * @param updatedAt 
 * @returns `Promise`
 */
export async function updateBatchPartialChannels(records: Partial<IChannelRecord>[]): Promise<void> {
    const batch = batchRef();
    records.forEach(rec => {
      if (rec.id && Object.keys(rec).length > 1) {
        const docId = rec.id;
        delete rec.id;
        batch.update(_docRef(docId), { ...rec });
      }
    });
    await batch.commit();
}

/**
 * Function for get channel's list by spliting into chunks
 * @param ids An array of channel's ids
 * @param take
 * @returns `Promise`
 */
export async function getChannelsByIDs(ids: string[], take: number = 1000): Promise<IChannel[]> {
    if (!ids.length) {
        return new Promise(exec => exec([]));
    }
    const chunkPromises: Promise<any>[] = [];
    splitIntoChunks<string>(ids).forEach(chunkIds => {
        const queryConstraints = [
            limit(take),
            where(documentId(), 'in', chunkIds),
        ];
        chunkPromises.push(_findByQuery(queryConstraints));
    });
    return Promise.all(chunkPromises).then(data => {
        // @ts-ignore
        return data.flatMap(chunk => chunk.channels);
    }).catch(() => {
        return [];
    });
}

export async function findMultiChannelByComposedChannels(composedIds: string[]): Promise<IChannel | null> {
    if (!composedIds.length) {
        return null;
    }
    const queryConstraints = [
        limit(1000),
        where('isMultiChannel', '==', true),
        where('composedChannels', 'array-contains', composedIds[0])
    ];
    const _multiChannels = await _findByQuery(queryConstraints);
    if (!_multiChannels.channels.length) {
        return null;
    }
    return _multiChannels.channels.find(ch => (
        ch.composedChannels?.length === composedIds!.length && 
        composedIds!.every(c => ch.composedChannels?.includes(c))
    )) || null;
}

async function _findByQuery(queryConstraints: QueryConstraint[]) {
    const q = query(_collectionRef(), ...queryConstraints);
    const docs = await getDocs(q).then(response => response.docs);
    return {
        // @ts-ignore
        channels: docs.map(docWithId).map(doc => channelRecordToChannel(doc, doc.id)),
        next: docs[docs.length - 1],
    };
}

export async function subscribeChannels(callback: (channels: IChannel[], channelData: QuerySnapshot) => void): Promise<Unsubscribe> {
    return onSnapshot(_collectionRef(), (channelData) => {
        let channels: IChannel[] = [];
        // Check that this is not the first snapshot request, but adding a new document to the listener
        if (channelData.docs.length !== channelData.docChanges().length) {
            // @ts-ignore
            channels = channelData.docChanges().map(docData => docData.doc).map(docWithId).map(doc => channelRecordToChannel(doc, doc.id));
        }
        callback(channels, channelData);
    });
}

export async function subscribeChannel(channelId: string, callback: (channelData: DocumentSnapshot) => void): Promise<Unsubscribe> {
  return onSnapshot(_docRef(channelId), (channelData) => {
    callback(channelData);
  });
}

export async function unsubscribeChannel(unsubscribe: Unsubscribe): Promise<void> {
    unsubscribe();
}
