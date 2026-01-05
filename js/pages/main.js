import { init } from "../utils/init";
import {Header} from "../components/header";
import {Quiz} from "../components/quiz";

import dataQuiz from "../../quiz-examples/css-quiz.json";

init();

const menu = new Header();

const quiz = new Quiz(dataQuiz);

console.log(quiz.getNextQuestion());
console.log(quiz.setAnswerQuestion(1, 1));