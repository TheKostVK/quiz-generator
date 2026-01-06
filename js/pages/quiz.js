import { init } from "../utils/init";
import {Quiz} from "../components/quiz";
import dataQuiz from "../../quiz-examples/css-quiz.json";

init();

const quiz = new Quiz(dataQuiz);

console.log(quiz.quiz.questions);
console.log(quiz.getNextQuestion());
console.log(quiz.setAnswerQuestion(1, [2]));
console.log(quiz.setAnswerQuestion(2, [1,2,3,4]));
console.log(quiz.setAnswerQuestion(3, [3]));
console.log(quiz.getQuizResult());