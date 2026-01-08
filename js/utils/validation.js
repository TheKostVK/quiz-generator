import {z} from 'zod';

/**
 * @typedef {'single'|'multiple'} QuestionType
 */

/**
 * @typedef {Object} QuizOption
 * @property {number} id
 * @property {string} text
 * @property {boolean} correct
 * @property {string} message
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {number} id
 * @property {string} text
 * @property {QuestionType} type
 * @property {QuizOption[]} options
 */

/**
 * @typedef {Object} QuizData
 * @property {string} title
 * @property {string} description
 * @property {QuizQuestion[]} questions
 */

/**
 * Zod schema: option
 */
export const OptionSchema = z.object({
    id: z.number().int().positive(),
    text: z.string().min(1, 'Option text is required'),
    correct: z.boolean(),
    message: z.string().min(1, 'Option message is required'),
});

/**
 * Zod schema: question
 *
 * Правила:
 * - id уникален в рамках questions
 * - options: минимум 2
 * - option.id уникальны внутри options
 * - для single: ровно 1 correct=true
 * - для multiple: минимум 1 correct=true
 */
export const QuestionSchema = z
    .object({
        id: z.number().int().positive(),
        text: z.string().min(1, 'Question text is required'),
        type: z.enum(['single', 'multiple']),
        options: z.array(OptionSchema).min(2, 'At least 2 options required'),
    })
    .superRefine((q, ctx) => {
        // 1) option ids unique
        const ids = q.options.map((o) => o.id);
        const unique = new Set(ids);
        if (unique.size !== ids.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['options'],
                message: 'Option ids must be unique within a question',
            });
        }

        // 2) correctness constraints
        const correctCount = q.options.reduce((acc, o) => acc + (o.correct ? 1 : 0), 0);

        if (q.type === 'single' && correctCount !== 1) {
            ctx.addIssue({
                code: 'custom',
                path: ['options'],
                message: 'For single questions exactly 1 option must be correct',
            });
        }

        if (q.type === 'multiple' && correctCount < 1) {
            ctx.addIssue({
                code: 'custom',
                path: ['options'],
                message: 'For multiple questions at least 1 option must be correct',
            });
        }
    });

/**
 * Zod schema: quiz
 *
 * Правила:
 * - title/description обязательны
 * - questions: минимум 1
 * - question.id уникальны
 */
export const QuizSchema = z
    .object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        questions: z.array(QuestionSchema).min(1, 'At least 1 question required'),
    })
    .superRefine((quiz, ctx) => {
        const qIds = quiz.questions.map((q) => q.id);
        const unique = new Set(qIds);
        if (unique.size !== qIds.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['questions'],
                message: 'Question ids must be unique within a quiz',
            });
        }
    });

/**
 * Результат валидации для UI.
 * @typedef {Object} ValidationResult
 * @property {true} ok
 * @property {QuizData} data
 *
 * @typedef {Object} ValidationErrorResult
 * @property {false} ok
 * @property {string} message
 * @property {Array<{path: string, message: string}>} issues
 */

/**
 * Валидатор JSON квиза на основе Zod.
 */
export class QuizValidator {
    /**
     * Парсит строку как JSON и валидирует по Zod-схеме.
     * @param {string} jsonString
     * @returns {ValidationResult | ValidationErrorResult}
     */
    static validateJson(jsonString) {
        const raw = QuizValidator.#parseJson(jsonString);
        if (!raw.ok) return raw;

        const parsed = QuizSchema.safeParse(raw.data);
        if (parsed.success) {
            return {ok: true, data: parsed.data};
        }

        const issues = parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
        }));

        return {
            ok: false,
            message: QuizValidator.#formatIssuesMessage(issues),
            issues,
        };
    }

    /**
     * Валидирует уже готовый объект.
     * @param {unknown} data
     * @returns {ValidationResult | ValidationErrorResult}
     */
    static validateData(data) {
        const parsed = QuizSchema.safeParse(data);
        if (parsed.success) return {ok: true, data: parsed.data};

        const issues = parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
        }));

        return {
            ok: false,
            message: QuizValidator.#formatIssuesMessage(issues),
            issues,
        };
    }

    /**
     * JSON.parse с безопасной обработкой ошибок.
     * @param {string} jsonString
     * @returns {{ok:true,data:unknown} | {ok:false,message:string,issues:Array<{path:string,message:string}>}}
     */
    static #parseJson(jsonString) {
        if (typeof jsonString !== 'string' || jsonString.trim() === '') {
            return {
                ok: false,
                message: 'Введите JSON в поле',
                issues: [{path: '', message: 'Пустая строка'}],
            };
        }

        try {
            const data = JSON.parse(jsonString);
            if (data === null || typeof data !== 'object') {
                return {
                    ok: false,
                    message: 'JSON должен быть объектом',
                    issues: [{path: '', message: 'Ожидается объект, получено null/primitive'}],
                };
            }
            return {ok: true, data};
        } catch (e) {
            return {
                ok: false,
                message: 'Некорректный JSON',
                issues: [{path: '', message: e instanceof Error ? e.message : String(e)}],
            };
        }
    }

    /**
     * Собирает одно сообщение для toast/modal.
     * @param {Array<{path:string,message:string}>} issues
     * @returns {string}
     */
    static #formatIssuesMessage(issues) {
        const first = issues[0];
        if (!first) return 'Ошибка валидации';

        return first.path ? `${first.path}: ${first.message}` : first.message;
    }
}