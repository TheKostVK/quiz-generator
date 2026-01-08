import {nanoid} from "nanoid";

/**
 * Генератор квизов: валидирует JSON и сохраняет квиз в IndexedDB.
 */
export class QuizGenerator {
    quizValidator = null;
    dbQuizSave = null;

    constructor(quizValidator, dbQuizSave) {
        this.quizValidator = quizValidator;
        this.dbQuizSave = dbQuizSave;
    }

    /**
     * Валидирует строку JSON и сохраняет квиз в БД.
     *
     * Возвращает:
     * - ok=true: { ok:true, data: QuizData, id: string }
     * - ok=false: как вернул валидатор или ошибка БД
     *
     * @param {string} quizData JSON строка из textarea
     * @returns {Promise<any>}
     */
    async setQuizData(quizData) {
        const res = this.quizValidator.validateJson(quizData);
        if (!res.ok) return res;

        if (!this.dbQuizSave) {
            return {
                ok: false,
                message: "База данных не инициализирована",
                issues: [{path: "", message: "DB_NOT_INITIALIZED"}],
            };
        }

        const id = nanoid();

        try {
            await this.dbQuizSave({id, ...res.data});

            return {...res, id};
        } catch (e) {
            return {
                ok: false,
                message: "Не удалось сохранить квиз в IndexedDB",
                issues: [{path: "", message: e instanceof Error ? e.message : String(e)}],
            };
        }
    }
}