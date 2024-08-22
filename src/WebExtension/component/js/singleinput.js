
import { staticPath } from "../../ComfyUIConnector.js";

export class SingleInput {
    constructor({ title, placeholder, value,showFavIcon, fav, leftIcon,callbacks }) {
        this.title = title;
        this.placeholder = placeholder;
        this.value = value;
        this.callbacks = callbacks;
        this.leftIcon = leftIcon;
        this.showFavIcon = showFavIcon;
        this.fav = fav;
        this.element;
        this.init();
        this.editting = false;
    }

    init() {
        this.rowElement = document.createElement('div');
        this.rowElement.className = 'row';
        this.element = this.rowElement;

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


        this.container = document.createElement('div');
        this.container.className = 'single-input-container';

        //hover effect
        this.container.onmousemove = e => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.container.style.setProperty("--mouse-x", `${x}px`);
            this.container.style.setProperty("--mouse-y", `${y}px`);
        }
        
        const leftSection = document.createElement('div');
        leftSection.className = 'left-section';
        
        const leftIconImg = document.createElement('img');
        leftIconImg.src = this.leftIcon;
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = this.title;
        
        leftSection.appendChild(leftIconImg);
        leftSection.appendChild(titleSpan);
        
        const rightSection = document.createElement('div');
        rightSection.className = 'right-section';
        
        const input = document.createElement('input');
        input.className = 'right-input'
        input.type = 'text';
        input.placeholder = this.placeholder;
        input.value = this.value;

        input.addEventListener('input', (e) => {
            this.editting = true;
            if (this.callbacks.onEdit) {
                this.callbacks.onEdit(this.editting);
            }
        });
        input.addEventListener('blur', (e) => {
            this.editting = false;
            if (this.callbacks.onEdit) {
                this.callbacks.onEdit(this.editting);
            }
        });
        input.addEventListener('focus', function() {
            this.select();
        });

        input.addEventListener('change', (e) => {
            this.value = e.target.value.toString();
            if (this.callbacks.onChange) {
                this.callbacks.onChange(this.value);
            }
        });

        rightSection.appendChild(input);
        
        this.container.appendChild(leftSection);
        this.container.appendChild(rightSection);

        this.rowElement.appendChild(this.container);
        this.rowElement.appendChild(this.favElement);
        
    }

    getElement() {
        return this.element;
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
    
    setValue(value){
        this.value = value;
        this.element.querySelector('.right-input').value = value;
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


