import { Carousel } from './component/js/carousel.js';
import { Dropdown } from './component/js/dropdown.js';
import { Button } from './component/js/button.js';
import { Switch } from './component/js/switch.js';
import { NumInput } from './component/js/numinput.js';
import { MultiInput } from './component/js/multiinput.js';
import { Combo } from './component/js/combo.js';
import { Tab } from './component/js/tab.js';
import { ListItem } from './component/js/listitem.js';
import { ComnfyUIapp } from "./ComfyUIConnector.js";
import { Filter } from './component/js/filter.js';
import { NodeListOfSidebar, favWidgetCount, NodeNullCount, ComfyUXi18n } from './ComfyUX.js'
import { ComnfyUIapi, staticPath } from "./ComfyUIConnector.js";

export class Sidebar {
    constructor() {
        this.carousel;
        this.tab;
        this.tabHistory;
        this.historyCountOfSidebar = 0;
        this.queueCountOfSidebar = 0;
        this.runningCountOfSidebar = 0;
        this.tabAll;
        this.element;
        this.container;
        this.isResizing;
        this.init();
    }
    init() {
        this.ComfyBody = document.getElementsByTagName('body')[0];
        this.ComfyBody.style.display = 'flex';

        this.initContainer();
        this.initResizer();
        this.initContexMenu();
        this.initCarousel();
        this.initTab();
        this.initFilterOfNode();
        this.initTabHistory();

    }

    initContainer() {
        const container = this.ComfyBody.appendChild(document.createElement('div'));
        this.container = container;
        this.container.className = 'ComfyUXSidebar';
        this.container.style.backgroundColor = '#202022';
        this.container.style.width = '300px';
        this.container.style.position = 'fixed';
        this.container.style.zIndex = '99';
        this.container.style.left = 'unset';
        this.container.style.right = '0px';
        this.container.style.top = '50px';
        this.container.style.bottom = '0px';
        this.container.style.borderLeft = '1px solid rgb(255, 255, 255, 0.2)';

        // this.container.style.left = '0px';
        // this.container.style.right = 'unset';

        this.element = this.container;
    }

    initResizer() {
        //create resizer
        const resizer = this.container.appendChild(document.createElement('div'));
        resizer.className = 'resizer';
        resizer.style.backgroundColor = 'var(--hover)';
        resizer.style.cursor = 'ew-resize';
        resizer.style.zIndex = '10';
        resizer.style.width = '1px';
        resizer.style.height = '100%';
        resizer.style.position = 'absolute';
        resizer.style.left = '0px';
        resizer.style.bottom = '0px';
        resizer.addEventListener('mouseenter', () => resizer.style.backgroundColor = 'var(--text-main)');
        resizer.addEventListener('mouseleave', () => resizer.style.backgroundColor = 'var(--hover)');

        let isResizing = false;

        resizer.addEventListener('mousedown', () => {
            isResizing = true;

            document.addEventListener('mousemove', (e) => {
                if (isResizing) {
                    const panelRect = this.container.getBoundingClientRect();
                    const newWidth = panelRect.right - e.clientX;

                    if (newWidth >= 300 && newWidth <= 1000) {
                        this.container.style.width = `${newWidth}px`;
                    }
                }
            });
            document.addEventListener('mouseup', () => {
                isResizing = false;
                document.removeEventListener('mousemove', resizer);
                document.removeEventListener('mouseup', resizer);
                
                window.gtag('event', 'resize_sidebar', {
                    'width_after_resize': this.container.style.width
                });

            }
            );
        });
    }

    initContexMenu() {
        this.container.addEventListener("contextmenu", function (e) {//disable browser context menu
            e.preventDefault();
        });

        this.container.addEventListener('mousedown', (e) => {//call context menu
            var node = ComnfyUIapp.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes, 5);
            if (e.which == 3) {
                ComnfyUIapp.canvas.processContextMenu(node, e);
            }
        });

        this.container.addEventListener('click', (e) => {//close context menu
            LiteGraph.closeAllContextMenus();
        });
    }

    initCarousel() {
        const carouselImgList = [staticPath + 'component/img/placeholder.png'];

        this.carousel = new Carousel('', carouselImgList);

        const dropdown = new Dropdown(this.container, {
            title: 'Gallery',
            nodeID: '',
            iconLeft: staticPath + 'component/img/media.png',
            iconRight: staticPath + 'component/img/arrow_down.png',
            buttonText: '',
            buttonIcon: '',
            content: '',
            buttonFunctions: {
                pressed: () => {
                    clearAll();
                }
            }
        });
        dropdown.addElement(this.carousel);

        setTimeout(function () { //wait css add to element
            dropdown.toggleContent();
        }, 100);
    }

    initTab() {
        const tabs = [
            { title: 'Nodes' },
            { title: 'History' },
            // { title: 'Tab 3' },
            // { title: 'Tab 4', disabled: true }
        ];
        this.tabHistory = document.createElement('div');
        this.tabAll = document.createElement('div');

        const contents = [
            this.tabAll,
            this.tabHistory
        ];

        this.tab = new Tab({
            tabs: tabs,
            contents: contents,
            callbacks: {
                onTabClick: (index) => {
                    if (index === 0) { this.showFilter() }
                    else { this.hideFilter() }

                    window.gtag('event', 'click_tab', {
                        'tab_index': index
                    });

                }
            }
        });
        this.container.appendChild(this.tab.element);

        //make sure scroll work with dynamic height
        const emptyElement1 = document.createElement('div');
        emptyElement1.className = 'empty';
        emptyElement1.style.height = '150px';
        const emptyElement2 = document.createElement('div');
        emptyElement2.className = 'empty';
        emptyElement2.style.height = '150px';
        this.tabAll.appendChild(emptyElement1);
        this.tabHistory.appendChild(emptyElement2);
    }

    initFilterOfNode() {
        this.categories = [
            { name: 'All', count: 0 },
            { name: 'Favorite', count: 0 },
            { name: 'Notnull', count: 0 }
        ];

        const filterCallback = (category) => {
            if (category.name === 'All') {
                this.resetFilter();
                for (let nodeOfSidebar of NodeListOfSidebar) {
                    nodeOfSidebar.toggleAll(false);
                }
            }
            else if (category.name === 'Favorite') {
                this.resetFilter();
                for (let nodeOfSidebar of NodeListOfSidebar) {
                    for (let widgetOfSidebar of nodeOfSidebar.widgets) {
                        if (widgetOfSidebar.fav) { widgetOfSidebar.filter(1) }
                        else { widgetOfSidebar.filter(0) }
                    }
                    nodeOfSidebar.toggleAll(false);
                    let isExistFav = false;
                    for (let fav of nodeOfSidebar.fav) {
                        if (fav === 1) { isExistFav = true; }
                    }
                    if (isExistFav) { nodeOfSidebar.filter(1); }
                    else { nodeOfSidebar.filter(0); }
                }
            }
            else if (category.name === 'Notnull') {
                this.resetFilter();
                for (let nodeOfSidebar of NodeListOfSidebar) {
                    if (nodeOfSidebar.widgets.length) { nodeOfSidebar.filter(1) }
                    else { nodeOfSidebar.filter(0) }
                    nodeOfSidebar.toggleAll(false);
                }
            }

            window.gtag('event', 'click_filter', {
                'filter_name': category.name
            });
        };

        this.filter = new Filter(this.categories, filterCallback);
        setInterval(() => {
            var cntList = [NodeListOfSidebar.length, favWidgetCount, NodeListOfSidebar.length - NodeNullCount];
            this.filter.setCategoryCount(cntList);
        }, 1000);
        this.tab.element.querySelector('.filter-area').appendChild(this.filter.element);
    }

    resetFilter() {
        for (let nodeOfSidebar of NodeListOfSidebar) {
            nodeOfSidebar.filter(1);
            for (let widgetOfSidebar of nodeOfSidebar.widgets) {
                widgetOfSidebar.filter(1);
            }
        }
    }

    initTabHistory() {
        this.updateHistory();
        let timer = setInterval(() => {
            //await shit can't be inside setInterval
            this.updateHistory();
        }, 1000);
    }

    async updateHistory() {
        let queue = await ComnfyUIapi.getQueue();
        let history = await ComnfyUIapi.getHistory();

        if (this.runningCountOfSidebar != queue.Running.length || this.queueCountOfSidebar != queue.Pending.length || this.historyCountOfSidebar != history.History.length) {
            if (this.tabHistory.children.length > 0) {
                this.clearHistory(this.tabHistory);
            }
            this.historyCountOfSidebar = 0;
            this.queueCountOfSidebar = 0;
            this.runningCountOfSidebar = 0;

            if (queue.Running.length > 0) {
                this.runningCountOfSidebar = queue.Running.length;
                let runningName = queue.Running[0].prompt[0];
                var listItem = new ListItem({
                    iconUrl: staticPath + 'component/img/run.png',
                    name: 'Record-' + runningName,
                    status: 'Running',
                    button1Text: 'Restore',
                    button2Img: staticPath + 'component/img/clear.png',
                    callbacks: {
                        onButton1Click: () => { this.loadHistory(queue.Running[0]) },
                        onButton2Click: async () => {
                            try {
                                const response = await fetch('/interrupt', {
                                    method: 'POST',
                                    cache: 'reload',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                });
                            } catch (error) {
                                console.error('Error stop running', error);
                            }
                        }
                    }
                });
                this.tabHistory.appendChild(listItem.getElement());
                listItem.element.style.setProperty('--background-main', 'var(--primary)');
                listItem.nameElement.style.setProperty('--text-gray', 'var(--text-main)');
                listItem.statusElement.style.setProperty('--hover', 'var(--text-main)');
                listItem.statusElement.style.setProperty('--text-gray', 'var(--primary)');

                listItem.statusElement.setAttribute("data-i18n", "Running");
                listItem.button1.textElement.setAttribute("data-i18n", "Restore");

            }

            if (queue.Pending.length > 0) {
                this.queueCountOfSidebar = queue.Pending.length;
                for (let waitting of queue.Pending) {
                    let waittingName = waitting.prompt[0];
                    var listItem = new ListItem({
                        iconUrl: staticPath + 'component/img/waitting.png',
                        name: 'Record-' + waittingName,
                        status: 'Waitting',
                        button1Text: 'Restore',
                        button2Img: staticPath + 'component/img/clear.png',
                        callbacks: {
                            onButton1Click: () => { this.loadHistory(waitting) },
                            onButton2Click: async () => {
                                await ComnfyUIapi.deleteItem('queue', queue.Pending[0].prompt[1])
                            }
                        }
                    });
                    this.tabHistory.appendChild(listItem.getElement());
                    listItem.element.style.setProperty('--background-main', 'rgba(41, 72, 242, 0.2)');
                    // listItem.nameElement.style.setProperty('--text-gray', 'var(--text-main)');
                    listItem.statusElement.style.setProperty('--hover', 'var(--primary)');
                    listItem.statusElement.style.setProperty('--text-gray', 'var(--text-main)');

                    listItem.statusElement.setAttribute("data-i18n", "Waitting");
                    listItem.button1.textElement.setAttribute("data-i18n", "Restore");
                }
            }

            if (history.History.length > 0) {
                this.historyCountOfSidebar = history.History.length;
                let historyArray = history.History;
                for (let i = historyArray.length; i--; i > 0) {
                    // goo todo： delete item
                    // const removeAction = historyArray[i].remove || {
                    //     name: "Delete",
                    //     cb: () => ComnfyUIapi.deleteItem('History', historyArray[i].prompt[1]),
                    // };
                    let completedName = historyArray[i].prompt[0];
                    var listItem = new ListItem({
                        iconUrl: staticPath + 'component/img/history.png',
                        name: 'Record-' + completedName,
                        status: 'Done',
                        button1Text: 'Restore',
                        button2Img: staticPath + 'component/img/clear.png',
                        callbacks: {
                            onButton1Click: () => { this.loadHistory(historyArray[i]) },
                            onButton2Click: async () => {
                                await ComnfyUIapi.deleteItem('history', historyArray[i].prompt[1])
                            }
                            // onButton2Click: async () => {await ComnfyUIapi.deleteItem('History', historyArray[i].prompt[1]);}
                        }
                    });
                    this.tabHistory.appendChild(listItem.getElement());
                    listItem.statusElement.setAttribute("data-i18n", "Done");
                    listItem.button1.textElement.setAttribute("data-i18n", "Restore");
                }
            }

            //count
            var runningCnt = 0;
            var pendingCnt = 0;
            if (queue.Running) { runningCnt = queue.Running.length }
            if (queue.Pending) { pendingCnt = queue.Pending.length }
            var total = runningCnt + pendingCnt;
            if (ComfyUXi18n.currentLanguage === 'zh') {
                if (total) { this.tab.renameTab(1, '历史 ' + total.toString()); }
                else { this.tab.renameTab(1, '历史'); }
            }
            else if (ComfyUXi18n.currentLanguage === 'en') {
                if (total) { this.tab.renameTab(1, 'History ' + total.toString()); }
                else { this.tab.renameTab(1, 'History'); }
            }
        }

    }

    clearHistory(tabHistory) {
        [...tabHistory.childNodes].forEach(node => {
            tabHistory.removeChild(node);
        });
    }

    hideFilter() {
        this.filter.element.style.display = 'none'
    }

    showFilter() {
        this.filter.element.style.display = 'block'
    }

    loadHistory(item) {
        ComnfyUIapp.loadGraphData(item.prompt[3].extra_pnginfo.workflow, true, false);
        if (item.outputs) {
            ComnfyUIapp.nodeOutputs = item.outputs;
        }
    }

    resetSidebar() {
        NodeListOfSidebar = [];
        favWidgetCount = 0;
        NodeNullCount = 0;
    }
}
