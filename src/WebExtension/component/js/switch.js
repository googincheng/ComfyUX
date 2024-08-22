import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Switch {
    constructor({ icon, title, value,fav ,showFavIcon,hintOn,hintOff, onChange,callbacks }) {
        this.icon = icon;
        this.title = title;
        this.value = value;
        if(hintOn){this.hintOn = hintOn}
        else{this.hintOn = "True"}
        if(hintOff){this.hintOff = hintOff}
        else{this.hintOff = "False"}
        this.callbacks = callbacks;
        this.showFavIcon = showFavIcon;
        this.fav = fav;
        this.onChange = onChange;
        this.element = this.createSwitch();
    }

    createSwitch() {
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

        const switchContainer = document.createElement('div');
        this.switchContainer = switchContainer;
        switchContainer.className = 'switch-container';
        
        //hover effect
        switchContainer.onmousemove = e => {
            const rect = switchContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            switchContainer.style.setProperty("--mouse-x", `${x}px`);
            switchContainer.style.setProperty("--mouse-y", `${y}px`);
        }

        const switchLeft = document.createElement('div');
        switchLeft.className = 'switch-left';

        if(this.icon){
            const iconElement = document.createElement('span');
            iconElement.className = 'icon';
            const iconImg = document.createElement('img');
            iconImg.src = this.icon;
            iconElement.appendChild(iconImg);
            switchLeft.appendChild(iconElement);
        }

        const titleElement = document.createElement('span');
        this.titleElement = titleElement;
        titleElement.className = 'title';
        titleElement.innerText = this.title;

        switchLeft.appendChild(titleElement);

        const switchRight = document.createElement('div');
        switchRight.className = 'switch-right';

        const hintElement = document.createElement('span');
        this.hintElement = hintElement;
        hintElement.className = 'hint';
        if(this.value){
            hintElement.innerText = this.hintOn;
        }
        else{
            hintElement.innerText = this.hintOff;
        }

        const switchElement = document.createElement('label');
        switchElement.className = 'switch';

        const inputElement = document.createElement('input');
        this.inputElement = inputElement;
        inputElement.type = 'checkbox';
        inputElement.addEventListener('change', () => {
            this.onChange(inputElement.checked, hintElement);
            if(this.value){
                hintElement.innerText = this.hintOn;
            }
            else{
                hintElement.innerText = this.hintOff;
            }
        });

        if(this.value){
            inputElement.checked;
        }

        const sliderElement = document.createElement('span');
        sliderElement.className = 'slider';

        switchElement.appendChild(inputElement);
        switchElement.appendChild(sliderElement);

        switchRight.appendChild(hintElement);
        switchRight.appendChild(switchElement);

        switchContainer.appendChild(switchLeft);
        switchContainer.appendChild(switchRight);

        this.rowElement.appendChild(switchContainer);
        this.rowElement.appendChild(this.favElement);

        switchContainer.addEventListener('click', () => {
            this.value = !inputElement.checked;
            inputElement.checked = !inputElement.checked;
            if(this.value){
                hintElement.innerText = this.hintOn;
            }
            else{
                hintElement.innerText = this.hintOff;
            }
            this.onChange(inputElement.checked, hintElement);
        });

        return this.rowElement;
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

    setValue(value){
        this.value = value;
        this.inputElement.checked = value;
        if(this.value){
            this.hintElement.innerText = this.hintOn;
        }
        else{
            this.hintElement.innerText = this.hintOff;
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
}
