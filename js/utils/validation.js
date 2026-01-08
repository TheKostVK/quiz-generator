import {z} from 'zod';

/**
 * Zod schema: option
 */
export const OptionSchema = z.object({
    id: z.number().int().positive(),
    text: z.string().min(1, 'Текст варианта ответа обязателен'),
    correct: z.boolean(),
    message: z.string().min(1, 'Сообщение для варианта ответа обязательно'),
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
        text: z.string().min(1, 'Текст вопроса обязателен'),
        type: z.enum(['single', 'multiple']),
        options: z.array(OptionSchema).min(2, 'Должно быть минимум 2 варианта ответа'),
    })
    .superRefine((q, ctx) => {
        const ids = q.options.map((o) => o.id);
        const unique = new Set(ids);
        if (unique.size !== ids.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['options'],
                message: 'ID вариантов ответа должны быть уникальны в рамках одного вопроса',
            });
        }

        const correctCount = q.options.reduce((acc, o) => acc + (o.correct ? 1 : 0), 0);

        if (q.type === 'single' && correctCount !== 1) {
            ctx.addIssue({
                code: 'custom',
                path: ['options'],
                message: 'Для одиночного выбора ровно один вариант должен быть правильным',
            });
        }

        if (q.type === 'multiple' && correctCount < 1) {
            ctx.addIssue({
                code: 'custom',
                path: ['options'],
                message: 'Для множественного выбора должен быть хотя бы один правильный вариант',
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
        title: z.string().min(1, 'Название теста обязательно'),
        description: z.string().min(1, 'Описание теста обязательно'),
        questions: z.array(QuestionSchema).min(1, 'Должен быть минимум 1 вопрос'),
    })
    .superRefine((quiz, ctx) => {
        const qIds = quiz.questions.map((q) => q.id);
        const unique = new Set(qIds);
        if (unique.size !== qIds.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['questions'],
                message: 'ID вопросов должны быть уникальны в рамках одного теста',
            });
        }
    });

/**
 * Валидатор JSON квиза на основе Zod
 */
export class QuizValidator {
    /**
     * Парсит строку как JSON и валидирует по Zod-схеме
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
     * JSON.parse с безопасной обработкой ошибок
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
                    issues: [{path: '', message: 'Ожидается объект, получено null/примитив'}],
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
     * Собирает одно сообщение для toast/modal
     */
    static #formatIssuesMessage(issues) {
        const first = issues[0];
        if (!first) return 'Ошибка валидации';

        return first.path ? `${first.path}: ${first.message}` : first.message;
    }
}1