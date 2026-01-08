export class QuizOptionCard {
    #template;
    #root = null;
    #choice = null;
    #input = null;
    #label = null;
    #hint = null;

    id = null;
    inputType = "radio";
    name = "";
    text = "";
    correct = false;
    message = "";
    locked = false;
    status = "neutral";

    constructor() {
        const template = document.getElementById("quiz_option");

        if (!template) throw new Error("QuizOptionCard: template #quiz_option not found");

        this.#template = template;
    }

    /**
     * Создаёт DOM-узел и сохраняет ссылки на элементы
     */
    create(params) {
        const { optionId, inputType, name, text, correct = false, message = "" } = params;

        if (optionId === undefined || optionId === null) throw new Error("QuizOptionCard: optionId is required");
        if (inputType !== "radio" && inputType !== "checkbox") throw new Error("QuizOptionCard: inputType invalid");
        if (!name) throw new Error("QuizOptionCard: name is required");
        if (!text) throw new Error("QuizOptionCard: text is required");

        this.id = optionId;
        this.inputType = inputType;
        this.name = name;
        this.text = text;
        this.correct = Boolean(correct);
        this.message = message;

        const fragment = this.#template.content.cloneNode(true);

        const root = fragment.querySelector(".quiz__option");
        const choice = fragment.querySelector(".choice");
        const input = fragment.querySelector(".choice__input");
        const label = fragment.querySelector(".choice__label");
        const hint = fragment.querySelector(".choice__hint");

        if (!root || !choice || !input || !label) {
            throw new Error("QuizOptionCard: template structure is invalid");
        }

        this.#root = root;
        this.#choice = choice;
        this.#input = input;
        this.#label = label;
        this.#hint = hint;

        if (this.inputType === "radio") {
            choice.classList.add("choice--radio");
            input.type = "radio";
        } else {
            choice.classList.remove("choice--radio");
            input.type = "checkbox";
        }

        input.name = this.name;
        input.value = String(this.id);

        label.textContent = this.text;

        if (this.#hint) {
            if (this.message) {
                this.#hint.textContent = this.message;
                this.#hint.hidden = true;
            } else {
                this.#hint.remove();
                this.#hint = null;
            }
        }

        this.clearStatus();
        this.unlock();

        return root;
    }

    /**
     * Заблокировать вариант:
     * - взаимодействие отключаем через pointer-events и aria-disabled
     */
    lock() {
        if (!this.#choice || !this.#input) throw new Error("QuizOptionCard: node not created");

        this.locked = true;

        this.#choice.setAttribute("disabled", this.locked);
        this.#choice.setAttribute("aria-disabled", "true");

        this.#choice.style.pointerEvents = "none";
        this.#input.disabled = true;
        this.#input.tabIndex = -1;
    }

    /**
     * Разблокировать вариант
     */
    unlock() {
        if (!this.#choice || !this.#input) throw new Error("QuizOptionCard: node not created");

        this.locked = false;

        this.#choice.classList.remove("choice--locked");
        this.#choice.removeAttribute("aria-disabled");

        this.#choice.style.pointerEvents = "";
        this.#input.tabIndex = 0;
    }

    /**
     * Показать корректность именно для этого варианта:
     * - если correct=true → success
     * - иначе → error
     */
    showCorrectness(options = {}) {
        const { showHint = true } = options;

        if (!this.#choice) throw new Error("QuizOptionCard: node not created");

        if (this.correct) {
            this.setStatus("success");
        } else {
            this.setStatus("error");
        }

        if (showHint && this.#hint) {
            this.#hint.hidden = false;
        }
    }

    /**
     * Установить статус явно
     */
    setStatus(status) {
        if (!this.#choice) throw new Error("QuizOptionCard: node not created");

        this.status = status;

        this.#choice.classList.remove("choice--success", "choice--error");

        if (status === "success") this.#choice.classList.add("choice--success");
        if (status === "error") this.#choice.classList.add("choice--error");

        const span = document.createElement("span");
        span.classList.add("choice__hint", "caption");
        span.textContent = this.message;

        this.#root.appendChild(span);
    }

    /**
     * Сброс статуса
     */
    clearStatus() {
        if (!this.#choice) return;

        this.status = "neutral";
        this.#choice.classList.remove("choice--success", "choice--error");

        if (this.#hint) {
            this.#hint.hidden = true;
            this.#hint.textContent = this.message;
        }
    }

    /**
     * Вернуть данные в одном объекте
     */
    getState() {
        return {
            id: this.id,
            name: this.name,
            inputType: this.inputType,
            text: this.text,
            correct: this.correct,
            message: this.message,
            checked: this.#input ? this.#input.checked : false,
            locked: this.locked,
            status: this.status,
        };
    }
}