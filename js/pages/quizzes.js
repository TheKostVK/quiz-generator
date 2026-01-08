import {Header} from "../components/header";
import {Quiz} from "../components/quiz";

import dataQuiz from "../../quiz-examples/css-quiz.json";

const header = new Header();
//const quizGenerator = new QuizGenerator();

header.setMenuItems([
    { text: 'Добавить квиз', href: '/', variant: 'primary' },
]);
