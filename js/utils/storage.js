import { dbPromise } from './db.js';
import { nanoid } from 'nanoid';

export async function saveQuiz(quizData) {
    const db = await dbPromise;

    return db.put('quizzes', { id: nanoid(), ...quizData });
}

export async function getQuiz(id) {
    const db = await dbPromise;

    return db.get('quizzes', id);
}

export async function getAllQuizzes() {
    const db = await dbPromise;

    return db.getAll('quizzes');
}

export async function deleteQuiz(id) {
    const db = await dbPromise;

    return db.delete('quizzes', id);
}

export async function clearAllQuizzes() {
    const db = await dbPromise;

    return db.clear('quizzes');
}

export async function saveProcessedQuiz(quizData) {
    const db = await dbPromise;

    return db.put('processed-quizzes', { id: nanoid(), ...quizData });
}

export async function getProcessedQuiz(id) {
    const db = await dbPromise;

    return db.get('processed-quizzes', id);
}

export async function getAllProcessedQuizzes() {
    const db = await dbPromise;

    return db.getAll('processed-quizzes');
}

export async function deleteProcessedQuiz(id) {
    const db = await dbPromise;

    return db.delete('processed-quizzes', id);
}

export async function clearAllProcessedQuizzes() {
    const db = await dbPromise;

    return db.clear('processed-quizzes');
}