var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { addDoc, collection, doc, getDocs, getFirestore, limit, orderBy, query, startAfter, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { docWithId } from '../_utils/firebase-snapshot.utils';
function _collectionPath(channelId) {
    return "/channels/".concat(channelId, "/messages");
}
function _docRef(channelId, messageId) {
    var db = getFirestore();
    return doc(db, "".concat(_collectionPath(channelId), "/").concat(messageId));
}
function _collectionRef(channelId) {
    var db = getFirestore();
    return collection(db, _collectionPath(channelId));
}
function messageRecordToChannel(record, id) {
    var payload = null;
    try {
        payload = JSON.parse(record.payload || 'null');
    }
    catch (_a) {
    }
    return {
        id: id,
        message: record.message,
        payload: payload,
        createdAt: record.createdAt,
        sender: record.sender,
        isDeleted: (record === null || record === void 0 ? void 0 : record.isDeleted) || false,
        tags: record.tags || [],
    };
}
export function postMessage(channel, sender, data, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var message, newDoc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = {
                        message: data.message,
                        payload: JSON.stringify(data.payload || null),
                        sender: sender,
                        createdAt: Date.now(),
                        isDeleted: false,
                        tags: data.tags || [],
                    };
                    if (!messageId) return [3 /*break*/, 2];
                    return [4 /*yield*/, setDoc(doc(getFirestore(), _collectionPath(channel), messageId), message)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, messageRecordToChannel(message, messageId)];
                case 2: return [4 /*yield*/, addDoc(_collectionRef(channel), message)];
                case 3:
                    newDoc = _a.sent();
                    return [2 /*return*/, messageRecordToChannel(message, newDoc.id)];
            }
        });
    });
}
export function getMessages(channel, take, after) {
    if (take === void 0) { take = 10; }
    return __awaiter(this, void 0, void 0, function () {
        var queryConstraints, q, docs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryConstraints = [
                        limit(take),
                        orderBy('createdAt', 'desc')
                    ];
                    if (after) {
                        queryConstraints.push(startAfter(after));
                    }
                    q = query.apply(void 0, __spreadArray([_collectionRef(channel)], queryConstraints, false));
                    return [4 /*yield*/, getDocs(q).then(function (response) { return response.docs; })];
                case 1:
                    docs = _a.sent();
                    return [2 /*return*/, {
                            // @ts-ignore
                            messages: docs.map(docWithId).map(function (doc) { return messageRecordToChannel(doc, doc.id); }),
                            next: docs[docs.length - 1],
                        }];
            }
        });
    });
}
export function updateMessage(channel, messageId, changes) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, updateDoc(_docRef(channel, messageId), changes)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
export function subscribeMessage(channelId, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            db = getFirestore();
            return [2 /*return*/, onSnapshot(collection(db, _collectionPath(channelId)), function (docsData) {
                    var docs = [];
                    // Check that this is not the first snapshot request, but adding a new document to the listener
                    if (docsData.docs.length !== docsData.docChanges().length) {
                        // @ts-ignore
                        docs = docsData.docChanges().map(function (docData) { return docData.doc; }).map(docWithId).map(function (doc) { return messageRecordToChannel(doc, doc.id); });
                    }
                    callback(docs, docsData);
                })];
        });
    });
}
export function unsubscribeMessage(unsubscribe) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            unsubscribe();
            return [2 /*return*/];
        });
    });
}
