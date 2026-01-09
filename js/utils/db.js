import {openDB} from 'idb';

export class IndexedDBService {
    #db = null;

    constructor(db) {
        this.#db = db;
    }

    /**
     * Открывает БД и выполняет upgrade при необходимости
     */
    static async open(name, version, onUpgrade) {
        if (!('indexedDB' in window)) {
            throw new Error('IndexedDB не поддерживается браузером');
        }

        const db = await openDB(name, version, {
            upgrade(db, oldVersion, newVersion /*, transaction, event */) {
                if (onUpgrade) {
                    onUpgrade(db, oldVersion, newVersion);
                }
            },
        });

        return new IndexedDBService(db);
    }

    /**
     * Получить запись по ключу
     */
    get(storeName, key) {
        this.#ensureDb();
        return this.#db.get(storeName, key);
    }

    /**
     * Получить все записи
     */
    getAll(storeName) {
        this.#ensureDb();
        return this.#db.getAll(storeName);
    }

    /**
     * Добавить или обновить запись
     */
    put(storeName, value, key) {
        this.#ensureDb();
        return key !== undefined
            ? this.#db.put(storeName, value, key)
            : this.#db.put(storeName, value);
    }

    /**
     * Удалить запись
     */
    delete(storeName, key) {
        this.#ensureDb();
        return this.#db.delete(storeName, key);
    }

    /**
     * Очистить хранилище
     */
    clear(storeName) {
        this.#ensureDb();
        return this.#db.clear(storeName);
    }

    /**
     * Проверяет, что БД инициализирована
     */
    #ensureDb() {
        if (!this.#db) {
            throw new Error('База данных не инициализирована');
        }
    }
}