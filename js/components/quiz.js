export class Quiz {
    #quiz = null;
    #currentQuestionNumber = 1;
    #questionsState = new Map();
    #mode = "answer";

    constructor(quizData) {
        if (!quizData || !Array.isArray(quizData.questions)) {
            throw new Error("Quiz: invalid quizData");
        }

        this.#quiz = quizData;
        this.#initQuestionsState();
    }

    /**
     * Инициализирует состояние всех вопросов при получении квиза.
     */
    #initQuestionsState() {
        if (!this.#quiz) return;

        this.#questionsState = new Map();

        this.#quiz.questions.forEach((q) => {
            this.#questionsState.set(q.id, {
                questionId: q.id,
                stage: "idle",
                correct: null,
                selectedOptionIds: [],
            });
        });

        this.#currentQuestionNumber = 1;
        this.#mode = "answer";
    }

    /**
     * Кол-во вопросов в квизе
     */
    questionsCount() {
        if (!this.#quiz) return 0;
        return this.#quiz.questions.length;
    }

    /**
     * Текущий режим UI
     */
    getMode() {
        return this.#mode;
    }

    /**
     * Получить текущий вопрос
     */
    getCurrentQuestion() {
        if (!this.#quiz) return null;

        const idx = this.#currentQuestionNumber - 1;
        const question = this.#quiz.questions[idx];
        if (!question) return null;

        return { question, questionNumber: this.#currentQuestionNumber };
    }

    /**
     * Перейти к следующему вопросу
     * Сбрасывает режим на answer
     */
    nextQuestion() {
        if (!this.#quiz) return null;

        const next = this.#currentQuestionNumber + 1;
        if (next > this.#quiz.questions.length) return null;

        this.#currentQuestionNumber = next;
        this.#mode = "answer";

        return this.getCurrentQuestion();
    }

    /**
     * Является ли текущий вопрос последним
     */
    isLastQuestion() {
        if (!this.#quiz) return true;
        return this.#currentQuestionNumber >= this.#quiz.questions.length;
    }

    /**
     * Проверяет выбранные варианты и сохраняет состояние вопроса.
     * После вызова режим становится review
     *
     * Логика:
     * - correct: true только если выбранный набор == набору правильных
     * - checkedOptionIds: если ответ НЕ полностью правильный, добавляем недостающие correct варианты
     * - highlightOptionIds: всегда = выбранные пользователем и правильные
     * - optionsView.selected строится по checkedOptionIds
     */
    answerQuestion(questionId, userOptionIds) {
        if (!this.#quiz) throw new Error("Quiz: quiz is not loaded");

        const question = this.#quiz.questions.find((q) => q.id === questionId);
        if (!question) throw new Error(`Quiz: question ${questionId} not found`);

        const userSelected = Array.isArray(userOptionIds) ? userOptionIds : [];
        const userSelectedSet = new Set(userSelected);

        const correctIds = question.options.filter((o) => o.correct).map((o) => o.id);
        const correctSet = new Set(correctIds);

        const isCorrect =
            userSelectedSet.size === correctSet.size &&
            [...userSelectedSet].every((id) => correctSet.has(id));

        const checkedSet = new Set(userSelectedSet);

        if (!isCorrect) {
            correctSet.forEach((id) => checkedSet.add(id));
        }

        const highlightSet = new Set([...userSelectedSet, ...correctSet]);

        const checkedOptionIds = [...checkedSet];
        const highlightOptionIds = [...highlightSet];

        const optionsView = question.options.map((o) => ({
            ...o,
            selected: checkedSet.has(o.id),
        }));

        const st = this.#questionsState.get(questionId);

        if (!st) {
            this.#questionsState.set(questionId, {
                questionId,
                stage: "answered",
                correct: isCorrect,
                selectedOptionIds: [...userSelectedSet],
            });
        } else {
            st.stage = "answered";
            st.correct = isCorrect;
            st.selectedOptionIds = [...userSelectedSet];
        }

        this.#mode = "review";

        return {
            correct: isCorrect,
            checkedOptionIds,
            highlightOptionIds,
            optionsView,
        };
    }

    /**
     * Возвращает итоговую статистику
     */
    getQuizResult() {
        if (!this.#quiz) return null;

        const total = this.#quiz.questions.length;

        let correctCount = 0;
        this.#questionsState.forEach((st) => {
            if (st.correct === true) correctCount += 1;
        });

        const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

        let status = "bad";

        if (percent === 100) {
            status = "complete";
        } else if (percent >= 51) {
            status = "good";
        }

        return { correctCount, total, percent, status };
    }

    reset() {
        this.#currentQuestionNumber = 1;
        this.#mode = "answer";
        this.#questionsState.clear();
    }
}