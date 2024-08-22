import './css.js';
import { staticPath } from "../../ComfyUIConnector.js";

export class Tab {
    constructor({ tabs, contents, callbacks }) {
        this.tabs = tabs;
        this.callbacks = callbacks;
        this.contents = contents;
        this.currentIndex = 0;
        this.element = this.createTab();
    }

    createTab() {

        const container = document.createElement('div');
        container.className = 'tab-container';

        const tabBar = document.createElement('div');
        tabBar.className = 'tab-bar';
        
        //hover effect
        tabBar.onmousemove = e => {
            const rect = tabBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            tabBar.style.setProperty("--mouse-x", `${x}px`);
            tabBar.style.setProperty("--mouse-y", `${y}px`);
        }

        const filterElement = document.createElement('div');
        filterElement.className = 'filter-area';

        this.tabs.forEach((tab, index) => {
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item '+index;
            tabItem.setAttribute("data-i18n", tab.title);

            tabItem.textContent = tab.title;
            if (tab.disabled) {
                tabItem.classList.add('disabled');
            } else {
                tabItem.onclick = () => this.selectTab(index);
            }
            if (index === this.currentIndex) {
                tabItem.classList.add('selected');
            }
            tabBar.appendChild(tabItem);
        });

        const contentArea = document.createElement('div');
        contentArea.className = 'tab-content';

        this.contents.forEach((content, index) => {
            content.className = 'tab-panel '+index;
            if (index === this.currentIndex) {
                content.classList.add('active');
            }
            contentArea.appendChild(content);
        });

        container.appendChild(tabBar);
        container.appendChild(filterElement);
        container.appendChild(contentArea);
        this.tabBar = tabBar;
        this.contentArea = contentArea;

        return container;
    }

    selectTab(index) {
        if (index === this.currentIndex || this.tabs[index].disabled) {
            return;
        }
        if(this.callbacks){
            this.callbacks.onTabClick(index);
        }
        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        const tabItems = this.tabBar.querySelectorAll('.tab-item');
        tabItems[previousIndex].classList.remove('selected');
        tabItems[this.currentIndex].classList.add('selected');

        const contentPanels = this.contentArea.querySelectorAll('.tab-panel');
        contentPanels[previousIndex].classList.remove('active');
        contentPanels[previousIndex].classList.add('previous');
        contentPanels[this.currentIndex].classList.add('active');
        setTimeout(() => {
            contentPanels[previousIndex].classList.remove('previous');
        }, 500);
    }

    renameTab(index,value) {
        const tabItems = this.tabBar.querySelectorAll('.tab-item');
        tabItems[index].textContent = value;
    }
    addElement(contentPanel,content) {
        contentPanel.appendChild(content);
    }
}
