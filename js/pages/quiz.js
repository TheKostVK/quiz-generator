import {Quiz} from "../components/quiz";
import dataQuiz from "../../quiz-examples/css-quiz.json";
import {Header} from "../components/header";

const header = new Header();
const quiz = new Quiz(dataQuiz);

header.setMenuItems([
    {text: 'Посмотреть сохранённые квизы', href: '/quizzes.html', variant: 'secondary'},
]);

export function setProgress(barEl, current, total) {
    const fill = barEl.querySelector('.quiz__progress-fill');

    if (!fill) return;

    const safeTotal = Math.max(1, total);
    const clamped = Math.min(Math.max(current, 1), safeTotal);
    const percent = (clamped / safeTotal) * 100;

    fill.style.width = `${percent}%`;
    barEl.setAttribute('aria-valuenow', String(clamped));
    barEl.setAttribute('aria-valuemax', String(safeTotal));
}

console.log(quiz.quiz.questions);
console.log(quiz.getNextQuestion());
console.log(quiz.setAnswerQuestion(1, [2]));
console.log(quiz.setAnswerQuestion(2, [1, 2, 3, 4]));
console.log(quiz.setAnswerQuestion(3, [3]));
console.log(quiz.getQuizResult());

setProgress(document.querySelector('.quiz__progress-bar'), 1, 7);