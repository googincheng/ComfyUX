import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class MultiInput {
    constructor({ placeholder, title, textContent, fav, onChange, callbacks }) {
        this.placeholder = placeholder;
        this.textContent = textContent;
        this.callbacks = callbacks;
        this.onChange = onChange;
        this.title = title;
        this.fav = fav;

        this.element = this.createMultiInput();
        this.dragging = false;
        this.editting = false;
    }

    createMultiInput() {
        this.rowElement = document.createElement('div');
        this.rowElement.className = 'row';

        this.favElement = document.createElement('div');
        this.favElement.className = 'fav';
        this.favElement.addEventListener('click', () => this.handleFav());

        this.favIconElement = document.createElement('img');
        this.favElement.appendChild(this.favIconElement);
        if (this.fav) {
            this.favIconElement.src = staticPath + 'component/img/fav_sel.png';
        }
        else {
            this.favIconElement.src = staticPath + 'component/img/fav_nor.png';
        }


        const multiInputContainer = document.createElement('div');
        multiInputContainer.className = 'multiinput-container';
        
        //hover effect
        multiInputContainer.onmousemove = e => {
            const rect = multiInputContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            multiInputContainer.style.setProperty("--mouse-x", `${x}px`);
            multiInputContainer.style.setProperty("--mouse-y", `${y}px`);
        }

        this.textAreaElement = document.createElement('textarea');
        this.textAreaElement.className = 'multiinput-textarea';

        if (this.textContent) {
            this.textAreaElement.textContent = this.textContent;
        }
        if (this.placeholder) {
            this.textAreaElement.placeholder = this.placeholder;
        }
        else {
            this.textAreaElement.placeholder = 'Click to input...';
        }

        this.textAreaElement.addEventListener('input', (e) => {
            this.editting = true;
            if (this.callbacks.onEdit) {
                this.callbacks.onEdit(this.editting);
            }
        });
        this.textAreaElement.addEventListener('blur', (e) => {
            this.editting = false;
            if (this.callbacks.onEdit) {
                this.callbacks.onEdit(this.editting);
            }
        });

        this.textAreaElement.addEventListener('change', (e) => {
            this.value = e.target.value.toString();
            this.onChange(this.value);
        });

        this.rowElement.appendChild(multiInputContainer);
        this.rowElement.appendChild(this.favElement);

        multiInputContainer.appendChild(this.textAreaElement);

        return this.rowElement;
    }

    init(container) {
        container.appendChild(this.element);
    }

    handleFav() {
        if (this.fav) {
            this.fav = false;
            this.favElement.querySelector('img').src = staticPath + 'component/img/fav_nor.png'
        } else {
            this.fav = true;
            this.favElement.querySelector('img').src = staticPath + 'component/img/fav_sel.png'
        }

        if (this.callbacks.onFav) this.callbacks.onFav(this.fav);
    }

    setValue(value) {
        this.value = value;
        this.textAreaElement.value = value;
    }

    filter(isShow) {
        if (isShow) {
            this.element.style.display = 'inline-flex';
        }
        else {
            this.element.style.display = 'none';
        }
    }

}
