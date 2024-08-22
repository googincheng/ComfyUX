import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Checkbox {
    constructor(labelText, labelPosition = 'right', callback = null) {
        this.labelText = labelText;
        this.labelPosition = labelPosition;
        this.callback = callback;
        this.checked = false;
        this.element = document.createElement('div');
        this.init();
    }

    init() {
        this.element.className = 'checkbox-container';

        this.checkbox = document.createElement('div');
        this.checkbox.className = 'custom-checkbox';

        this.label = document.createElement('span');
        this.label.className = 'checkbox-label';
        this.label.textContent = this.labelText;

        this.checkbox.addEventListener('click', (event) => {
            this.toggleCheckbox();
            event.stopPropagation();
        });

        if (this.labelPosition === 'left') {
            this.element.appendChild(this.label);
            this.element.appendChild(this.checkbox);
        } else {
            this.element.appendChild(this.checkbox);
            this.element.appendChild(this.label);
        }
    }

    toggleCheckbox() {
        this.checked = !this.checked;
        this.checkbox.classList.toggle('checked', this.checked);
        if (this.callback) {
            this.callback(this.checked);
        }
    }

    getElement() {
        return this.element;
    }

    isChecked() {
        return this.checked;
    }

    setChecked(value) {
        this.checked = value;
        this.checkbox.classList.toggle('checked', this.checked);
        if (this.callback) {
            this.callback(this.checked);
        }
    }
}
