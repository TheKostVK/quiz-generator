import { nanoid } from 'nanoid';
import {IndexedDBService} from "./db";
import {processedQuizzesTableName, quizzesDBName, quizzesDBVersion, quizzesTableName} from "../../constatns";

export const dbPromise = IndexedDBService.open(quizzesDBName, quizzesDBVersion, (db) => {
    if (!db.objectStoreNames.contains(quizzesTableName)) {
        db.createObjectStore(quizzesTableName, { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains(processedQuizzesTableName)) {
        db.createObjectStore(processedQuizzesTableName, { keyPath: 'id' });
    }
});

export async function saveQuiz(quiz) {
    const db = await dbPromise;
    return db.put(quizzesTableName, { id: nanoid(), ...quiz });
}

export async function getQuiz(id) {
    const db = await dbPromise;
    return db.get(quizzesTableName, id);
}

export async function getAllQuizzes() {
    const db = await dbPromise;
    return db.getAll(quizzesTableName);
}

export async function saveProcessedQuiz(quiz) {
    const db = await dbPromise;
    return db.put(processedQuizzesTableName, { id: nanoid(), ...quiz });
}

export async function getProcessedQuiz(id) {
    const db = await dbPromise;
    return db.get(processedQuizzesTableName, id);
}