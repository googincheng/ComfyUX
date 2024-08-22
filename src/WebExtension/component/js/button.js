import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Button {
    constructor({container, iconSrc, fav, showFavIcon, title, callbacks}) {
        this.container = container;
        this.iconSrc = iconSrc;
        this.title = title;
        this.callbacks = callbacks;
        this.disabled = false;
        this.fav = fav;
        this.showFavIcon = showFavIcon;
        this.buttonElement;
        this.element;

        this.init();
    }

    init() {
        this.rowElement = document.createElement('div');
        this.rowElement.className = 'row';

        this.favElement = document.createElement('div');
        this.favElement.className = 'fav';

        this.favIconElement = document.createElement('img');
        this.favElement.appendChild(this.favIconElement);
        if(this.fav){
            this.favIconElement.src = staticPath+'component/img/fav_sel.png';
        }
        else{
            this.favIconElement.src = staticPath+'component/img/fav_nor.png';
        }

        if(!this.showFavIcon){this.favElement.style.display = 'none';}
        
        this.buttonElement = document.createElement('div');
        this.buttonElement.className = 'button-container';

        //hover effect
        this.buttonElement.onmousemove = e => {
            const rect = this.buttonElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.buttonElement.style.setProperty("--mouse-x", `${x}px`);
            this.buttonElement.style.setProperty("--mouse-y", `${y}px`);
        }

        const iconElement = document.createElement('img');
        iconElement.className = 'button-icon';
        iconElement.src = this.iconSrc;
        if(!this.iconSrc){iconElement.style.display = 'none';}

        const textElement = document.createElement('span');
        this.textElement = textElement;
        textElement.className = 'button-text';
        textElement.textContent = this.title;
        if(!this.title){textElement.style.display = 'none';}

        this.rowElement.appendChild(this.buttonElement);
        this.rowElement.appendChild(this.favElement);
        this.buttonElement.appendChild(iconElement);
        this.buttonElement.appendChild(textElement);

        this.buttonElement.addEventListener('click', () => this.handleClick());
        this.buttonElement.addEventListener('mouseover', () => this.handleMouseOver());
        this.buttonElement.addEventListener('mouseout', () => this.handleMouseOut());
        this.buttonElement.addEventListener('mousedown', () => this.handleMouseDown());
        this.buttonElement.addEventListener('mouseup', () => this.handleMouseUp());
        this.favElement.addEventListener('click', () => this.handleFav());

        if (this.container) {
            if (typeof (this.container) === "object") {
                this.container.appendChild(this.rowElement);
            }
            else {
                console.log('container must be html object');
            }
        }
        else {
            this.element = this.rowElement;
        }

    }

    handleClick() {
        if (this.disabled) return;
        if (this.callbacks.onClick) this.callbacks.onClick();
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

    handleMouseOver() {
        if (this.disabled) return;
        if (this.callbacks.onMouseOver) this.callbacks.onMouseOver();
    }

    handleMouseOut() {
        if (this.disabled) return;
        if (this.callbacks.onMouseOut) this.callbacks.onMouseOut();
    }

    handleMouseDown() {
        if (this.disabled) return;
        if (this.callbacks.onMouseDown) this.callbacks.onMouseDown();
    }

    handleMouseUp() {
        if (this.disabled) return;
        if (this.callbacks.onMouseUp) this.callbacks.onMouseUp();
    }

    setDisabled(isDisabled) {
        this.disabled = isDisabled;
        if (isDisabled) {
            this.buttonElement.classList.add('disabled');
        } else {
            this.buttonElement.classList.remove('disabled');
        }
    }

    filter(isShow) {
        if (isShow) {
            this.element.style.display = 'inline-flex';
        }
        else {
            this.element.style.display = 'none';
        }
    }
    
    setText(text){
        this.textElement.textContent=text;
    }
}
