import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Dropdown {
    constructor(container, options) {
        this.container = container;
        this.nodeID = options.nodeID;
        this.title = options.title;
        this.iconLeft = options.iconLeft;
        this.iconRight = options.iconRight;
        this.buttonText = options.buttonText;
        this.buttonIcon = options.buttonIcon;
        this.content = options.content;
        this.color;
        this.buttonFunctions = options.buttonFunctions || {};
        this.widgets = [];
        this.isSelected = false;
        this.fav = options.fav;
        this.isBypass = options.isBypass;
        this.isMiss = options.isMiss;
        this.callbacks = options.callbacks;
        this.isExpand = false;
        this.element;

        this.init();
    }

    init() {

        // Create elements
        const dropdownTitle = document.createElement('div');
        this.dropdownTitle = dropdownTitle;
        dropdownTitle.classList.add('dropdown-title');
        dropdownTitle.addEventListener('click', () => this.toggleContent());
        //hover effect
        dropdownTitle.onmousemove = e => {
            const rect = dropdownTitle.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            dropdownTitle.style.setProperty("--mouse-x", `${x}px`);
            dropdownTitle.style.setProperty("--mouse-y", `${y}px`);
        }

        const titleLeft = document.createElement('div');
        titleLeft.classList.add('dropdown-title-left');

        const titleIconLeft = document.createElement('img');
        titleIconLeft.src = this.iconLeft;
        titleIconLeft.addEventListener('click', (e) =>  {
            this.toggleBypass();
            event.stopPropagation();
        });
        titleLeft.appendChild(titleIconLeft);

        const titleText = document.createElement('span');
        titleText.textContent = this.title;
        titleLeft.appendChild(titleText);

        const titleRight = document.createElement('div');
        titleRight.classList.add('dropdown-title-right');
        if (this.buttonIcon) {
            const button = document.createElement('div');
            button.classList.add('dropdown-button');
            const buttonIcon = document.createElement('img');
            const buttonText = document.createElement('span');
            buttonText.textContent = this.buttonText;
            buttonIcon.src = this.buttonIcon;
            button.appendChild(buttonIcon);
            button.appendChild(buttonText);

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleButtonClick('normal');
            });
            button.addEventListener('mouseover', () => this.handleButtonClick('hover'));
            button.addEventListener('mousedown', () => this.handleButtonClick('pressed'));
            button.addEventListener('mouseup', () => this.handleButtonClick('normal'));
            titleRight.appendChild(button);
        }

        const titleIconRight = document.createElement('img');
        titleIconRight.src = this.iconRight;
        titleRight.appendChild(titleIconRight);

        dropdownTitle.appendChild(titleLeft);
        dropdownTitle.appendChild(titleRight);


        const dropdownContent = document.createElement('div');
        this.dropdownContent = dropdownContent;
        dropdownContent.classList.add('dropdown-content');
        dropdownContent.innerHTML = this.content;

        if(this.isBypass){
            this.dropdownTitle.classList.add('bypass');
            this.dropdownContent.classList.add('bypass');
        }

        if(this.isMiss){
            this.dropdownTitle.classList.add('miss');
            this.dropdownContent.classList.add('miss');
        }

        this.element = document.createElement('div');
        this.element.id = this.nodeID;
        this.element.appendChild(dropdownTitle);
        this.element.appendChild(dropdownContent);

        if (this.container) {
            if (typeof this.container !== 'object' || this.container === null || !('nodeType' in this.container)) {
                console.error("container must be dom object");
            } else {
                this.container.appendChild(this.element);
            }
        }

        this.dropdownContent = dropdownContent;
    }

    toggleContent() {
        if (this.dropdownContent.classList.contains('open')) {
            this.dropdownContent.style.height = '0';
            this.dropdownContent.classList.remove('open');
            this.dropdownTitle.classList.remove('selected');
            this.isExpand = false;
            this.isSelected = false;
        } else {
            this.isExpand = true;
            this.isSelected = true;
            this.dropdownContent.style.height = `${this.dropdownContent.scrollHeight + 24}px`;
            this.dropdownContent.classList.add('open');
            this.dropdownTitle.classList.add('selected');
        }
    }

    addElement(widget) {
        this.widgets.push(widget);
        this.dropdownContent.appendChild(widget.element);
    }
    handleButtonClick(state) {
        if (this.buttonFunctions[state]) {
            this.buttonFunctions[state]();
        }
    }

    filter(isShow) {
        if (isShow) {
            this.element.style.display = 'block';
        }
        else {
            this.element.style.display = 'none';
        }
    }

    updateHeight() {
        this.dropdownContent.style.height = `${this.dropdownContent.scrollHeight + 24}px`;
    }
    //todo optimize , click all filter expand all
    toggleAll(isOpen) {
        if (isOpen) {
            this.isExpand = false;
            this.isSelected = false;
            this.dropdownContent.style.height = '0';
            this.dropdownContent.classList.remove('open');
        }
        else {
            this.dropdownContent.style.height = '0';
            this.dropdownContent.classList.remove('open');

            setTimeout(() => { this.toggleContent(); }, 100)
        }
    }

    toggleBypass() {
        console.log("toggleBypass");
        if(this.isBypass){
            this.isBypass = !this.isBypass;
            this.dropdownTitle.classList.remove('bypass');
            this.dropdownContent.classList.remove('bypass');
            if(this.callbacks.onBypass){
                this.callbacks.onBypass(this.isBypass);
            }
        }
        else{
            this.isBypass = !this.isBypass;
            this.dropdownTitle.classList.add('bypass');
            this.dropdownContent.classList.add('bypass');
            if(this.callbacks.onBypass){
                this.callbacks.onBypass(this.isBypass);
            }
        }
    }
}

