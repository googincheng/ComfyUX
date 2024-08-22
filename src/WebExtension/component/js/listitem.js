import { Button } from './button.js';
import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class ListItem {
    constructor({ iconUrl, name, status, callbacks, button1Text, button2Img }) {
        this.iconUrl = iconUrl;
        this.name = name;
        this.button1Text = button1Text;
        this.button2Img = button2Img;
        this.callbacks = callbacks;
        this.status = status;
        this.element;
        this.init();
    }

    init() {
        this.element = document.createElement('div');
        this.element.className = 'list-item';

        // Left container
        const leftContainer = document.createElement('div');
        leftContainer.className = 'list-item-left';

        if (this.iconUrl) {
            const icon = document.createElement('img');
            icon.src = this.iconUrl;
            icon.className = 'list-item-icon';
            leftContainer.appendChild(icon);
        }

        if (this.status) {
            const status = document.createElement('span');
            this.statusElement = status;
            status.className = 'list-item-status';
            status.textContent = this.status;
            leftContainer.appendChild(status);
        }

        const name = document.createElement('span');
        this.nameElement = name;
        name.className = 'list-item-name';
        name.textContent = this.name;
        leftContainer.appendChild(name);

        // Right container
        const rightContainer = document.createElement('div');
        rightContainer.className = 'list-item-right';

        this.element.appendChild(leftContainer);
        this.element.appendChild(rightContainer);

        if (this.button1Text) {
            this.button1 = new Button({
                container: '',
                iconSrc: '',
                title: this.button1Text,
                fav: '',
                showFavIcon: false,
                callbacks: {
                    onClick: () => {
                        if (this.callbacks) {
                            this.callbacks.onButton1Click();
                        }
                    }
                }
            });
            this.addElement(this.button1.element);
        }

        if (this.button2Img) {
            this.button2 = new Button({
                container: '',
                iconSrc: this.button2Img,
                title: '',
                fav: '',
                showFavIcon: false,
                callbacks: {
                    onClick: () => {
                        if (this.callbacks) {
                            this.callbacks.onButton2Click();
                        }
                    }
                }
            });
            this.addElement(this.button2.element);
        }
    }

    addElement(element) {
        const rightContainer = this.element.querySelector('.list-item-right');
        rightContainer.appendChild(element);
    }

    getElement() {
        return this.element;
    }
}




