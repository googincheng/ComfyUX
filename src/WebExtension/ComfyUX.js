import { ComnfyUIapp, staticPath } from "./ComfyUIConnector.js";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { Dropdown } from './component/js/dropdown.js';
import { Button } from './component/js/button.js';
import { Switch } from './component/js/switch.js';
import { NumInput } from './component/js/numinput.js';
import { MultiInput } from './component/js/multiinput.js';
import { Combo } from './component/js/combo.js';
import { SingleInput } from './component/js/singleinput.js';
import { Searchbox } from './component/js/searchbox.js';
import { i18n } from './i18n.js';
import { Gtag } from './gtag.js';

export var NodeListOfSidebar = [];
export var favWidgetCount = 0;
export var NodeNullCount = 0;
export const ComfyUXi18n = new i18n();
let isStartSync = true;

ComnfyUIapp.registerExtension({
    name: "ComfyUX.Main",

    //Triggered before load graph
    init() {
    },
    addCustomNodeDefs() {
    },
    getCustomWidgets() {
    },

    beforeRegisterNodeDef() {
    },

    registerCustomNodes() {
    },

    beforeConfigureGraph(graphData, missingNodeTypes) {
    },

    nodeCreated() {
    },

    loadedGraphNode(node) {
    },
    afterConfigureGraph(missingNodeTypes) {

    },
    refreshComboInNodes(defs) {
    },

    setup() {
        console.log(typeof LiteGraph.registered_node_types,LiteGraph.registered_node_types)
        console.log(typeof JSON.stringify(LiteGraph.registered_node_types),JSON.stringify(LiteGraph.registered_node_types))
        const sidebar = new Sidebar();
        const topbar = new Topbar();
        const ComfuUXgtag = new Gtag();
        // //recreate searchbox
        LGraphCanvas.prototype.showSearchBox = function (event, options) {
            // proposed defaults
            var def_options = {
                slot_from: null
                , node_from: null
                , node_to: null
                , do_type_filter: LiteGraph.search_filter_enabled // TODO check for registered_slot_[in/out]_types not empty // this will be checked for functionality enabled : filter on slot type, in and out
                , type_filter_in: false                          // these are default: pass to set initially set values
                , type_filter_out: false
                , show_general_if_none_on_typefilter: true
                , show_general_after_typefiltered: true
                , hide_on_mouse_leave: LiteGraph.search_hide_on_mouse_leave
                , show_all_if_empty: true
                , show_all_on_open: LiteGraph.search_show_all_on_open
            };
            options = Object.assign(def_options, options || {});
            const searchbox = new Searchbox(event, options);
        }

        document.getElementsByClassName('comfy-menu')[0].style.display = 'none';
        document.getElementsByClassName('comfy-menu-hamburger')[0].style.zIndex = '1';
        if (document.getElementsByClassName('comfyui-menu').length) {
            document.getElementsByClassName('comfyui-menu')[0].style.display = 'none';
        }
        if (document.getElementsByClassName('comfyui-body-top').length) {
            document.getElementsByClassName('comfyui-body-top')[0].style.display = 'none';
        }
        var timer1 = setInterval(() => {
            if (document.getElementById('workspaceManagerPanel')) {
                clearInterval(timer1);
                document.getElementById('workspaceManagerPanel').style.top = '60px';
                document.getElementById('workspaceManagerPanel').style.left = '4px';
            }
        }, 1000);

        if (document.getElementsByClassName('pysssss-image-feed').length) {
            document.getElementsByClassName('pysssss-image-feed')[0].style.display = 'none';
        }

        ComnfyUIapp.canvas.onSelectionChange = (nodes) => {
            let selectNodesArray = Object.values(nodes);
            if (selectNodesArray.length) {
                let lastSelectNode = selectNodesArray[0];
                scrollToNode(lastSelectNode);
            }
        };

        //init node to sidebar
        if (ComnfyUIapp.graph._nodes) {
            for (let node of ComnfyUIapp.graph._nodes) {
                if (node.widgets) { //filter node without widgets
                    initNodeOfSidebar(node, sidebar);
                }
            }
        }

        //sync param between sidebar and graph
        setInterval(() => {
            //update images to gallery
            if (ComnfyUIapp.graph._nodes) {
                for (let node of ComnfyUIapp.graph._nodes) {
                    addToGallery(node, sidebar);
                }
            }

            // add node to sidebar
            // if (ComnfyUIapp.graph._nodes.length > NodeListOfSidebar.length) { 
            for (let node of ComnfyUIapp.graph._nodes) {
                addNodeToSidebar(node, sidebar);
            }
            // }

            // delete node
            // if (ComnfyUIapp.graph._nodes.length < NodeListOfSidebar.length) {
            if (NodeListOfSidebar.length - ComnfyUIapp.graph._nodes.length < 5) {
                for (let i = 0; i < NodeListOfSidebar.length; i++) {
                    //delete node and get delete result {true:find and deleted,false:not find)
                    if (matchNodeOfSidebarToGraph(NodeListOfSidebar[i], ComnfyUIapp.graph._nodes)) {
                        //remove element
                        NodeListOfSidebar[i].element.remove();
                        //update NodeNullCount
                        if (!NodeListOfSidebar[i].widgets.length) { NodeNullCount-- }
                        //update favWidgetCount
                        let favSum = 0;
                        let favlist = NodeListOfSidebar[i].fav;
                        for (let fav of favlist) {
                            favSum += fav;
                        }
                        favWidgetCount -= favSum;
                        //last update NodeListOfSidebar
                        NodeListOfSidebar.splice(i, 1);

                        continue;
                    }
                    // if (ComnfyUIapp.graph._nodes.length === NodeListOfSidebar.length) {
                    //     break;
                    // }
                }
            }
            else {
                //when delete too much,clear all and reload to impove speed
                sidebar.tabAll.innerHTML = '';
                NodeListOfSidebar = [];
                favWidgetCount = 0;
                NodeNullCount = 0;
            }
            // }

            // update node and widget when graph edit
            //goo todo: avoid conflict with clear operation
            if (isStartSync) {
                // console.log(isStartSync);
                if (ComnfyUIapp.graph._nodes.length === NodeListOfSidebar.length) {
                    for (let node of ComnfyUIapp.graph._nodes) {
                        updateNodeInfo(node, sidebar);
                        if (node.widgets) {//filter node without widgets
                            updateWidget(node);
                        }
                    }
                }
            }

        }, 1000);

    }

});
function scrollToNode(nodeOfGraph) {
    for (let nodeOfSidebar of NodeListOfSidebar) {
        if (nodeOfGraph.id === nodeOfSidebar.nodeID) {
            const targetElement = nodeOfSidebar.element;
            const containerElement = targetElement.parentElement;

            const targetPosition = targetElement.offsetTop - containerElement.offsetTop;

            containerElement.scrollTo({
                top: targetPosition,
                behavior: 'auto'
            });
            if (!nodeOfSidebar.isExpand) {
                nodeOfSidebar.toggleAll(false);
            }
            break;
        }
    }
}

//goo todo : optimization
function updateWidget(node) {
    for (let nodeOfSidebar of NodeListOfSidebar) {
        if (nodeOfSidebar.nodeID === node.id) { //match dropdown to node
            for (let widget of node.widgets) {
                for (let widgetOfSidebar of nodeOfSidebar.widgets) {
                    if (widget.name === widgetOfSidebar.title) {// match widget
                        if (widget.type == 'number') {// widget:数字
                            // console.log(widget.name, typeof widget.value, widget.value);
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

function addToGallery(node, sidebar) {
    if (node.imgs) {
        for (let img of node.imgs) {
            let isNew = true;
            for (let carouselImg of sidebar.carousel.thumbnails) {
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

function toggleFav(nodeOfSidebar, favWidget) {
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

function addNodeToSidebar(node, sidebar) {
    let isNew = true;
    for (let sidebarNode of NodeListOfSidebar) {
        if (node.id == sidebarNode.nodeID) {
            isNew = false;
            break;
        }
    };
    if (isNew) {
        initNodeOfSidebar(node, sidebar);
    }
}

//goo todo: loading tips when delete more than 5
function matchNodeOfSidebarToGraph(nodeOfSidebar, nodesOfGraph) {
    for (let i = 0; i < nodesOfGraph.length; i++) {
        if (nodesOfGraph[i].id === nodeOfSidebar.nodeID) {
            return false;
        }
    }
    return true;
}

function initNodeOfSidebar(node, sidebar) {
    let fav = [];
    if (node.widgets) {
        if (node.properties.fav) {
            let favSum = 0;
            for (let fav of node.properties.fav) {
                favSum += fav;
            }
            favWidgetCount += favSum;
            fav = node.properties.fav;
        }
        else {
            for (let i = 0; i < node.widgets.length; i++) {
                fav.push(0);
            }
        }
    }
    else { NodeNullCount++; }

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
    sidebar.tabAll.insertBefore(dropdown.element, sidebar.tabAll.firstChild);
    NodeListOfSidebar.push(dropdown);

    addWidgetOfSidebar(node, dropdown);
}

function updateNodeInfo(node, sidebar) {
    //update existing node color and
    var nodeSidebar = document.getElementById(node.id.toString());
    if (nodeSidebar) {
        //update node title
        if (node.title) {
            nodeSidebar.querySelector('.dropdown-title > .dropdown-title-left > span').textContent = node.title;
        }
        else {// get missing node title
            nodeSidebar.querySelector('.dropdown-title > .dropdown-title-left > span').textContent = node.type;
        }
        //update bypass
        if (node.mode === 4 || node.mode === 2) {
            for (let nodeOfSidebar of NodeListOfSidebar) {
                if (nodeOfSidebar.nodeID === node.id) {
                    if (nodeOfSidebar.isBypass === false) {
                        nodeOfSidebar.toggleBypass();
                    }
                }
            }
        }
        else {// get missing node title
            for (let nodeOfSidebar of NodeListOfSidebar) {
                if (nodeOfSidebar.nodeID === node.id) {
                    if (nodeOfSidebar.isBypass === true) {
                        nodeOfSidebar.toggleBypass();
                    }
                }
            }
        }

        //update node color and title change
        if (node.bgcolor) {
            var opacityValue = 0.2;
            var rgbaColor = hexToRgbA(node.bgcolor, opacityValue);
            nodeSidebar.querySelector('.dropdown-title').style.setProperty('--background-main', rgbaColor);
            nodeSidebar.style.backgroundColor = rgbaColor;
        }
        else {
            nodeSidebar.querySelector('.dropdown-title').style.setProperty('--background-main', 'rgba(20, 20, 22, 1)');
            nodeSidebar.style.backgroundColor = '';
        }


    }
}

function initNumWidgetOfSidebar(widget, dropdown, fav) {
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
        step: widget.options.step / 10,
        fav: fav,
        showFavIcon: true,
        value: value,
        precision: widget.options.precision,
        onChange: function (value) {
            // console.log('🐱',typeof value, value, typeof widget.value, widget.value);
            widget.value = parseFloat(value);
            ComnfyUIapp.graph.setDirtyCanvas(true);
        },
        callbacks: {
            onFav: function (fav) {
                console.log('Favorite option:', fav);
                if (fav) { favWidgetCount++ } else { favWidgetCount-- }
                toggleFav(dropdown, numInput1);
            },
            onEdit: function (editting) {
                if (editting) { isStartSync = false; }
                else { isStartSync = true; }
            }
        }
    });
    dropdown.addElement(numInput1);
}

function initComboWidgetOfSidebar(widget, dropdown, fav) {
    const combo1 = new Combo({
        icon: staticPath + 'component/img/select.png',
        title: widget.name,
        options: widget.options.values,
        fav: fav,
        showFavIcon: true,
        isSupportSearch: true,
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
                if (fav) { favWidgetCount++ } else { favWidgetCount-- }
                toggleFav(dropdown, combo1);
            }
        }
    });
    dropdown.addElement(combo1);
}

function initMultiinputWidgetOfSidebar(widget, dropdown, fav) {
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
                if (fav) { favWidgetCount++ } else { favWidgetCount-- }
                toggleFav(dropdown, multiInput1);
            },
            onEdit: function (editting) {
                if (editting) { isStartSync = false; }
                else { isStartSync = true; }
            }
        }
    });
    dropdown.addElement(multiInput1);
}

function initTextWidgetOfSidebar(widget, dropdown, fav) {
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
                if (fav) { favWidgetCount++ } else { favWidgetCount-- }
                toggleFav(dropdown, singleInput);
            },
            onEdit: function (editting) {
                if (editting) { isStartSync = false; }
                else { isStartSync = true; }
            },
            onChange: function (value) {
                widget.value = value;
                ComnfyUIapp.graph.setDirtyCanvas(true);
            }
        }
    });
    dropdown.addElement(singleInput);
}

function initSwitchWidgetOfSidebar(widget, dropdown, fav) {
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
        showFavIcon: true,
        onChange: function (checked, hintElement) {
            widget.value = checked ? true : false;
            ComnfyUIapp.graph.setDirtyCanvas(true);
        },
        callbacks: {
            onFav: function (fav) {
                if (fav) { favWidgetCount++ } else { favWidgetCount-- }
                toggleFav(dropdown, switch1);
            }
        }
    });
    dropdown.addElement(switch1);
}

function initButtonWidgetOfSidebar(widget, dropdown, fav) {
    const button = new Button({
        container: '',
        iconSrc: '',
        title: widget.name,
        fav: fav,
        showFavIcon: true,
        callbacks: {
            onClick: () => widget.callback(),
            onFav: function (fav) {
                if (fav) { favWidgetCount++ } else { favWidgetCount-- }
                toggleFav(dropdown, button);
            }
        }
    });
    dropdown.addElement(button);
}

export function clearAll() {
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
function hexToRgbA(hex, opacity) {
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
function addWidgetOfSidebar(node, dropdown) {
    if (node.widgets) {
        for (let i = 0; i < node.widgets.length; i++) {
            let widget = node.widgets[i];
            if (widget.type == 'number') {// widget:数字
                initNumWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
            }
            else if (widget.type == 'combo') {// widget:单选
                initComboWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
            }
            else if (widget.type == 'text') {// [goo todo]widget:单行文本
                initTextWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
            }
            else if (widget.type == 'customtext') {// widget:多行文本
                initMultiinputWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
            }
            else if (widget.type == 'toggle') {// widget:多行文本
                initSwitchWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
            }
            else if (widget.type == 'button') {// widget:按钮
                initButtonWidgetOfSidebar(widget, dropdown, dropdown.fav[i]);
            }
        }
    }
}

//prevent domWidget from triggering browser scale
document.addEventListener('wheel', e => {
    const { ctrlKey } = e
    if (ctrlKey) {
        e.preventDefault();
        ScalCanvas(e);
        return
    }

}, { passive: false })

function ScalCanvas(e) {
    let canvasElement = ComnfyUIapp.canvas;
    var delta = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;

    // canvasElement.adjustMouseEvent(e);

    var x = e.clientX;
    var y = e.clientY;
    var is_inside = !canvasElement.viewport || (canvasElement.viewport && x >= canvasElement.viewport[0] && x < (canvasElement.viewport[0] + canvasElement.viewport[2]) && y >= canvasElement.viewport[1] && y < (canvasElement.viewport[1] + canvasElement.viewport[3]));
    if (!is_inside)
        return;

    var scale = canvasElement.ds.scale;

    if (delta > 0) {
        scale *= 1.1;
    } else if (delta < 0) {
        scale *= 1 / 1.1;
    }

    //this.setZoom( scale, [ e.clientX, e.clientY ] );
    canvasElement.ds.changeScale(scale, [e.clientX, e.clientY]);

    canvasElement.graph.change();

}
