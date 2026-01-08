import {Quiz} from "../components/quiz";
import {Header} from "../components/header";
import {getQuiz} from "../utils/storage";
import {QuizRouter} from "../components/quizRouter";
import {QuizOptionCard} from "../components/quizOptionCard";

// ---------- DOM ----------
const quizElement = document.querySelector(".quiz");
if (!quizElement) throw new Error("quiz.js: .quiz not found");

const quizHeaderElement = quizElement.querySelector(".quiz__header");
const quizHeaderTitleElement = quizHeaderElement?.querySelector(".quiz__title");
const quizHeaderSubTitleElement = quizHeaderElement?.querySelector(".quiz__subtitle");

const quizProgressElement = quizElement.querySelector(".quiz__progress");
const currentCountElement = quizProgressElement?.querySelector(".quiz__progress-current");
const totalCountElement = quizProgressElement?.querySelector(".quiz__progress-total");
const quizProgressBarElement = quizProgressElement?.querySelector(".quiz__progress-bar");
const quizProgressBarFillElement = quizProgressBarElement?.querySelector(".quiz__progress-fill");

const quizQuestion = quizElement.querySelector(".quiz__question");
const quizQuestionHeader = quizQuestion?.querySelector(".quiz__question-header");
const quizQuestionHeaderTitle = quizQuestionHeader?.querySelector(".quiz__question-title");
const quizQuestionHeaderSubtitle = quizQuestionHeader?.querySelector(".quiz__question-subtitle");

const quizQuestionForm = document.forms["quiz"];
if (!quizQuestionForm) throw new Error('quiz.js: form name="quiz" not found');

const quizOptionsForm = quizQuestionForm.querySelector(".quiz__options");
if (!quizOptionsForm) throw new Error("quiz.js: .quiz__options not found");

const submitBtn = quizQuestionForm.querySelector(".quiz__submit");
if (!submitBtn) throw new Error("quiz.js: .quiz__submit not found");

const modal = document.querySelector(".modal");
if (!modal) throw new Error("quiz.js: .modal not found");

const modalTitle = modal.querySelector(".modal__title");
const modalSubtitle = modal.querySelector(".modal__subtitle");
const modalDescription = modal.querySelector(".body__description");
const modalCloseButton = modal.querySelector(".modal__close-btn");
const modalRestartButton = modal.querySelector(".modal__restart-btn");

const fragment = document.createDocumentFragment();
let optionCards = [];

const {quizId, question} = QuizRouter.getState();
if (!quizId) throw new Error("quiz.js: quizId missing in URL");

const quizData = await getQuiz(quizId);
if (!quizData) throw new Error("quiz.js: quiz not found in IndexedDB");

const header = new Header();
header.setMenuItems([
    {text: "Посмотреть сохранённые квизы", href: "/quizzes.html", variant: "secondary"},
]);

const quiz = new Quiz(quizData);

// ---------- Helpers ----------
/**
 * Обновляет прогресс
 */
const setProgress = (barEl, current, total) => {
    if (!currentCountElement || !totalCountElement || !quizProgressBarFillElement) return;

    const safeTotal = Math.max(1, total);
    const clamped = Math.min(Math.max(current, 1), safeTotal);
    const percent = (clamped / safeTotal) * 100;

    currentCountElement.textContent = String(clamped);
    totalCountElement.textContent = String(safeTotal);
    quizProgressBarFillElement.style.width = `${percent}%`;

    barEl.setAttribute("aria-valuenow", String(clamped));
    barEl.setAttribute("aria-valuemax", String(safeTotal));
};

/**
 * Принудительно Quiz на номер вопроса из URL
 */
const syncQuestionFromUrl = (questionNumber) => {
    const total = quiz.questionsCount();

    const safe = Math.min(Math.max(Number(questionNumber || 1), 1), Math.max(1, total));

    for (let i = 1; i < safe; i++) {
        quiz.nextQuestion();
    }

    QuizRouter.setQuestion(safe);
}

/**
 * Собрать выбранные optionId из формы
 */
const getSelectedOptionIds = () => {
    const fd = new FormData(quizQuestionForm);
    return Array.from(fd.values()).map((v) => Number(v)).filter((n) => Number.isFinite(n));
}

/**
 * Отрисовать вопрос
 */
const renderCurrentQuestion = () => {
    optionCards = [];
    fragment.replaceChildren();
    quizOptionsForm.replaceChildren();

    const cur = quiz.getCurrentQuestion();
    if (!cur) throw new Error("quiz.js: current question not found");

    const {question: q, questionNumber} = cur;

    const inputType = q.type === "single" ? "radio" : "checkbox";
    const groupName = `question-${q.id}`;

    if (quizQuestionHeaderTitle) quizQuestionHeaderTitle.textContent = q.text;
    if (quizQuestionHeaderSubtitle) {
        quizQuestionHeaderSubtitle.textContent =
            inputType === "radio" ? "Выберите один вариант ответа" : "Выберите несколько вариантов ответа";
    }

    submitBtn.textContent = "Ответить";

    q.options.forEach((opt) => {
        const card = new QuizOptionCard();

        const node = card.create({
            optionId: opt.id,
            inputType,
            name: groupName,
            text: opt.text,
            correct: opt.correct,
            message: opt.message,
        });

        optionCards.push(card);
        fragment.appendChild(node);
    });

    quizOptionsForm.appendChild(fragment);

    if (quizProgressBarElement) {
        setProgress(quizProgressBarElement, questionNumber, quiz.questionsCount());
    }
}

/**
 * Перевести UI в режим review
 */
const showReview = (selectedIds) => {
    const selectedSet = new Set(selectedIds);

    optionCards.forEach((c) => {
        if (!selectedIds.includes(Number(c.id))) {
            c.lock();
        }
    });

    optionCards.forEach((c) => {
        const st = c.getState();
        if (selectedSet.has(Number(st.id))) {
            c.showCorrectness({showHint: true});
        } else {
            c.clearStatus();
        }
    });

    if (quiz.isLastQuestion()) {
        submitBtn.textContent = "Завершить тест";
    } else {
        submitBtn.textContent = "Следующий вопрос";
    }
}

/**
 * Завершение квиза
 */
const finishQuiz = () => {
    const result = quiz.getQuizResult();
    if (!result) return;

    switch (result.status) {
        case "complete": {
            modalTitle.textContent = "Тест завершён!";
            modalSubtitle.textContent = "Вы ответили правильно на все вопросы 🎉";
            modalDescription.textContent = "Ваши знания в этой теме на высоте!"
            break;
        }
        case "good": {
            modalTitle.textContent = "Тест завершён!";
            modalSubtitle.textContent = `Вы ответили правильно на ${result.correctCount} из ${result.total} вопросов`;
            modalDescription.textContent = "Отличная попытка! Вы хорошо ответили на вопросы теста, но некоторые темы стоит освежить. Пройдите тест ещё раз, чтобы закрепить знания.";
            break;
        }
        case "bad": {
            modalTitle.textContent = "Не расстраивайтесь!";
            modalSubtitle.textContent = `Вы ответили правильно на ${result.correctCount} из ${result.total} вопросов`;
            modalDescription.textContent = "Не переживайте — ошибки это часть обучения. Попробуйте пройти тест снова, чтобы закрепить материал и улучшить результат.";
            break;
        }
    }

    modal.classList.add("modal--open");

    console.log("QUIZ RESULT", result);
}

// Инициализация квиза
const initialQuiz = () => {
    const {title, description} = quizData;

    if (quizHeaderTitleElement) quizHeaderTitleElement.textContent = title;
    if (quizHeaderSubTitleElement) quizHeaderSubTitleElement.textContent = description;

    renderCurrentQuestion();
};

// Обработка отправки формы
const handleSubmitForm = (e) => {
    e.preventDefault();

    if (quiz.getMode() === "answer") {
        const cur = quiz.getCurrentQuestion();
        if (!cur) return;

        const q = cur.question;
        const selectedIds = getSelectedOptionIds();

        if (selectedIds.length === 0) {
            console.warn("Выберите вариант ответа");
            return;
        }

        const result = quiz.answerQuestion(q.id, selectedIds);

        showReview(result.highlightOptionIds);
        return;
    }

    if (quiz.getMode() === "review") {
        if (quiz.isLastQuestion()) {
            finishQuiz();
            return;
        }

        const next = quiz.nextQuestion();
        if (!next) return;

        QuizRouter.setQuestion(next.questionNumber);

        renderCurrentQuestion();
    }
};

// Обработка закрытия квиза
const handleCloseQuiz = (e) => {
    window.location.href = '/quizzes.html';
};

// Обработка перезапуска квиза
const handleRestartQuiz = (e) => {
    e.preventDefault();

    quiz.reset();
    QuizRouter.setQuestion(1);
    initialQuiz();

    modal.classList.remove("modal--open");
};

syncQuestionFromUrl(question);
initialQuiz();

quizQuestionForm.addEventListener("submit", handleSubmitForm);

modalRestartButton.addEventListener("click", handleRestartQuiz);
modalCloseButton.addEventListener("click", handleCloseQuiz);