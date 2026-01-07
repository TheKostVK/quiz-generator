import {init} from "../utils/init";
import {Quiz} from "../components/quiz";
import dataQuiz from "../../quiz-examples/css-quiz.json";
import {Header} from "../components/layout/header";

init();

const header = new Header();
const quiz = new Quiz(dataQuiz);

header.setMenuItems([
    {text: 'Посмотреть сохранённые квизы', href: '/quizzes.html', variant: 'secondary'},
]);

console.log(quiz.quiz.questions);
console.log(quiz.getNextQuestion());
console.log(quiz.setAnswerQuestion(1, [2]));
console.log(quiz.setAnswerQuestion(2, [1, 2, 3, 4]));
console.log(quiz.setAnswerQuestion(3, [3]));
console.log(quiz.getQuizResult());