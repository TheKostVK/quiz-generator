export class IndexedDBService {
    #db = null;

    constructor(db) {
        this.#db = db;
    }

    /**
     * Открывает БД и выполняет upgrade при необходимости
     */
    static open(name, version, onUpgrade) {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB не поддерживается браузером'));
                return;
            }

            const request = indexedDB.open(name, version);

            request.onupgradeneeded = (e) => {
                if (onUpgrade) {
                    onUpgrade(request.result, e.oldVersion, e.newVersion);
                }
            };

            request.onsuccess = () => {
                resolve(new IndexedDBService(request.result));
            };

            request.onerror = () => {
                reject(request.error || new Error('Ошибка открытия IndexedDB'));
            };
        });
    }

    /**
     * Получить запись по ключу
     */
    get(storeName, key) {
        return this.#request(storeName, 'readonly', store => store.get(key));
    }

    /**
     * Получить все записи
     */
    getAll(storeName) {
        return this.#request(storeName, 'readonly', store => store.getAll());
    }

    /**
     * Добавить или обновить запись
     */
    put(storeName, value, key) {
        return this.#request(storeName, 'readwrite', store =>
            key !== undefined ? store.put(value, key) : store.put(value)
        );
    }

    /**
     * Удалить запись
     */
    delete(storeName, key) {
        return this.#request(storeName, 'readwrite', store => store.delete(key));
    }

    /**
     * Очистить хранилище
     */
    clear(storeName) {
        return this.#request(storeName, 'readwrite', store => store.clear());
    }

    /**
     * Внутренний помощник для транзакций
     */
    #request(storeName, mode, action) {
        return new Promise((resolve, reject) => {
            if (!this.#db) {
                reject(new Error('База данных не инициализирована'));
                return;
            }

            const tx = this.#db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const req = action(store);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);

            tx.onerror = () => reject(tx.error);
        });
    }
}