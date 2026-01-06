import { init } from "../utils/init";
import {Header} from "../components/layout/header";
import {Quiz} from "../components/quiz";

import dataQuiz from "../../quiz-examples/css-quiz.json";

init();

const header = new Header();
//const quizGenerator = new QuizGenerator();

header.setMenuItems([
    { text: 'Добавить квиз', href: '/', variant: 'primary' },
]);
