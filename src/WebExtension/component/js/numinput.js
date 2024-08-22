import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class NumInput {
    constructor({ iconLeft, title, iconRight, min, max ,round,showFavIcon,step, value, fav,precision, onChange,callbacks }) {
        this.iconLeft = iconLeft;
        this.title = title;
        this.iconRight = iconRight;
        this.min = min;
        this.max = max;
        this.round = round;
        this.step = step;
        this.precision = precision;
        this.onChange = onChange;
        this.value = value;
        this.callbacks = callbacks;
        this.showFavIcon = showFavIcon;
        this.fav = fav;
        this.onChangeDebounced = this.debounce((value) => this.onChange(value), 100); // 300毫秒内连续的变更只会触发一次onChange
        this.element = this.createNumInput();
        
        this.dragging = false;
        this.editting = false;
    }

    createNumInput() {
        this.rowElement = document.createElement('div');
        this.rowElement.className = 'row';

        this.favElement = document.createElement('div');
        this.favElement.className = 'fav';
        this.favElement.addEventListener('click', () => this.handleFav());

        this.favIconElement = document.createElement('img');
        this.favElement.appendChild(this.favIconElement);
        if(this.fav){
            this.favIconElement.src = staticPath+'component/img/fav_sel.png';
        }
        else{
            this.favIconElement.src = staticPath+'component/img/fav_nor.png';
        }
        if(!this.showFavIcon){this.favElement.style.display = 'none';}

        const numInputContainer = document.createElement('div');
        this.numInputContainer = numInputContainer;
        numInputContainer.className = 'numinput-container';
        
        //hover effect
        numInputContainer.onmousemove = e => {
            const rect = numInputContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            numInputContainer.style.setProperty("--mouse-x", `${x}px`);
            numInputContainer.style.setProperty("--mouse-y", `${y}px`);
        }
        
        const numInputLeft = document.createElement('div');
        numInputLeft.className = 'numinput-left';

        const iconLeftElement = document.createElement('span');
        iconLeftElement.className = 'icon';
        const iconLeftImg = document.createElement('img');
        iconLeftImg.src = this.iconLeft;
        iconLeftElement.appendChild(iconLeftImg);
        iconLeftElement.addEventListener('click', () => {
            this.updateValue(-this.step);
        });

        const titleElement = document.createElement('span');
        this.titleElement = titleElement;
        titleElement.className = 'title';
        titleElement.innerText = this.title;

        numInputLeft.appendChild(iconLeftElement);
        numInputLeft.appendChild(titleElement);

        const numInputRight = document.createElement('div');
        numInputRight.className = 'numinput-right';

        const numberInputElement = document.createElement('input');
        this.numberInputElement = numberInputElement;
        numberInputElement.className = 'number-input';
        numberInputElement.type = 'number';
        numberInputElement.value = this.value.toFixed(this.precision);
        numberInputElement.min = this.min;
        numberInputElement.max = this.max;
        numberInputElement.step = this.step;
        numberInputElement.addEventListener('change', (e) => {
            this.value=e.target.value;
            this.value = Math.min(Math.max(this.value, this.min), this.max);
            this.element.querySelector('.number-input').value = this.value.toFixed(this.precision);
            this.onChange(this.value);
        });

        numberInputElement.addEventListener('input', (e) => {
            this.editting = true;
            if (this.callbacks.onEdit){
                this.callbacks.onEdit(this.editting);
            }
        });
        numberInputElement.addEventListener('blur',(e) => {
            this.editting = false;
            if (this.callbacks.onEdit){
                this.callbacks.onEdit(this.editting);
            }
        });
        numberInputElement.addEventListener('focus', function() {
            this.select();
        });

        const iconRightElement = document.createElement('span');
        iconRightElement.className = 'icon';
        const iconRightImg = document.createElement('img');
        iconRightImg.src = this.iconRight;
        iconRightElement.appendChild(iconRightImg);
        iconRightElement.addEventListener('click', () => {
            this.updateValue(this.step);
        });

        numInputRight.appendChild(numberInputElement);
        numInputRight.appendChild(iconRightElement);

        this.rowElement.appendChild(numInputContainer);
        this.rowElement.appendChild(this.favElement);

        numInputContainer.appendChild(numInputLeft);
        numInputContainer.appendChild(numInputRight);

        // Add drag event
        numInputContainer.addEventListener('mousedown', (e) => {
            this.editting = true;
            if (this.callbacks.onEdit){
                this.callbacks.onEdit(this.editting);
            }

            this.dragging = true;
            this.startX = e.pageX;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.dragging) {
                const diffX = e.pageX - this.startX;
                this.updateValue(diffX * this.step);
                this.startX = e.pageX;
            }
        });

        window.addEventListener('mouseup', () => {
            this.editting = false;
            if (this.callbacks.onEdit){
                this.callbacks.onEdit(this.editting);
            }

            this.dragging = false;
        });

        return this.rowElement;
    }

    updateValue(delta) {
        // console.log('🌹numinput before minmax',typeof this.value);
        this.value = Math.min(Math.max(this.value + delta, this.min), this.max);
        // console.log('🌹numinput after minmax',typeof this.value);
        this.element.querySelector('.number-input').value = this.value.toFixed(this.precision);
        // console.log('🌹numinput after toFixed',typeof this.value);
        this.onChangeDebounced(this.value.toFixed(this.precision));
    }

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    setValue(value){
        this.value = value;
        this.element.querySelector('.number-input').value = value;
    }
    
    init(container) {
        container.appendChild(this.element);
    }

    handleFav() {
        if (this.fav) {
            this.fav = false;
            this.favElement.querySelector('img').src = staticPath+'component/img/fav_nor.png'
        } else {
            this.fav = true;
            this.favElement.querySelector('img').src = staticPath+'component/img/fav_sel.png'
        }

        if (this.callbacks.onFav) this.callbacks.onFav(this.fav);
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
