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

const OptionSchema = z.object({
    id: z.number().int().positive(),
    text: z.string().min(1, 'option.text не должен быть пустым'),
    correct: z.boolean(),
    message: z.string().min(1, 'option.message не должен быть пустым'),
});

const QuestionSchema = z
    .object({
        id: z.number().int().positive(),
        text: z.string().min(1, 'question.text не должен быть пустым'),
        type: z.enum(['single', 'multiple']),
        options: z.array(OptionSchema).min(2, 'options должно содержать минимум 2 варианта'),
    })
    .superRefine((q, ctx) => {
        const ids = q.options.map((o) => o.id);

        if (new Set(ids).size !== ids.length) {
            ctx.addIssue({
                code: 'custom', message: `question ${q.id}: option.id должны быть уникальны`, path: ['options'],
            });
        }

        const correctCount = q.options.filter((o) => o.correct).length;

        if (q.type === 'single' && correctCount !== 1) {
            ctx.addIssue({
                code: 'custom',
                message: `question ${q.id}: для type="single" должен быть ровно 1 правильный вариант`,
                path: ['options'],
            });
        }

        if (q.type === 'multiple' && correctCount < 1) {
            ctx.addIssue({
                code: 'custom',
                message: `question ${q.id}: для type="multiple" должен быть минимум 1 правильный вариант`,
                path: ['options'],
            });
        }
    });

export const QuizSchema = z
    .object({
        title: z.string().min(1, 'title не должен быть пустым'),
        description: z.string().min(1, 'description не должен быть пустым'),
        questions: z.array(QuestionSchema).min(1, 'questions должен содержать минимум 1 вопрос'),
    })
    .superRefine((quiz, ctx) => {
        const qids = quiz.questions.map((q) => q.id);

        if (new Set(qids).size !== qids.length) {
            ctx.addIssue({
                code: 'custom', message: `questions: question.id должны быть уникальны`, path: ['questions'],
            });
        }
    });

/**
 * Валидирует строку JSON: сначала JSON.parse, затем Zod
 *
 * @param {string} jsonString
 * @returns {{ok:true, data: QuizData} | {ok:false, error: string}}
 */
export function validateQuizJson(jsonString) {
    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (e) {
        return {ok: false, error: `Некорректный JSON: ${e.message}`};
    }

    const res = QuizSchema.safeParse(parsed);
    if (!res.success) {
        const msg = res.error.issues
            .map((i) => `${i.path.join('.') || 'root'}: ${i.message}`)
            .join('\n');
        return {ok: false, error: msg};
    }

    return {ok: true, data: res.data};
}