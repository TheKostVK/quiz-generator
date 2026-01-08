import {Header} from "../components/header";
import {QuizValidator} from "../utils/validation";
import {QuizGenerator} from "../components/quizGenerator";
import {saveQuiz} from "../utils/storage";

const form = document.forms['json-quiz-generator'];
const submitBtn = document.querySelector(".quiz-generator__submit");
const textArea = document.querySelector(".quiz-generator__input");

const banner = document.querySelector(".banner");
const bannerDescription = banner.querySelector(".body__description");
const bannerCloseBtn = banner.querySelector(".banner__btn");

if (!form) throw new Error('main: .quiz-generator__form not found');
if (!submitBtn) throw new Error('main: .quiz-generator__submit not found');
if (!textArea) throw new Error('main: .quiz-generator__input not found');
if (!banner) throw new Error('main: .quiz-generator__banner not found');

const header = new Header();
header.setMenuItems([
    {text: "Посмотреть сохранённые квизы", href: "/quizzes.html", variant: "secondary"},
]);

const quizGenerator = new QuizGenerator(QuizValidator, saveQuiz);

// Обработчик кнопки закрытия баннера
const bannerCloseBtnHandler = (e) => {
    banner.classList.remove("banner--open");

    bannerCloseBtn.removeEventListener("click", bannerCloseBtnHandler);
};

// Обработчик ввода JSON в textArea
const inputJSONHandler = async (e) => {
    e.preventDefault();

    const res = await quizGenerator.setQuizData(textArea.value);

    if (!res.ok) {
        banner.classList.add("banner--open");
        bannerCloseBtn.addEventListener("click", bannerCloseBtnHandler);

        textArea.classList.add("quiz-generator__input--error");
        bannerDescription.textContent = res.message;

        console.error(res);
    } else {
        window.location.href = '/quizzes.html';
    }
};

form.addEventListener("submit", inputJSONHandler);