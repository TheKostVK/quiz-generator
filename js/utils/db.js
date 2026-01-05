import { openDB } from 'idb';

export const dbPromise = openDB('quizzes-db', 1, {
    upgrade(db) {
        db.createObjectStore('quizzes', { keyPath: 'id' });
        db.createObjectStore('processed-quizzes', { keyPath: 'id' });
    },
});

export class IndexedDB {
    constructor(dbName, dbVersion, dbUpgrade) {
        return new Promise((resolve, reject) => {
            this.db = null;

            if (!('indexedDB' in window)) reject('not supported');

            const dbOpen = indexedDB.open(dbName, dbVersion);

            if (dbUpgrade) {
                dbOpen.onupgradeneeded = e => {
                    dbUpgrade(dbOpen.result, e.oldVersion, e.newVersion);
                };
            }

            dbOpen.onsuccess = () => {
                this.db = dbOpen.result;
                resolve(this);
            };

            dbOpen.onerror = e => {
                reject(`IndexedDB error: ${ e.target.errorCode }`);
            };
        });
    }

    set(storeName, name, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite'),
                store = transaction.objectStore(storeName);

            store.put(value, name);

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    get(storeName, name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly'),
                store = transaction.objectStore(storeName),
                request = store.get(name);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

