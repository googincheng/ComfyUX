import { Button } from './button.js';
import { Checkbox } from './checkbox.js';
import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Modal {
    constructor(iconUrl, title, content = '', backgroundUrl = '') {
        this.iconUrl = iconUrl;
        this.title = title;
        this.content = content;
        this.backgroundUrl = backgroundUrl;
        this.element = document.createElement('div');
        this.init();
    }

    init() {
        this.element.className = 'ComfuUX-modal';

        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal';
        this.element.appendChild(this.modalElement);

        if (this.backgroundUrl) {
            const background = document.createElement('div');
            background.className = 'modal-background';
            background.style.backgroundImage = `url(${this.backgroundUrl})`;
            background.style.backgroundSize = 'cover';
            this.modalElement.appendChild(background);
        }

        // Header
        const header = document.createElement('div');
        header.className = 'modal-header';

        const icon = document.createElement('img');
        icon.src = this.iconUrl;
        icon.className = 'modal-icon';

        const title = document.createElement('span');
        title.className = 'modal-title';
        title.textContent = this.title;

        header.appendChild(icon);
        header.appendChild(title);

        // Content
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.innerHTML = this.content;

        this.modalElement.appendChild(header);
        this.modalElement.appendChild(content);
    }

    addContent(element) {
        this.modalElement.appendChild(element);
    }

    addFooter(buttons, checkboxText, checkboxCallback) {
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';

        buttons.forEach(button => {
            const btn = new Button({
                container: '',
                iconSrc: '',
                title: button.text,
                fav: '',
                showFavIcon: false,
                callbacks: { onClick : button.callback }
            });
            btn.buttonElement.style.minWidth = '100px';
            if (button.primary) {
                btn.buttonElement.style.setProperty('--background-main', 'var(--primary)');
                btn.buttonElement.style.setProperty('--text-gray', 'var(--text-main)');
                btn.buttonElement.style.fontWeight = 'var(--bold)';
            }
            else{
                btn.buttonElement.style.setProperty('--background-main', 'transparent');
                btn.buttonElement.style.border = '1px solid var(--hover)';
            }
            buttonsContainer.appendChild(btn.element);
        });
        
        // const checkbox = new Checkbox('Check me!', 'right', checkboxCallback);
        const empty = document.createElement('div');
        
        const label = document.createElement('label');
        label.textContent = checkboxText;
        
        footer.appendChild(empty);    
        footer.appendChild(buttonsContainer);

        this.modalElement.appendChild(footer);
    }

    getElement() {
        return this.element;
    }
    
    removeElement(){
        this.element.remove();
    }
}

