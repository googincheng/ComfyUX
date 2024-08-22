import './css.js';
import Fuse from './fuse.basic.mjs';
import { staticPath, ComnfyUIapp } from "../../ComfyUIConnector.js";
import { ListItem } from './listitem.js';
import { Combo } from './combo.js';

export class Searchbox {
    constructor(event, options = {}) {
        this.event = event;
        this.options = options;
        this.element = document.createElement('div');
        this.clickEmptyToCloseHandler = this.createClickEmptyToCloseHandler();
        this.onSearchBoxSelection = null;
        this.nodeSearchData;
        this.previewNodes = [];
        this.debouncingTimeoutId;
        this.isScaled = false;
        this.results = [];
        this.currentIndex = 0;

        this.init();
    }

    init() {
        this.element.className = 'searchbox-container';
        document.body.appendChild(this.element);

        this.createInputSection();

        this.loadingText = document.createElement('div');
        this.loadingText.textContent = 'Loading Nodes...';
        this.loadingText.style.fontSize = 'var(--body-text)';
        this.loadingText.style.color = 'var(--text-gray)';
        this.loadingText.style.margin = 'auto';
        this.element.appendChild(this.loadingText);
        
        this.bindEvents();
        this.scaleCanvas();

        //click empty to close
        setTimeout(() => {
            document.addEventListener('click', this.clickEmptyToCloseHandler);
            this.input.focus();
        }, 200);

        this.createNodesearchFiles().then(() => {
            this.getNodesearchFiles().then((data) => {
                this.nodeSearchData = data;
                this.initNodesearchFiles().then(() => {
                    this.getFilterOptions().then(() => {
                        this.loadingText.style.display = 'none';
                        this.createResultsSection();
                        this.createComboSection();
                        this.showRecentResults();
                    });
                });
            });
        });
    }
    //click empty to close and remove listener
    createClickEmptyToCloseHandler() {
        return (event) => {
            event.stopPropagation();
            if (!this.element.contains(event.target) &&
                !this.inputFilter.dropdown.contains(event.target) &&
                !this.outputFilter.dropdown.contains(event.target)) {
                document.removeEventListener('click', this.clickEmptyToCloseHandler);
                this.closeSearchBox();
            }
        };
    }

    //auto scale to node widget visible
    scaleCanvas() {
        this.saveCanvasState();
        var scale = ComnfyUIapp.canvas.ds.scale;
        if (scale < 0.7 || scale > 2) {
            this.isScaled = true;
            ComnfyUIapp.canvas.ds.changeScale(1, [this.event.clientX, this.event.clientY]);
        }
    }

    saveCanvasState() {
        this.scalePrev = ComnfyUIapp.canvas.ds.scale;
    }

    restoreCanvasState() {
        // ComnfyUIapp.canvas.ds.offset[0] += this.offsetPrev[0];
        // ComnfyUIapp.canvas.ds.offset[1] += this.offsetPrev[1];

        ComnfyUIapp.canvas.ds.changeScale(this.scalePrev, [this.event.clientX, this.event.clientY]);
    }
    async initNodesearchFiles() {
        let nodeSearchJson = {};
        //get input and output 
        for (let node of Object.values(LiteGraph.registered_node_types)) {
            let nodeInputArray = [];
            let nodeOutputArray = [];
            if (node.nodeData) {
                // use this console.log to print node input data format
                // console.log(node.title,node.type,node.category, node.nodeData.input);
                for (let inputObject of Object.values(node.nodeData.input)) {
                    for (let inputProperties of Object.values(inputObject)) {
                        if (typeof inputProperties === "string") {
                            nodeInputArray.push(inputProperties);
                        }
                        else if (typeof inputProperties[0] === "string") {
                            nodeInputArray.push(inputProperties[0]);
                        }
                    }
                }
                // use this console.log to print node output data format
                // console.log(node.title,node.type,node.category, node.nodeData.output);
                for (let outputProperties of node.nodeData.output) {
                    if (typeof outputProperties === "string") {
                        nodeOutputArray.push(outputProperties);
                    }
                }
            }
            let nodeTitle = node.title;
            if (this.nodeSearchData[nodeTitle]) {
                nodeSearchJson[nodeTitle] = this.nodeSearchData[nodeTitle];
            }
            else{
                let nodeInfo = {
                    title: node.title,
                    category: node.type,
                    use_count: 0,
                    last_use: new Date('2000-01-01T00:00:00Z').getTime(),
                    outputs: nodeOutputArray,
                    inputs: nodeInputArray
                }
                nodeSearchJson[nodeTitle] = nodeInfo;
            }
        }
        this.nodeSearchData = nodeSearchJson;
        this.storeNodesearchFiles(nodeSearchJson);
    }
    async createNodesearchFiles() {
        try {
            const response = await fetch('/comfyux_create_nodesearch_files', {
                method: 'POST',
                cache: 'reload',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error creating nodesearch files:', error);
        }
    }
    async getNodesearchFiles() {
        try {
            const response = await fetch('/comfyux_get_nodesearch_files', {
                method: 'GET',
                cache: 'reload',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching nodesearch files:', error);
        }
    }

    async getFilterOptions() {
        this.inputFilterOptions = ['( All )'];
        this.outputFilterOptions = ['( All )'];
        for (let node of Object.values(this.nodeSearchData)) {
            if (node.inputs) {
                for (let nodeInput of node.inputs) {
                    this.inputFilterOptions.push(nodeInput);
                }
            }
            if (node.outputs) {
                for (let nodeOutput of node.outputs) {
                    this.outputFilterOptions.push(nodeOutput);
                }
            }
        }
        // clear repeat options
        this.inputFilterOptions = [...new Set(this.inputFilterOptions)];
        this.outputFilterOptions = [...new Set(this.outputFilterOptions)];


    }

    createInputSection() {
        const inputSection = document.createElement('div');
        inputSection.className = 'searchbox-input';

        const icon = document.createElement('img');
        icon.className = 'searchbox-input-icon';
        icon.src = staticPath + 'component/img/search.png';
        inputSection.appendChild(icon);

        const bg = document.createElement('img');
        bg.className = 'searchbox-key-help';
        bg.src = staticPath + 'component/img/keyhelp.png';
        inputSection.appendChild(bg);

        this.input = document.createElement('input');
        this.input.placeholder = this.options.placeholder || 'Search Node...';
        inputSection.appendChild(this.input);

        this.element.appendChild(inputSection);

    }

    createResultsSection() {
        const resultsSection = document.createElement('div');
        resultsSection.className = 'searchbox-results';

        this.leftPanel = document.createElement('div');
        this.leftPanel.className = 'left';
        resultsSection.appendChild(this.leftPanel);

        this.rightPanel = document.createElement('div');
        this.rightPanel.className = 'right';

        this.canvasElement = document.createElement('canvas');
        this.canvasElement.width = 288;
        this.canvasElement.height = 328;
        this.rightPanel.appendChild(this.canvasElement);
        resultsSection.appendChild(this.rightPanel);

        this.element.appendChild(resultsSection);
    }

    createComboSection() {
        const comboSection = document.createElement('div');
        comboSection.className = 'searchbox-combo';

        // Combo elements can be created here using previously defined Combo class
        // Placeholder for now
        this.inputFilter = new Combo({
            icon: staticPath + 'component/img/nodeinput.png',
            title: 'Input Type',
            options: this.inputFilterOptions,
            fav: '',
            isSupportSearch: 'true',
            defaultOption: '( All )',
            callbacks: {
                onSelect: (selectedOption) => {
                    this.applyFilters();
                }
            }
        });
        comboSection.appendChild(this.inputFilter.element);

        this.outputFilter = new Combo({
            icon: staticPath + 'component/img/nodeoutput.png',
            title: 'Output Type',
            options: this.outputFilterOptions,
            fav: '',
            showFavIcon: false,
            isSupportSearch: 'true',
            defaultOption: '( All )',
            callbacks: {
                onSelect: (selectedOption) => {
                    this.applyFilters();
                }
            }
        });
        comboSection.appendChild(this.outputFilter.element);

        this.element.appendChild(comboSection);
    }

    bindEvents() {
        this.input.addEventListener('input', (e) => this.onInputChange(e));
        this.element.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onInputChange(e) {
        const query = e.target.value;
        if (query === '') {
            this.showRecentResults();
        } else {
            this.performSearch(query);
        }
    }

    onKeyDown(event) {
        const { key } = event;
        const resultItems = this.leftPanel.querySelectorAll('.list-item');

        if (key === 'ArrowDown') {
            this.currentIndex = (this.currentIndex + 1) % resultItems.length;
            this.updateSelectedResult();
        } else if (key === 'ArrowUp') {
            this.currentIndex = (this.currentIndex - 1 + resultItems.length) % resultItems.length;
            this.updateSelectedResult();
        } else if (key === 'Enter') {
            if (this.currentIndex >= 0) {
                this.onResultClick(this.results[this.currentIndex], this.event);
            }
        } else if (key === 'Escape') {
            this.closeSearchBox();
        }
    }

    showRecentResults() {
        const recentResults = Object.values(this.nodeSearchData)
            .sort((a, b) => new Date(b.last_use) - new Date(a.last_use));
        
        this.updateResults(recentResults, 'last_use');
    }

    performSearch(query) {
        // Perform fuzzy search using fuse.js
        const fuseOptions = {
            // isCaseSensitive: false,
            // includeScore: false,
            // shouldSort: true,
            // includeMatches: false,
            // findAllMatches: false,
            // minMatchCharLength: 1,
            // location: 0,
            threshold: 0.6,
            // distance: 100,
            // useExtendedSearch: false,
            // ignoreLocation: false,
            // ignoreFieldNorm: false,
            // fieldNormWeight: 1,
            keys: [
                "title",
                "category"
            ]
        };
        const fuse = new Fuse(Object.values(this.nodeSearchData), fuseOptions);
        const result = fuse.search(query);
        const sortedResults = result.map(res => res.item).sort((a, b) => b.use_count - a.use_count);

        this.updateResults(sortedResults, 'use_count');
    }

    updateResults(results, label) {
        this.leftPanel.innerHTML = '';
        this.results = results;
        this.currentIndex = 0;

        for (let result of results) {
            var status;
            if (label === 'use_count') {
                if (result.use_count > 3) { status = 'Prefer'; }
                else { status = ''; }
            }
            else if (label === 'last_use') {
                const now = new Date();
                const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
                if (result.last_use >= sevenDaysAgo) { status = 'Recently'; }
                else { status = ''; }
            }

            const listItem = new ListItem({
                iconUrl: '',
                name: result.title,
                status: status,
                callbacks: {}
            });
            listItem.element.style.borderRadius = '4px';
            listItem.element.style.height = 'auto';
            listItem.element.style.padding = 'var(--space-m)';
            listItem.element.style.border = 'none';
            listItem.element.addEventListener('mouseenter', (event) => {
                this.handleMouseEnter(event.currentTarget);
            });
            listItem.element.addEventListener('click', () => {
                this.onResultClick(this.results[this.currentIndex], this.event);
            });
            this.leftPanel.appendChild(listItem.getElement());
        }

        this.updateSelectedResult();
    }

    handleMouseEnter(targetElement) {
        //debouncing
        clearTimeout(this.debouncingTimeoutId);
        this.debouncingTimeoutId = setTimeout(() => {
            const parent = targetElement.parentNode;
            this.currentIndex = Array.from(parent.children).indexOf(targetElement);
            this.updateSelectedResult(true);
        }, 50);
    }

    getElement() {
        return this.element;
    }

    updateSelectedResult(isPointer = false) {
        const resultItems = this.leftPanel.querySelectorAll('.list-item');
        resultItems.forEach((item, index) => {
            item.classList.toggle('selected', index === this.currentIndex);
        });

        let selectedItem = this.leftPanel.querySelector('.list-item.selected');
        if(selectedItem){
            this.scrollToSelectedResult(this.leftPanel, selectedItem, isPointer);
        }
        this.updateCanvas(this.results[this.currentIndex]);
    }
    scrollToSelectedResult(containerElement, targetElement, isPointer) {
        if (!isPointer) {
            let targetPosition = targetElement.offsetTop - containerElement.offsetTop;

            containerElement.scrollTo({
                top: targetPosition - 80,
                behavior: 'smooth'
            });
        }
    }

    updateCanvas(result) {
        setTimeout(() => {
            var node = LiteGraph.createNode(result.category);
            for (let previewNode of this.previewNodes) {
                ComnfyUIapp.graph.remove(previewNode);
            }

            if (node) {
                this.previewNodes.push(node);

                var scale = ComnfyUIapp.canvas.ds.scale * window.devicePixelRatio;
                var offset = ComnfyUIapp.canvas.ds.offset;
                // node.pos = LGraphCanvas.active_canvas.convertEventToCanvasOffset(this.event);
                var nodeW = Math.min(300, Math.max(150, node.size[0]));
                var nodeH = Math.min(260, Math.max(80, node.size[1]));
                node.size = [nodeW, nodeH];
                // hide the preview node behind the searchbox
                var screenCenterMockEvent = {
                    clientX: ComnfyUIapp.canvasEl.getBoundingClientRect().width / 2 - node.size[0] / 2,
                    clientY: ComnfyUIapp.canvasEl.getBoundingClientRect().height / 2 - node.size[1] / 2 + LiteGraph.NODE_TITLE_HEIGHT
                }
                node.pos = LGraphCanvas.active_canvas.convertEventToCanvasOffset(screenCenterMockEvent);
                ComnfyUIapp.graph.add(node, false);

                var nodeClipTopRightPos = this.canvasToViewportCoordinates(ComnfyUIapp.canvasEl, node.pos[0] + offset[0], node.pos[1] + offset[1] - LiteGraph.NODE_TITLE_HEIGHT)
                var nodeClipSize = [this.canvasElement.width, this.canvasElement.height];
                let sx = (nodeClipTopRightPos[0] - (nodeClipSize[0] - nodeW) / 2 - 20) * scale,
                    sy = (nodeClipTopRightPos[1] - (nodeClipSize[1] - nodeH) / 2 - 20) * scale,
                    sWidth = nodeClipSize[0] * scale * 1.1,
                    sHeight = nodeClipSize[1] * scale * 1.1,
                    dx = 0,
                    dy = 0,
                    dWidth = nodeClipSize[0],
                    dHeight = nodeClipSize[1]

                setTimeout(() => {
                    this.canvasElement.getContext('2d').clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
                    this.canvasElement.getContext('2d').drawImage(
                        ComnfyUIapp.canvasEl,
                        sx, sy, sWidth, sHeight,
                        dx, dy, dWidth, dHeight
                    );
                }, 100);

            }
        }, 0);
    }
    canvasToViewportCoordinates(canvas, canvasX, canvasY) {
        const rect = canvas.getBoundingClientRect();
        const viewportX = canvasX + rect.left;
        const viewportY = canvasY + rect.top;

        return [viewportX, viewportY];
    }

    onResultClick(result, event) {
        var name = result.category;
        if (name) {

            if (this.onSearchBoxSelection) {
                this.onSearchBoxSelection(name, event, ComnfyUIapp.canvas);
            } else {
                var extra = LiteGraph.searchbox_extras[name.toLowerCase()];
                if (extra) {
                    name = extra.type;
                }

                ComnfyUIapp.graph.beforeChange();
                var node = LiteGraph.createNode(name);
                if (node) {
                    if (this.isScaled) {
                        var screenCenterMockEvent = {
                            clientX: ComnfyUIapp.canvasEl.getBoundingClientRect().width / 2 - node.size[0] / 2,
                            clientY: ComnfyUIapp.canvasEl.getBoundingClientRect().height / 2 - node.size[1] / 2 + LiteGraph.NODE_TITLE_HEIGHT
                        }
                        node.pos = LGraphCanvas.active_canvas.convertEventToCanvasOffset(screenCenterMockEvent);
                    }
                    else {
                        node.pos = ComnfyUIapp.canvas.convertEventToCanvasOffset(event);
                    }
                    ComnfyUIapp.graph.add(node, false);
                }

                // join node after inserting
                if (this.options.node_from) {
                    var iS = false;
                    switch (typeof this.options.slot_from) {
                        case "string":
                            iS = this.options.node_from.findOutputSlot(this.options.slot_from);
                            break;
                        case "object":
                            if (this.options.slot_from.name) {
                                iS = this.options.node_from.findOutputSlot(this.options.slot_from.name);
                            } else {
                                iS = -1;
                            }
                            if (iS == -1 && typeof this.options.slot_from.slot_index !== "undefined") iS = this.options.slot_from.slot_index;
                            break;
                        case "number":
                            iS = this.options.slot_from;
                            break;
                        default:
                            iS = 0; // try with first if no name set
                    }
                    if (typeof this.options.node_from.outputs[iS] !== "undefined") {
                        if (iS !== false && iS > -1) {
                            this.options.node_from.connectByType(iS, node, this.options.node_from.outputs[iS].type);
                        }
                    } else {
                        // console.warn("cant find slot " + options.slot_from);
                    }
                }
                if (this.options.node_to) {
                    var iS = false;
                    switch (typeof this.options.slot_from) {
                        case "string":
                            iS = this.options.node_to.findInputSlot(this.options.slot_from);
                            break;
                        case "object":
                            if (this.options.slot_from.name) {
                                iS = this.options.node_to.findInputSlot(this.options.slot_from.name);
                            } else {
                                iS = -1;
                            }
                            if (iS == -1 && typeof this.options.slot_from.slot_index !== "undefined") iS = this.options.slot_from.slot_index;
                            break;
                        case "number":
                            iS = this.options.slot_from;
                            break;
                        default:
                            iS = 0; // try with first if no name set
                    }
                    if (typeof this.options.node_to.inputs[iS] !== "undefined") {
                        if (iS !== false && iS > -1) {
                            // try connection
                            this.options.node_to.connectByTypeOutput(iS, node, this.options.node_to.inputs[iS].type);
                        }
                    } else {
                        // console.warn("cant find slot_nodeTO " + options.slot_from);
                    }
                }

                ComnfyUIapp.graph.afterChange();
            }
        }
        this.nodeSearchData[result.title].use_count++;
        this.nodeSearchData[result.title].last_use = Date.now();
        this.closeSearchBox();
        this.storeNodesearchFiles(this.nodeSearchData);
    }

    closeSearchBox() {
        // this.element.style.display = 'none';
        for (let previewNode of this.previewNodes) {
            ComnfyUIapp.graph.remove(previewNode);
        }
        if (this.element.parentElement) { document.body.removeChild(this.element); }
        // this.restoreCanvasState();
    }

    async storeNodesearchFiles(data) {
        try {
            const response = await fetch('/comfyux_store_nodesearch_files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log('Store Recent Files Result:', result);
        } catch (error) {
            console.error('Error storing recent files:', error);
        }
    }
    applyFilters() {
        let filteredResults = Object.values(this.nodeSearchData);

        const inputFilterValue = this.inputFilter.selectedOption;
        if (inputFilterValue !== '( All )') {
            filteredResults = filteredResults.filter(node => node.inputs.some(input => input === inputFilterValue));
        }

        const outputFilterValue = this.outputFilter.selectedOption;
        if (outputFilterValue !== '( All )') {
            filteredResults = filteredResults.filter(node => node.outputs.some(output => output === outputFilterValue));
        }

        this.updateResults(filteredResults);
    }

}
