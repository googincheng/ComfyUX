//todo: seperate from ComfyUX.js

import { ComnfyUIapp, staticPath } from "./ComfyUIConnector.js";
import { Dropdown } from './component/js/dropdown.js';
import { Button } from './component/js/button.js';
import { Switch } from './component/js/switch.js';
import { NumInput } from './component/js/numinput.js';
import { MultiInput } from './component/js/multiinput.js';
import { Combo } from './component/js/combo.js';
import { SingleInput } from './component/js/singleinput.js';

export class nodeSync{
    constructor(sidebar) {
        this.NodeListOfSidebar = [];
        this.favWidgetCount = 0;
        this.NodeNullCount = 0;
        this.isStartSync = true;
        this.sidebar = sidebar;

        this.init();
    }

    init() {
        ComnfyUIapp.canvas.onSelectionChange = (nodes) => {
            let selectNodesArray = Object.values(nodes);
            if(selectNodesArray.length){
                let lastSelectNode = selectNodesArray[0];
                this.scrollToNode(lastSelectNode);
            }
        };

        //init node to sidebar
        if (ComnfyUIapp.graph._nodes) {
            for (let node of ComnfyUIapp.graph._nodes) {
                if (node.widgets) { //filter node without widgets
                    this.initNodeOfSidebar(node, this.sidebar);
                }
            }
        }

        //sync param between sidebar and graph
        setInterval(() => {
            //update images to gallery
            if (ComnfyUIapp.graph._nodes) {
                for (let node of ComnfyUIapp.graph._nodes) {
                    this.addToGallery(node, this.sidebar);
                }
            }
            // add node to sidebar
            if (ComnfyUIapp.graph._nodes.length > this.NodeListOfSidebar.length) {
                for (let node of ComnfyUIapp.graph._nodes) {
                    this.addNodeToSidebar(node, this.sidebar);
                }
            }
            // delete node
            if (ComnfyUIapp.graph._nodes.length < this.NodeListOfSidebar.length) {
                if (this.NodeListOfSidebar.length - ComnfyUIapp.graph._nodes.length < 5) {
                    for (let i = 0; i < this.NodeListOfSidebar.length; i++) {
                        //delete node and get delete result {true:find and deleted,false:not find)
                        if (this.matchNodeOfSidebarToGraph(this.NodeListOfSidebar[i], ComnfyUIapp.graph._nodes)) {
                            //remove element
                            this.NodeListOfSidebar[i].element.remove();
                            //update NodeNullCount
                            if (!this.NodeListOfSidebar[i].widgets.length) { this.NodeNullCount-- }
                            //update favWidgetCount
                            let favSum = 0;
                            let favlist = this.NodeListOfSidebar[i].fav;
                            for (let fav of favlist) {
                                favSum += fav;
                            }
                            this.favWidgetCount -= favSum;
                            //last update NodeListOfSidebar
                            this.NodeListOfSidebar.splice(i, 1);

                            continue;
                        }
                        if (ComnfyUIapp.graph._nodes.length === this.NodeListOfSidebar.length) {
                            break;
                        }
                    }
                }
                else {
                    //when delete too much,clear all and reload to impove speed
                    this.sidebar.tabAll.innerHTML = '';
                    this.NodeListOfSidebar = [];
                    this.favWidgetCount = 0;
                    this.NodeNullCount = 0;
                }

            }
            // update node and widget when graph edit
            //goo todo: avoid conflict with clear operation
            if (this.isStartSync) {
                // console.log(this.isStartSync);
                if (ComnfyUIapp.graph._nodes.length === this.NodeListOfSidebar.length) {
                    for (let node of ComnfyUIapp.graph._nodes) {
                        this.updateNodeInfo(node);
                        if (node.widgets) {//filter node without widgets
                            this.updateWidget(node);
                        }
                    }
                }
            }

        }, 1000);
    }

    scrollToNode(nodeOfGraph) {
        for (let nodeOfSidebar of this.NodeListOfSidebar) {
            if (nodeOfGraph.id === nodeOfSidebar.nodeID) {
                const targetElement = nodeOfSidebar.element;
                const containerElement = targetElement.parentElement;
    
                const targetPosition = targetElement.offsetTop - containerElement.offsetTop;
    
                containerElement.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                nodeOfSidebar.toggleAll(false);
                break;
            }
        }
    }
    
    //goo todo : optimization
    updateWidget(node) {
        for (let nodeOfSidebar of this.NodeListOfSidebar) {
            if (nodeOfSidebar.nodeID === node.id) { //match dropdown to node
                for (let widget of node.widgets) {
                    for (let widgetOfSidebar of nodeOfSidebar.widgets) {
                        if (widget.name === widgetOfSidebar.title) {// match widget
                            if (widget.type == 'number') {// widget:数字
                                widgetOfSidebar.setValue(widget.value);
                            }
                            else if (widget.type == 'combo') {// widget:单选
                                widgetOfSidebar.setOption(widget.value);
                            }
                            else if (widget.type == 'text') {// [goo todo]widget:单行文本
                                widgetOfSidebar.setValue(widget.value);
                            }
                            else if (widget.type == 'customtext') {// widget:多行文本
                                widgetOfSidebar.setValue(widget.value);
                            }
                            else if (widget.type == 'toggle') {// widget:多行文本
                                widgetOfSidebar.setValue(widget.value);
                            }
                            else if (widget.type == 'button') {// widget:按钮
                                //do nothing
                            }
                        }
                    }
                }
            }
        }
    }
    
    addToGallery(node, sidebar) {
        if (node.imgs) {
            for (let img of node.imgs) {
                let isNew = true;
                for (let carouselImg of this.sidebar.carousel.thumbnails) {
                    if (img.currentSrc == carouselImg.currentSrc) {
                        isNew = false;
                    }
                };
                if (isNew) {
                    sidebar.carousel.addThumbnail([img.currentSrc]);
                };
            };
        };
    
    }
    
    toggleFav(nodeOfSidebar, favWidget) {
        let fav = [];
        for (let node of ComnfyUIapp.graph._nodes) {
            if (node.widgets && node.id === nodeOfSidebar.nodeID) {
                for (let widget of nodeOfSidebar.widgets) {
                    if (widget.fav) {
                        fav.push(1);
                    }
                    else {
                        fav.push(0);
                    }
                }
                if (node.properties.fav) {
                    node.properties.fav = fav;
                }
                else {
                    node.addProperty('fav', []);
                    node.properties.fav = fav;
                }
                nodeOfSidebar.fav = fav;
            }
        }
    }
    
    addNodeToSidebar(node, sidebar) {
        let isNew = true;
        for (let sidebarNode of this.NodeListOfSidebar) {
            if (node.id == sidebarNode.nodeID) {
                isNew = false;
                break;
            }
        };
        if (isNew) {
            this.initNodeOfSidebar(node, sidebar);
        }
    }
    
    //goo todo: loading tips when delete more than 5
    matchNodeOfSidebarToGraph(nodeOfSidebar, nodesOfGraph) {
        for (let i = 0; i < nodesOfGraph.length; i++) {
            if (nodesOfGraph[i].id === nodeOfSidebar.nodeID) {
                return false;
            }
        }
        return true;
    }
    
    initNodeOfSidebar(node, sidebar) {
        let fav = [];
        if (node.widgets) {
            if (node.properties.fav) {
                let favSum = 0;
                for (let fav of node.properties.fav) {
                    favSum += fav;
                }
                this.favWidgetCount += favSum;
                fav = node.properties.fav;
            }
            else {
                for (let i = 0; i < node.widgets.length; i++) {
                    fav.push(0);
                }
            }
        }
        else { this.NodeNullCount++; }
    
        let isBypass;
        if (node.mode === 4 || node.mode === 2) { isBypass = true; }//mode:2 mute; mode:4 bypass
        else { isBypass = false; }
    
        let isMiss, title;
        if (node.title) {
            isMiss = false;
            title = node.title;
        }//mode:2 mute; mode:4 bypass
        else {
            isMiss = true;
            title = node.type;
        }
    
        const dropdown = new Dropdown('', {
            title: title,
            nodeID: node.id,
            iconLeft: staticPath + 'component/img/bypass_sel.png',
            iconRight: staticPath + 'component/img/arrow_down.png',
            buttonText: '',
            color: node.bgcolor,
            fav: fav,
            buttonIcon: '',
            content: '',
            isBypass: isBypass,
            isMiss: isMiss,
            buttonFunctions: {
                normal: () => console.log('Button normal state'),
                hover: () => console.log('Button hover state'),
                pressed: () => console.log('Button pressed state')
            },
            callbacks: {
                onBypass: (isBypass) => {
                    if (isBypass) {
                        node.mode = 4;
                    }
                    else {
                        node.mode = 0;
                    }
                    ComnfyUIapp.graph.setDirtyCanvas(true);
                }
            }
        });
        // sidebar.tabAll.querySelector('.empty').remove();
        this.sidebar.tabAll.insertBefore(dropdown.element, this.sidebar.tabAll.firstChild);
        this.NodeListOfSidebar.push(dropdown);
    
        this.addWidgetOfSidebar(node, dropdown);
    }
    
    updateNodeInfo(node) {
        //update existing node color and
        var nodeSidebar = document.getElementById(node.id.toString());
        if (nodeSidebar) {
            if (node.title) {
                nodeSidebar.querySelector('.dropdown-title > .dropdown-title-left > span').textContent = node.title;
            }
            else {
                nodeSidebar.querySelector('.dropdown-title > .dropdown-title-left > span').textContent = node.type;
            }
    
            if (node.bgcolor) {
                var opacityValue = 0.2;
                var rgbaColor = this.hexToRgbA(node.bgcolor, opacityValue);
                nodeSidebar.querySelector('.dropdown-title').style.setProperty('--background-main', rgbaColor);
                nodeSidebar.style.backgroundColor = rgbaColor;
            }
            else {
                nodeSidebar.querySelector('.dropdown-title').style.setProperty('--background-main', 'rgba(20, 20, 22, 1)');
                nodeSidebar.style.backgroundColor = '';
            }
        }
    }
    
     initNumWidgetOfSidebar(widget, dropdown, fav) {
        let value;
        if (typeof widget.value === "number") { //int
            value = widget.value;
        }
        else { // float
            value = parseFloat(widget.value);
        }
        var numInput1 = new NumInput({
            iconLeft: staticPath + 'component/img/arrow_left.png',
            title: widget.name,
            iconRight: staticPath + 'component/img/arrow_right.png',
            min: widget.options.min,
            max: widget.options.max,
            round: widget.options.round,
            step: widget.options.step,
            fav: fav,
            showFavIcon: true,
            value: value,
            precision: widget.options.precision,
            onChange: function (value) {
                console.log(typeof value, value, typeof widget.value, widget.value);
                widget.value = value;
                ComnfyUIapp.graph.setDirtyCanvas(true);
            },
            callbacks: {
                onFav: function (fav) {
                    console.log('Favorite option:', fav);
                    if (fav) { this.favWidgetCount++ } else { this.favWidgetCount-- }
                    this.toggleFav(dropdown, numInput1);
                },
                onEdit: function (editting) {
                    if (editting) { this.isStartSync = false; }
                    else { this.isStartSync = true; }
                }
            }
        });
        dropdown.addElement(numInput1);
    }
    
     initComboWidgetOfSidebar(widget, dropdown, fav) {
        const combo1 = new Combo({
            icon: staticPath + 'component/img/select.png',
            title: widget.name,
            options: widget.options.values,
            fav: fav,
            defaultOption: widget.value,
            callbacks: {
                onSelect: function (selectedOption) {
                    console.log('Selected option:', selectedOption);
                    widget.value = selectedOption;
                    widget.callback();
                    ComnfyUIapp.graph.setDirtyCanvas(true);
                },
                onFav: function (fav) {
                    console.log('Favorite option:', fav);
                    if (fav) { this.favWidgetCount++ } else { this.favWidgetCount-- }
                    this.toggleFav(dropdown, combo1);
                }
            }
        });
        dropdown.addElement(combo1);
    }
    
    initMultiinputWidgetOfSidebar(widget, dropdown, fav) {
        let textContent = widget.value;
        let placeholder = widget.inputEl.placeholder;
        var multiInput1 = new MultiInput({
            placeholder: placeholder,
            title: widget.name,
            textContent: textContent,
            fav: fav,
            onChange: function (value) {
                console.log(typeof value, value, typeof widget.value, widget.value);
                widget.value = value;
                ComnfyUIapp.graph.setDirtyCanvas(true);
            },
            callbacks: {
                onFav: function (fav) {
                    if (fav) { this.favWidgetCount++ } else { this.favWidgetCount-- }
                    this.toggleFav(dropdown, multiInput1);
                },
                onEdit: function (editting) {
                    if (editting) { this.isStartSync = false; }
                    else { this.isStartSync = true; }
                }
            }
        });
        dropdown.addElement(multiInput1);
    }
    
    initTextWidgetOfSidebar(widget, dropdown, fav) {
        // Example usage
        const singleInput = new SingleInput({
            title: widget.name,
            placeholder: 'Enter your something',
            defaultValue: widget.value,
            fav: fav,
            showFavIcon: true,
            leftIcon: staticPath + 'component/img/input.png',
            callbacks: {
                onFav: function (fav) {
                    if (fav) { this.favWidgetCount++ } else { this.favWidgetCount-- }
                    this.toggleFav(dropdown, singleInput);
                },
                onEdit: function (editting) {
                    if (editting) { this.isStartSync = false; }
                    else { this.isStartSync = true; }
                },
                onChange: function (value) {
                    widget.value = value;
                    ComnfyUIapp.graph.setDirtyCanvas(true);
                }
            }
        });
        dropdown.addElement(singleInput);
    }
    
    initSwitchWidgetOfSidebar(widget, dropdown, fav) {
        let hint;
        if (widget.value) {
            hint = widget.options.on;
        }
        else {
            hint = widget.options.off;
        }
        var switch1 = new Switch({
            icon: staticPath + 'component/img/switch.png',
            title: widget.name,
            hintOn: widget.options.on,
            hintOff: widget.options.off,
            fav: fav,
            onChange: function (checked, hintElement) {
                widget.value = checked ? true : false;
                ComnfyUIapp.graph.setDirtyCanvas(true);
            },
            callbacks: {
                onFav: function (fav) {
                    if (fav) { this.favWidgetCount++ } else { this.favWidgetCount-- }
                    this.toggleFav(dropdown, switch1);
                }
            }
        });
        dropdown.addElement(switch1);
    }
    
    initButtonWidgetOfSidebar(widget, dropdown, fav) {
        const button = new Button({
            container: '',
            iconSrc: '',
            title: widget.name,
            fav: fav,
            showFavIcon: true,
            callbacks: {
                onClick: () => widget.callback(),
                onFav: function (fav) {
                    if (fav) { this.favWidgetCount++ } else { this.favWidgetCount-- }
                    this.toggleFav(dropdown, button);
                }
            }
        });
        dropdown.addElement(button);
    }
    //todo place this to sidebar.js
    clearAll() {
        let tabNode = document.getElementsByClassName('tab-panel')[0];
        [...tabNode.childNodes].forEach(node => {
            tabNode.removeChild(node);
        });
        let tabHistory = document.getElementsByClassName('tab-panel')[1];
        [...tabHistory.childNodes].forEach(node => {
            tabHistory.removeChild(node);
        });
    }
    
    // add opacity to hex color
    hexToRgbA(hex, opacity) {
        const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (regex.test(hex)) {
            if (hex.length === 4) {
                hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
            }
    
            hex = hex.replace('#', '');
    
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
    
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
        }
        else {
            console.log("hex is not valid", hex);
        }
    }
    addWidgetOfSidebar(node, dropdown) {
        if (node.widgets) {
            for (let i = 0; i < node.widgets.length; i++) {
                let widget = node.widgets[i];
                if (widget.type == 'number') {// widget:数字
                    this.initNumWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
                }
                else if (widget.type == 'combo') {// widget:单选
                    this.initComboWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
                }
                else if (widget.type == 'text') {// [goo todo]widget:单行文本
                    this.initTextWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
                }
                else if (widget.type == 'customtext') {// widget:多行文本
                    this.initMultiinputWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
                }
                else if (widget.type == 'toggle') {// widget:多行文本
                    this.initSwitchWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
                }
                else if (widget.type == 'button') {// widget:按钮
                    this.initButtonWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
                }
            }
        }
    }

}