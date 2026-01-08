import {BASE_URL} from "../../constatns";

export class QuizCardGenerator {
    template = null;

    constructor() {
        const cardTemplate = document.getElementById('quiz-card');

        if (!cardTemplate) throw new Error('QuizCard: cardTemplate is required');

        this.template = cardTemplate;
    }

    // Получает элемент node
    getNodeElement({id, title, description, questions}) {
        if (!this.template) throw new Error('Template #quiz-card-template not found');
        if (!id) throw new Error('QuizCard: id is required');
        if (!title) throw new Error('QuizCard: title is required');
        if (!Array.isArray(questions)) throw new Error('QuizCard: questions must be array');

        const questionCount = questions.length;

        const fragment = this.template.content.cloneNode(true);
        const card = fragment.querySelector('.quiz-card');

        const titleEl = card.querySelector('.quiz-card__title');
        const descEl = card.querySelector('.quiz-card__description');
        const countEl = card.querySelector('.quiz-card__questions-count');
        const actionEl = card.querySelector('.quiz-card__action');

        titleEl.textContent = title;
        descEl.textContent = description;
        countEl.textContent = `${questionCount} вопросов`;
        actionEl.href = `${BASE_URL}quiz.html?id=${encodeURIComponent(id)}`;

        return fragment;
    }
}