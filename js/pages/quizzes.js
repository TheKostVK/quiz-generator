import { Header } from "../components/header";
import { QuizCardGenerator } from "../components/quizCard";
import { getAllQuizzes } from "../utils/storage";
import {BASE_URL} from "../../constatns";

const quizzesSection = document.querySelector(".quizzes");
const quizzesListTemplate = document.getElementById("quizzes-list");
const emptyListTemplate = document.getElementById("quizzes-empty");

if (!quizzesSection) throw new Error("quizzesSection: .quizzes not found");
if (!quizzesListTemplate) throw new Error("Template #quizzes-list not found");
if (!emptyListTemplate) throw new Error("Template #quizzes-empty not found");

const header = new Header();
const quizCardGenerator = new QuizCardGenerator();

header.setMenuItems([
    { text: "Добавить квиз", href: `${BASE_URL}index.html`, variant: "primary" },
]);

// Рендер квизов
const renderQuizzes = async () => {
    try {
        const data = await getAllQuizzes();

        quizzesSection.replaceChildren();

        if (!Array.isArray(data) || data.length === 0) {
            const emptyFragment = emptyListTemplate.content.cloneNode(true);
            quizzesSection.append(emptyFragment);
            return;
        }

        const listFragment = quizzesListTemplate.content.cloneNode(true);
        const listNode = listFragment.querySelector(".quizzes__content");

        const fragment = document.createDocumentFragment();

        data.forEach((quiz) => {
            const node = quizCardGenerator.getNodeElement(quiz);
            fragment.append(node);
        });

        listNode.append(fragment);
        quizzesSection.append(listFragment);
    } catch (e) {
        quizzesSection.replaceChildren();

        const errorFragment = emptyListTemplate.content.cloneNode(true);
        const title = errorFragment.querySelector(".quizzes__empty-title");
        const subtitle = errorFragment.querySelector(".quizzes__empty-subtitle");
        const btn = errorFragment.querySelector(".quizzes__empty-action");

        if (title) title.textContent = e instanceof Error ? e.message : "Ошибка загрузки квизов";
        subtitle?.remove();
        btn?.remove();

        quizzesSection.append(errorFragment);
    }
};

await renderQuizzes();