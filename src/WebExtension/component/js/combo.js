import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Combo {
    constructor({ icon, title, options, fav, defaultOption, showFavIcon, isSupportSearch, callbacks }) {
        this.icon = icon;
        this.title = title;
        this.options = options;
        this.defaultOption = defaultOption;
        this.callbacks = callbacks;
        this.showFavIcon = showFavIcon;
        this.selectedOption = defaultOption;
        this.offset;//use for scale when popup clipped
        this.fav = fav;
        this.isSupportSearch = isSupportSearch;

        this.element = this.createCombo();
        this.dragging = false;
    }

    createCombo() {
        this.rowElement = document.createElement('div');
        this.rowElement.className = 'row';

        this.favElement = document.createElement('div');
        this.favElement.className = 'fav';

        this.favIconElement = document.createElement('img');
        this.favElement.appendChild(this.favIconElement);
        if (this.fav) {
            this.favIconElement.src = staticPath + 'component/img/fav_sel.png';
        }
        else {
            this.favIconElement.src = staticPath + 'component/img/fav_nor.png';
        }
        
        if(!this.showFavIcon){this.favElement.style.display = 'none';}

        const container = document.createElement('div');
        container.className = 'combo-container';

        //hover effect
        container.onmousemove = e => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            container.style.setProperty("--mouse-x", `${x}px`);
            container.style.setProperty("--mouse-y", `${y}px`);
        }

        const left = document.createElement('div');
        left.className = 'combo-left';

        const iconElement = document.createElement('img');
        iconElement.src = this.icon;
        iconElement.className = 'combo-icon';

        const titleElement = document.createElement('span');
        titleElement.className = 'combo-title';
        titleElement.textContent = this.title;

        left.appendChild(iconElement);
        left.appendChild(titleElement);

        const right = document.createElement('div');
        right.className = 'combo-right';

        const valueElement = document.createElement('span');
        valueElement.className = 'combo-value';
        valueElement.textContent = this.selectedOption;

        const iconRightElement = document.createElement('img');
        iconRightElement.src = staticPath + 'component/img/arrow_down.png'; // Update with your icon path
        iconRightElement.className = 'combo-icon-right';

        right.appendChild(valueElement);
        right.appendChild(iconRightElement);

        container.appendChild(left);
        container.appendChild(right);

        const dropdown = document.createElement('div');
        this.dropdown = dropdown;
        dropdown.className = 'combo-dropdown';

        this.options.sort();

        const searchInput = document.createElement('input');
        this.searchInput = searchInput;
        searchInput.className = 'combo-search';
        dropdown.appendChild(searchInput);
        searchInput.placeholder = 'Click to Search';
        searchInput.setAttribute("data-i18n", "ClickToSearch");

        if (this.isSupportSearch) { searchInput.style.display = 'flex'; }
        else { searchInput.style.display = 'none'; }

        this.options.forEach(option => {
            const item = document.createElement('div');
            item.className = 'combo-dropdown-item';
            item.textContent = option;
            item.onclick = () => this.selectOption(option);
            if (option === this.defaultOption) {
                item.classList.add('selected');
            }
            dropdown.appendChild(item);
        });

        const menuItems = dropdown.querySelectorAll('.combo-dropdown-item');
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            menuItems.forEach(item => {
                const text = item.textContent || item.innerText;
                if (text.toLowerCase().includes(searchTerm)) {
                    let highlightedText = text.replace(new RegExp(searchTerm, 'g'), match => `<span class="highlight">${match}</span>`);
                    item.innerHTML = item.textContent.replace(new RegExp(searchTerm, 'gi'), match => `<span class="highlight">${match}</span>`);
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        if (dropdown.childElementCount === 0) {
            dropdown.textContent = '(Nothing here Bae❤️)';
        }

        this.favElement.addEventListener('click', () => this.handleFav());

        this.rowElement.appendChild(container);
        this.rowElement.appendChild(this.favElement);

        document.body.appendChild(dropdown);

        // valueElement.onclick = () => this.toggleDropdown(dropdown, container);
        // iconRightElement.onclick = () => this.toggleDropdown(dropdown, container);

        this.isNeedScale = false;
        container.onclick = () => this.toggleDropdown(dropdown, container);
        dropdown.style.display = 'none';

        return this.rowElement;
    }
    // //内嵌式的下拉菜单 弃用
    // toggleDropdown(dropdown, container) {
    //     const valueRect = container.getBoundingClientRect();
    //     const containerRect = this.rowElement.parentElement.getBoundingClientRect();

    //     if(dropdown.style.display === 'none'){
    //         dropdown.style.display = 'block';
    //         //todo 添加收藏后，parentElement会改变
    //         if(containerRect.bottom - valueRect.bottom < dropdown.clientHeight){
    //             this.isNeedScale = true;
    //             this.offset = dropdown.clientHeight - (containerRect.bottom - valueRect.bottom) + 16;        
    //             this.rowElement.parentElement.style.height = this.rowElement.parentElement.clientHeight + this.offset +'px';
    //         }
    //     }
    //     else{
    //         if(this.isNeedScale){
    //             this.rowElement.parentElement.style.height = this.rowElement.parentElement.clientHeight - this.offset +'px';
    //             this.isNeedScale = false;
    //         }
    //         dropdown.style.display = 'none';
    //     }
    //     // dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    // }
    toggleDropdown(dropdown, container) {
        const valueRect = container.getBoundingClientRect();

        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
            dropdown.style.setProperty('--topleft-x', valueRect.left + 'px');
            dropdown.style.setProperty('--topleft-y', valueRect.bottom + 4 + 'px');
            dropdown.style.width = valueRect.right - valueRect.left + 'px';
            this.searchInput.focus();
            //reset search input
            this.searchInput.value = '';
            dropdown.querySelectorAll('.combo-dropdown-item').forEach(item => {
                item.style.display = '';
                item.innerHTML = item.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
            });
            //click empty to close dropdown
            document.addEventListener('click', (event) => {
                event.stopPropagation();
                if (!dropdown.contains(event.target) && !event.target.contains(container)) {
                    dropdown.style.display = 'none';
                    document.removeEventListener('click',()=>{});
                }
            });
        }
        else {
            dropdown.style.display = 'none';
        }
    }
    selectOption(option) {
        this.selectedOption = option;
        this.element.querySelector('.combo-value').textContent = option;
        this.dropdown.querySelectorAll('.combo-dropdown-item').forEach(item => {
            item.classList.toggle('selected', item.textContent === option);
        });
        this.dropdown.style.display = 'none';
        if (this.callbacks) {
            this.callbacks.onSelect(option);
        }
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
    setOption(option) {
        this.selectedOption = option;
        this.element.querySelector('.combo-value').textContent = option;
        this.dropdown.querySelectorAll('.combo-dropdown-item').forEach(item => {
            item.classList.toggle('selected', item.textContent === option);
        });
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

