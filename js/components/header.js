export class Header {
    #container;
    #nav;
    #burger;

    constructor(options = {}) {
        const {
            containerSelector = '.header',
            navSelector = '.header__nav',
            burgerSelector = '.header__burger',
        } = options;

        this.#container = document.querySelector(containerSelector);
        this.#nav = document.querySelector(navSelector);
        this.#burger = document.querySelector(burgerSelector);

        if (!this.#container) throw new Error('Header: .header not found');
        if (!this.#nav) throw new Error('Header: .header__nav not found');

        if (this.#burger) {
            this.#burger.addEventListener('click', () => {
                this.#container.classList.toggle('header--menu-open');
                this.#nav.classList.toggle('header--menu-mobile');
            });
        }

        // Закрывать меню после клика по пункту
        this.#nav.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('a')) {
                this.#container.classList.remove('header--menu-open');
                this.#nav.classList.remove('header--menu-mobile');
            }
        });
    }

    // Получает список кнопок для отображения в меню
    setMenuItems(items) {
        if (!this.#nav) return;

        this.#nav.replaceChildren();

        items.forEach((item) => {
            const el = document.createElement('a');

            el.href = item.href;
            el.textContent = item.text;

            if (item.variant) {
                el.className = `btn btn--${item.variant} header__nav-item`;
            } else {
                el.className = 'header__link';
            }

            if (item.ariaLabel) el.setAttribute('aria-label', item.ariaLabel);
            if (item.isActive) el.classList.add('header__link--active');

            this.#nav.append(el);
        });
    }
}