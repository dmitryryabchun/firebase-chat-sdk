import {
    addDoc,
    collection,
    CollectionReference,
    doc,
    DocumentReference,
    DocumentSnapshot,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    startAfter,
    onSnapshot,
    DocumentData,
    QuerySnapshot,
    updateDoc,
    setDoc
} from 'firebase/firestore';
import {IMessage, IMessageData, IMessageRecord} from './message.interface';
import {ChannelID} from '../channel/channel.interface';
import {UserID} from '../user/user.interface';
import {docWithId} from '../_utils/firebase-snapshot.utils';
import firebase from 'firebase/compat';
import Unsubscribe = firebase.Unsubscribe;

function _collectionPath(channelId: ChannelID): string {
    return `/channels/${channelId}/messages`;
}

function _docRef(channelId: ChannelID, messageId: string): DocumentReference {
    const db = getFirestore();
    return doc(db, `${_collectionPath(channelId)}/${messageId}`);
}

function _collectionRef(channelId: ChannelID): CollectionReference {
    const db = getFirestore();
    return collection(db, _collectionPath(channelId));
}

function messageRecordToChannel(record: IMessageRecord, id: string): IMessage {
    let payload = null;
    try {
        payload = JSON.parse(record.payload || 'null');
    } catch {
    }
    return {
        id: id,
        message: record.message,
        payload: payload,
        createdAt: record.createdAt,
        sender: record.sender,
        isDeleted: record?.isDeleted || false,
        tags: record.tags || [],
    };
}

export async function postMessage(channel: ChannelID, sender: UserID, data: IMessageData, messageId?: string): Promise<IMessage> {
    // TODO: Check if channel exists
    // TODO: Check if sender is a channel member
    const message: IMessageRecord = {
        message: data.message,
        payload: JSON.stringify(data.payload || null),
        sender: sender,
        createdAt: Date.now(),
        isDeleted: false,
        tags: data.tags || [],
    };
    if (messageId) {
        await setDoc(doc(getFirestore(), _collectionPath(channel), messageId), message);
        return messageRecordToChannel(message, messageId);
    } else {
        const newDoc = await addDoc(_collectionRef(channel), message);
        return messageRecordToChannel(message, newDoc.id);
    }
}

export async function getMessages(channel: ChannelID, take: number = 10, after?: DocumentSnapshot) {
    const queryConstraints = [
        limit(take),
        orderBy('createdAt', 'desc')
    ];
    if (after) {
        queryConstraints.push(startAfter(after));
    }
    const q = query(_collectionRef(channel), ...queryConstraints);
    const docs = await getDocs(q).then(response => response.docs);
    return {
        // @ts-ignore
        messages: docs.map(docWithId).map(doc => messageRecordToChannel(doc, doc.id)),
        next: docs[docs.length - 1],
    };
}

export async function updateMessage(channel: ChannelID, messageId: string, changes: Partial<IMessageRecord>): Promise<void> {
    return await updateDoc(_docRef(channel, messageId), changes);
}

export async function subscribeMessage(channelId: ChannelID, callback: (docs: IMessage[], docsData: QuerySnapshot) => void): Promise<Unsubscribe> {
    const db = getFirestore();
    return onSnapshot(collection(db, _collectionPath(channelId)), (docsData) => {
        let docs: IMessage[] = [];
        // Check that this is not the first snapshot request, but adding a new document to the listener
        if (docsData.docs.length !== docsData.docChanges().length) {
            // @ts-ignore
            docs = docsData.docChanges().map(docData => docData.doc).map(docWithId).map(doc => messageRecordToChannel(doc, doc.id));
        }
        callback(docs, docsData);
    });
}

export async function unsubscribeMessage(unsubscribe: Unsubscribe): Promise<void> {
    unsubscribe();
}
