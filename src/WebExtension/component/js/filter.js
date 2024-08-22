import './css.js';

export class Filter {
    constructor(categories, callback) {
        this.categories = categories;
        this.callback = callback;
        this.selectedCategory = this.categories[0];//default selectf
        this.element = this.init();
    }

    init() {
        const container = document.createElement('div');
        container.classList.add('filter-container');

        //hover effect
        container.onmousemove = e => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            container.style.setProperty("--mouse-x", `${x}px`);
            container.style.setProperty("--mouse-y", `${y}px`);
        }

        this.optionsContainer = document.createElement('div');
        this.optionsContainer.classList.add('filter-options');

        this.categories.forEach(category => {
            const option = document.createElement('div');
            option.classList.add('filter-option');
            option.classList.add(category.name);

            const optionName = document.createElement('div');
            optionName.classList.add('filter-option-name');
            optionName.setAttribute("data-i18n", category.name);
            optionName.textContent = category.name;

            const optionCnt = document.createElement('div');
            optionCnt.classList.add('filter-option-cnt');
            optionCnt.textContent = category.count;

            option.appendChild(optionName);
            option.appendChild(optionCnt);

            option.addEventListener('click', () => this.selectCategory(category, option));

            this.optionsContainer.appendChild(option);
        });

        // optionsContainer.children[0].classList.add('selected');

        container.appendChild(this.optionsContainer);

        return container;
    }

    selectCategory(category, optionElement) {
        if (optionElement.classList.contains('disabled')) return;

        this.clearSelection();
        this.selectedCategory = category;
        optionElement.classList.add('selected');
        if (this.callback) {
            this.callback(category);
        }
    }

    clearSelection() {
        const options = this.element.querySelectorAll('.filter-option');
        options.forEach(option => option.classList.remove('selected'));
    }

    addCategory(category) {
        const option = document.createElement('div');
        option.classList.add('filter-option');
        option.textContent = `${category.name} (${category.count})`;
        option.addEventListener('click', () => this.selectCategory(category, option));

        this.element.querySelector('.filter-options').appendChild(option);
        this.categories.push(category);
    }

    disableCategory(categoryName) {
        const options = this.element.querySelectorAll('.filter-option');
        options.forEach(option => {
            if (option.textContent.startsWith(categoryName)) {
                option.classList.add('disabled');
            }
        });
    }

    setCategoryCount(cntList) {
        let tabList = this.optionsContainer.querySelectorAll('.filter-option-cnt');
        for(let i = 0; i<tabList.length;i++){
            tabList[i].textContent = cntList[i];
            this.categories[i].count = cntList[i];
        }
    }
}

