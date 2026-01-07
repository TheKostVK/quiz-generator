export class Header {
    /** @type {HTMLElement|null} */
    _container = null;

    /** @type {HTMLElement|null} */
    _nav = null;

    /** @type {HTMLButtonElement|null} */
    _burger = null;

    /**
     * @param {{
     *  containerSelector?: string,
     *  navSelector?: string,
     *  burgerSelector?: string
     * }=} options
     */
    constructor(options = {}) {
        const {
            containerSelector = '.header',
            navSelector = '.header__nav',
            burgerSelector = '.header__burger',
        } = options;

        this._container = document.querySelector(containerSelector);
        this._nav = document.querySelector(navSelector);
        this._burger = document.querySelector(burgerSelector);

        if (!this._container) throw new Error('Header: .header not found');
        if (!this._nav) throw new Error('Header: .header__nav not found');

        if (this._burger) {
            this._burger.addEventListener('click', () => {
                this._container.classList.toggle('header--menu-open');
                this._nav.classList.toggle('header--menu-mobile');
            });
        }

        // Закрывать меню после клика по пункту
        this._nav.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('a')) {
                this._container.classList.remove('header--menu-open');
                this._nav.classList.remove('header--menu-mobile');
            }
        });
    }

    /**
     * @typedef {'primary'|'secondary'|'link'} ButtonVariant
     */

    /**
     * @typedef {Object} HeaderItem
     * @property {string} text
     * @property {string} href
     * @property {ButtonVariant=} variant
     * @property {string=} ariaLabel
     * @property {boolean=} isActive
     * @property {boolean=} isHiddenOnMobile
     */
    /**
     * @param {HeaderItem[]} items
     */
    setMenuItems(items) {
        if (!this._nav) return;

        this._nav.replaceChildren();

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
            if (item.isHiddenOnMobile) el.classList.add('header__link--mobile-hidden');

            this._nav.append(el);
        });
    }

    closeMenu() {
        this._container?.classList.remove('header--menu-open');
    }

    openMenu() {
        this._container?.classList.add('header--menu-open');
    }
}