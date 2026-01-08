export class QuizRouter {
    // Получение текущих параметров url
    static getState() {
        const params = new URLSearchParams(window.location.search);

        const quizId = params.get("id");
        const question = Number(params.get("question") || 1);

        return { quizId, question };
    }

    // Задать номер вопроса
    static setQuestion(question) {
        const url = new URL(window.location.href);

        url.searchParams.set("question", String(question));
        history.pushState({}, "", url);
    }
}