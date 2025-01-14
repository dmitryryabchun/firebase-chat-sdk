var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, query, setDoc, startAfter, where, orderBy, writeBatch } from 'firebase/firestore';
import { docWithId } from '../_utils/firebase-snapshot.utils';
import { arrayToObject, objectToArray } from '../_utils/array.utils';
import { documentId } from '@firebase/firestore';
import { splitIntoChunks } from '../_utils/chunks.util';
var _collectionPath = '/channels';
function _collectionRef() {
    var db = getFirestore();
    return collection(db, _collectionPath);
}
export function _docRef(id) {
    var db = getFirestore();
    return doc(db, "".concat(_collectionPath, "/").concat(id));
}
export function batchRef() {
    var db = getFirestore();
    return writeBatch(db);
}
function channelRecordToChannel(record, id) {
    var payload = null;
    try {
        payload = JSON.parse(record.payload || 'null');
    }
    catch (_a) {
    }
    return __assign({ id: id, title: record.title, payload: payload, tags: objectToArray(record.tags), members: record.members, isMultiChannel: !!record.isMultiChannel }, (record.isMultiChannel && {
        composedChannels: record.composedChannels
    }));
}
export function createChannel(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var tags, channel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tags = arrayToObject(data.tags);
                    channel = __assign({ title: data.title, payload: JSON.stringify(data.payload || null), tags: tags, members: [], updatedAt: Date.now(), isMultiChannel: !!data.isMultiChannel }, (data.isMultiChannel && {
                        composedChannels: data.composedChannels
                    }));
                    return [4 /*yield*/, setDoc(_docRef(id), channel)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, channelRecordToChannel(channel, id)];
            }
        });
    });
}
export function getChannel(id) {
    return __awaiter(this, void 0, void 0, function () {
        var doc, channel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDoc(_docRef(id))];
                case 1:
                    doc = _a.sent();
                    if (!doc.exists()) {
                        return [2 /*return*/, null];
                    }
                    channel = docWithId(doc);
                    return [2 /*return*/, channelRecordToChannel(channel, doc.id)];
            }
        });
    });
}
export function findChannelsByTags(tags, take, sortByLastUpdate, after) {
    if (tags === void 0) { tags = []; }
    if (take === void 0) { take = 10; }
    if (sortByLastUpdate === void 0) { sortByLastUpdate = false; }
    return __awaiter(this, void 0, void 0, function () {
        var queryConstraints, _i, tags_1, tag;
        return __generator(this, function (_a) {
            queryConstraints = [
                limit(take),
            ];
            if (sortByLastUpdate) {
                queryConstraints.push(orderBy('updatedAt', 'desc'));
            }
            if (after) {
                queryConstraints.push(startAfter(after));
            }
            for (_i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
                tag = tags_1[_i];
                queryConstraints.push(where("tags.".concat(tag), '==', true));
            }
            return [2 /*return*/, _findByQuery(queryConstraints)];
        });
    });
}
export function findChannelsByUser(userId, tags, take, sortByLastUpdate, after) {
    if (tags === void 0) { tags = []; }
    if (take === void 0) { take = 10; }
    if (sortByLastUpdate === void 0) { sortByLastUpdate = false; }
    return __awaiter(this, void 0, void 0, function () {
        var queryConstraints, _i, tags_2, tag;
        return __generator(this, function (_a) {
            queryConstraints = [
                where('members', 'array-contains', userId),
                limit(take),
            ];
            if (sortByLastUpdate) {
                queryConstraints.push(orderBy('updatedAt', 'desc'));
            }
            if (after) {
                queryConstraints.push(startAfter(after));
            }
            for (_i = 0, tags_2 = tags; _i < tags_2.length; _i++) {
                tag = tags_2[_i];
                queryConstraints.push(where("tags.".concat(tag), '==', true));
            }
            return [2 /*return*/, _findByQuery(queryConstraints)];
        });
    });
}
export function getChannelWithMultiChannels(id) {
    return __awaiter(this, void 0, void 0, function () {
        var doc, _channel, _multiChannels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDoc(_docRef(id))];
                case 1:
                    doc = _a.sent();
                    if (!doc.exists()) {
                        return [2 /*return*/, null];
                    }
                    _channel = docWithId(doc);
                    return [4 /*yield*/, _findByQuery([
                            where('composedChannels', 'array-contains', doc.id),
                        ])];
                case 2:
                    _multiChannels = _a.sent();
                    return [2 /*return*/, [
                            channelRecordToChannel(_channel, doc.id),
                            _multiChannels.channels
                        ]];
            }
        });
    });
}
export function getMultiChannelWithComposedChannels(id) {
    return __awaiter(this, void 0, void 0, function () {
        var doc, multiChannel, composedChannelsPromises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDoc(_docRef(id))];
                case 1:
                    doc = _a.sent();
                    if (!doc.exists()) {
                        return [2 /*return*/, null];
                    }
                    multiChannel = docWithId(doc);
                    if (!multiChannel.composedChannels) {
                        return [2 /*return*/, [
                                channelRecordToChannel(multiChannel, doc.id),
                                []
                            ]];
                    }
                    composedChannelsPromises = [];
                    multiChannel.composedChannels.forEach(function (_id) {
                        composedChannelsPromises.push(getDoc(_docRef(_id)));
                    });
                    return [2 /*return*/, Promise.all(composedChannelsPromises).then(function (list) {
                            return [
                                channelRecordToChannel(multiChannel, doc.id),
                                list.filter(function (ch) { return ch.exists(); }).map(function (ch) { return channelRecordToChannel(docWithId(ch), ch.id); })
                            ];
                        })];
            }
        });
    });
}
export function updateUserNameForEachChannel(id, name, take) {
    if (take === void 0) { take = 1000; }
    return __awaiter(this, void 0, void 0, function () {
        var batch, queryConstraints, channels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    batch = batchRef();
                    queryConstraints = [
                        where('members', 'array-contains', id),
                        limit(take),
                    ];
                    return [4 /*yield*/, _findByQuery(queryConstraints)];
                case 1:
                    channels = _a.sent();
                    if (!channels.channels.length) {
                        return [2 /*return*/];
                    }
                    channels.channels.forEach(function (channel) {
                        if (channel && channel.payload && Object.keys(channel.payload).length !== 0) {
                            var _members = channel.payload.members;
                            var targetUserIndx = _members.findIndex(function (m) { return Number(m.id) === Number(id); });
                            if (targetUserIndx === -1) {
                                return;
                            }
                            _members[targetUserIndx].name = name;
                            var _lastMessage = channel.payload.lastMessage ? channel.payload.lastMessage : null;
                            if (_lastMessage && _lastMessage.sender && Number(_lastMessage.sender.id) === Number(id)) {
                                _lastMessage.sender.name = name;
                            }
                            batch.update(_docRef(channel.id), {
                                payload: JSON.stringify(channel.payload)
                            });
                        }
                    });
                    return [4 /*yield*/, batch.commit()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Function for updating multiple channel's docs with partial properties
 * @param props An array of channels containing the fields and values ​​to be updated in the document
 * @param updatedAt
 * @returns `Promise`
 */
export function updateBatchPartialChannels(records) {
    return __awaiter(this, void 0, void 0, function () {
        var batch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    batch = batchRef();
                    records.forEach(function (rec) {
                        if (rec.id && Object.keys(rec).length > 1) {
                            var docId = rec.id;
                            delete rec.id;
                            batch.update(_docRef(docId), __assign({}, rec));
                        }
                    });
                    return [4 /*yield*/, batch.commit()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Function for get channel's list by spliting into chunks
 * @param ids An array of channel's ids
 * @param take
 * @returns `Promise`
 */
export function getChannelsByIDs(ids, take) {
    if (take === void 0) { take = 1000; }
    return __awaiter(this, void 0, void 0, function () {
        var chunkPromises;
        return __generator(this, function (_a) {
            if (!ids.length) {
                return [2 /*return*/, new Promise(function (exec) { return exec([]); })];
            }
            chunkPromises = [];
            splitIntoChunks(ids).forEach(function (chunkIds) {
                var queryConstraints = [
                    limit(take),
                    where(documentId(), 'in', chunkIds),
                ];
                chunkPromises.push(_findByQuery(queryConstraints));
            });
            return [2 /*return*/, Promise.all(chunkPromises).then(function (data) {
                    // @ts-ignore
                    return data.flatMap(function (chunk) { return chunk.channels; });
                }).catch(function () {
                    return [];
                })];
        });
    });
}
export function findMultiChannelByComposedChannels(composedIds) {
    return __awaiter(this, void 0, void 0, function () {
        var queryConstraints, _multiChannels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!composedIds.length) {
                        return [2 /*return*/, null];
                    }
                    queryConstraints = [
                        limit(1000),
                        where('isMultiChannel', '==', true),
                        where('composedChannels', 'array-contains', composedIds[0])
                    ];
                    return [4 /*yield*/, _findByQuery(queryConstraints)];
                case 1:
                    _multiChannels = _a.sent();
                    if (!_multiChannels.channels.length) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, _multiChannels.channels.find(function (ch) {
                            var _a;
                            return (((_a = ch.composedChannels) === null || _a === void 0 ? void 0 : _a.length) === composedIds.length &&
                                composedIds.every(function (c) { var _a; return (_a = ch.composedChannels) === null || _a === void 0 ? void 0 : _a.includes(c); }));
                        }) || null];
            }
        });
    });
}
function _findByQuery(queryConstraints) {
    return __awaiter(this, void 0, void 0, function () {
        var q, docs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    q = query.apply(void 0, __spreadArray([_collectionRef()], queryConstraints, false));
                    return [4 /*yield*/, getDocs(q).then(function (response) { return response.docs; })];
                case 1:
                    docs = _a.sent();
                    return [2 /*return*/, {
                            // @ts-ignore
                            channels: docs.map(docWithId).map(function (doc) { return channelRecordToChannel(doc, doc.id); }),
                            next: docs[docs.length - 1],
                        }];
            }
        });
    });
}
export function subscribeChannels(callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, onSnapshot(_collectionRef(), function (channelData) {
                    var channels = [];
                    // Check that this is not the first snapshot request, but adding a new document to the listener
                    if (channelData.docs.length !== channelData.docChanges().length) {
                        // @ts-ignore
                        channels = channelData.docChanges().map(function (docData) { return docData.doc; }).map(docWithId).map(function (doc) { return channelRecordToChannel(doc, doc.id); });
                    }
                    callback(channels, channelData);
                })];
        });
    });
}
export function subscribeChannel(channelId, callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, onSnapshot(_docRef(channelId), function (channelData) {
                    callback(channelData);
                })];
        });
    });
}
export function unsubscribeChannel(unsubscribe) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            unsubscribe();
            return [2 /*return*/];
        });
    });
}
