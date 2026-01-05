
export class Header {
    _container = null;

    constructor() {
        this._container = document.querySelector('.header');

        const header = document.querySelector('.header');
        const burger = document.querySelector('.header__burger');

        if (header && burger) {
            burger.addEventListener('click', () => {
                header.classList.toggle('header--menu-open');
            });
        }
    }
}