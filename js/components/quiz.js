export class Quiz {
    /**
     * Загруженный квиз (JSON-объект из IndexedDB)
     * @type {QuizData | null}
     */
    quiz = null;

    /**
     * Ответы пользователя по вопросам.
     * key = questionId, value = { correct, userOptions }
     * @type {Map<number, {correct: boolean, userOptions: number[]}>}
     */
    userAnswers = new Map();

    constructor(quizData, userAnswersData = new Map()) {
        this.quiz = quizData;
        this.userAnswers = userAnswersData;
    }

    resetQuiz() {
        this.userAnswers = new Map();
    }

    getNextQuestion() {
        if (this.quiz === null) return null;

        const currentQuestion = this.userAnswers.size;

        return this.quiz.questions[currentQuestion];
    }

    /**
     * Сохраняет ответ пользователя.
     * @param {number} questionId
     * @param {number[]} userOptions
     */
    setAnswerQuestion(questionId, userOptions) {
        if (!this.quiz) return;

        const question = this.quiz.questions.find((question) => question.id === questionId);

        if (!question) return;

        const result = [];
        let correct = true;
        question.options.map((quizOption) => {
            const include = userOptions.includes(quizOption.id);

            if (quizOption.correct && !include || !quizOption.correct && include) {
                result.push(quizOption);
                correct = false;
            }
        });

        this.userAnswers.set(questionId, {userOptions, correct});
    }

    /**
     * Возвращает результат тестирования.
     * @returns {{ correctCount: number, total: number, percent: number, status: 'bad'|'good'|'complete' } | null}
     */
    getQuizResult() {
        if (!this.quiz) return null;

        const total = this.quiz.questions.length;
        let correctCount = 0;

        this.userAnswers.forEach((answer) => {
            if (answer.correct) {
                correctCount += 1;
            }
        });

        const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

        let status = 'bad';
        if (percent === 100) {
            status = 'complete';
        } else if (percent >= 51) {
            status = 'good';
        }

        return {
            correctCount,
            total,
            percent,
            status,
        };
    }
}