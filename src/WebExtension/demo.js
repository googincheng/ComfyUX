// import { Button } from './component/js/button.js';
// import { Dropdown } from './component/js/dropdown.js';
// import { Carousel } from './component/js/carousel.js';
// import { Switch } from './component/js/switch.js';
// import { NumInput } from './component/js/numinput.js';
// import { MultiInput } from './component/js/multiinput.js';
// import { Combo } from './component/js/combo.js';
// import { app } from "../../../scripts/app.js";

// app.registerExtension({
//     name: "ComfyUX.demo",

//     init() {
//         console.log("init");

//         const demo = new Demo();

//         if (document.getElementById("queue-button"))
//             console.log("✅ menu access");
//         else console.log("❌ menu access");

//         if (document.getElementById("graph-canvas"))
//             console.log("✅ canvas access");
//         else console.log("❌ canvas access");

//         if (app)
//             console.log("✅ ComfyAPP access");
//         else console.log("❌ ComfyAPP access");

//         if (app.graph)
//             console.log("✅ app.graph access: " + app.graph);
//         else console.log("❌ app.graph access");

//         if (app.canvas)
//             console.log("✅ app.graph access: " + app.graph);
//         else console.log("❌ app.graph access");

//         if (LiteGraph)
//             console.log("✅ LiteGraph access: " + LiteGraph);
//         else console.log("❌ LiteGraph access");

//         if (LGraphNode)
//             console.log("✅ LGraphNode access: " + app.graph.LGraphNode);
//         else console.log("❌ LGraphNode access");
//     },
//     addCustomNodeDefs() {
//         console.log("addCustomNodeDefs");
//     },
//     getCustomWidgets() {
//         console.log("getCustomWidgets");
//     },

//     beforeRegisterNodeDef() {
//         console.log("beforeRegisterNodeDef");
//     },

//     registerCustomNodes() {
//         console.log("registerCustomNodes");
//     },

//     beforeConfigureGraph(graphData, missingNodeTypes) {
//         console.log("beforeConfigureGraph: ");
//         console.log(graphData);
//         console.log(missingNodeTypes);
//     },
//     //Triggered when every node drawed to canvas
//     nodeCreated() {
//         console.log("nodeCreated");
//         // LiteGraph.CANVAS_GRID_SIZE = 40;
//         // LiteGraph.NODE_DEFAULT_BGCOLOR = "#DA4545";
//         // LiteGraph.NODE_DEFAULT_COLOR = "#DA4545";
//         // LiteGraph.WIDGET_BGCOLOR = "#DA4545";
//     },

//     loadedGraphNode(node) {
//         console.log("loadedGraphNode:" + node.title);
//     },
//     afterConfigureGraph(missingNodeTypes) {
//         console.log("afterConfigureGraph:" + missingNodeTypes);
//         if (app.graph._nodes) {
//             for (const node of app.graph._nodes) {
//                 if (node.widgets) {
//                     // ✅get node ID and title
//                     console.log(node.id + '🌹node-name:' + node.title);
//                     // ✅get multi images src of node 
//                     if (node.imgs) {
//                         for (let img of node.imgs) {
//                             console.log("node image src:" + img.currentSrc);
//                         }
//                     }
//                     // todo：get and set node audio
//                     // todo：get and set node video
//                     // ✅get and set widget value

//                     for (let widget of node.widgets) {
//                         console.log('widget-name:' + widget.name);
//                         console.log('widget-type:' + widget.type);
//                         console.log('widget-value:' + widget.value);
//                         if (widget.type == 'number') {
//                             // widget:数字
//                         }
//                         else if (widget.type == 'combo') {
//                             // widget:单选
//                             //todo 获取所有选项
//                         }
//                         else if (widget.type == 'text') {
//                             // widget:单行文本
//                         }
//                         else if (widget.type == 'customtext') {
//                             // widget:多行文本
//                         }
//                         else if (widget.type == 'toggle') {
//                             // widget:多行文本
//                         }
//                         else if (widget.type == 'button') {
//                             // widget:按钮
//                         }
//                     }
//                 }
//                 node.configure(node.serialize());
//             }
//         }
//     },
//     refreshComboInNodes(defs) {
//         console.log("refreshComboInNodes: " + defs);
//     },
//     setup() {
//         console.log("setup");
//         for (var node of app.graph._nodes) {
//             //only callback at number-type widget changed
//             node.onWidgetChanged = function (wName, wValue, old_value, widget) {
//                 console.log('🖌️Widget value change');
//                 console.log('Name:', wName);
//                 console.log('Value:', wValue);
//                 console.log('old_value:', old_value);
//                 console.log('widget:', widget);
//             };
//             //don't use! this conflict with ComfyUI custom widget
//             // for (let widget of node.widgets) {
//             //     widget.callback += function (value, that, node, pos, event) {
//             //         console.log('🖌️Widget value change');
//             //         console.log('name:', widget.name);
//             //         console.log('value:', value);
//             //         console.log('that:', that);
//             //         console.log('node:', node);
//             //         console.log('pos:', pos);
//             //         console.log('event:', event);
//             //     };
//             // };
//             //not work
//             node.onPropertyChanged = function (index, properties){
//                 console.log('🍷Property value change');
//                 console.log('index:', index);
//                 console.log('properties:', properties);
//             }
//         };
//         for(let group of app.graph._groups){
//             console.log('🦶nodes of group:', group._nodes);
//         }
//     }

// });

// export class Demo {
//     constructor() {
//         this.init();
//     }
//     init() {
        
//         const ComfyBody = document.getElementsByTagName('body')[0];
//         ComfyBody.style.display = 'flex';
//         const container = ComfyBody.appendChild(document.createElement('div'));
//         container.className = 'container';
//         container.style.backgroundColor = '#202022';
//         container.style.width = '300px';
//         container.style.position = 'absolute';
//         container.style.zIndex = '100';
//         container.style.left = '0px';
//         container.style.right = 'unset';
//         container.style.top = '0px';
//         container.style.bottom = '0px';
//         container.style.overflow = 'scroll';
//         container.style.borderRight = '1px solid rgb(255, 255, 255, 0.2)';
        
//         container.addEventListener("contextmenu", function(e) {
//             e.preventDefault(); 
//         });
        
//         container.addEventListener('mousedown', (e) => {
//             console.log(e.which);
//             var node = app.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes, 5);
//             if(e.which == 3){
//                 app.canvas.processContextMenu(node,e);
//             }
//         });
//         container.addEventListener('click', (e) => {
//             console.log(e.which);
//             LiteGraph.closeAllContextMenus();
//         });

//         var cssLink1 = document.createElement("link");
//         cssLink1.rel = "stylesheet";
//         cssLink1.href = srcPath + "/component/css/global_dark.css";
//         document.head.appendChild(cssLink1);

//         const images = [
//             srcPath + '/component/img/placeholder2.png',
//             srcPath + '/component/img/placeholder3.png',
//             srcPath + '/component/img/placeholder2.png',
//             srcPath + '/component/img/placeholder3.png',
//             srcPath + '/component/img/placeholder2.png',
//             srcPath + '/component/img/placeholder3.png',
//             srcPath + '/component/img/placeholder2.png',
//             srcPath + '/component/img/placeholder3.png'
//         ];
//         const carousel = new Carousel('', images);

//         const dropdown2 = new Dropdown(container, {
//             title: 'Dropdown Title 215151512412',
//             nodeID: '32523636424546',
//             iconLeft: srcPath + '/component/img/placeholder.png',
//             iconRight: srcPath + '/component/img/placeholder.png',
//             buttonText: 'Button',
//             buttonIcon: srcPath + '/component/img/placeholder.png',
//             content: '',
//             buttonFunctions: {
//                 normal: () => console.log('Button normal state'),
//                 hover: () => console.log('Button hover state'),
//                 pressed: () => console.log('Button pressed state')
//             }
//         });
//         dropdown2.addElement(carousel.element);
//         //wait css add to element
//         setTimeout(function() {
//             dropdown2.toggleContent();
//         }, 100);

//         const button = new Button('', srcPath + '/component/img/placeholder.png', 'Click Me', {
//             onClick: () => alert('Button clicked!')
//         });
//         const button2 = new Button('', srcPath + '/component/img/placeholder.png', 'Click Me', {
//             onClick: () => alert('Button clicked!')
//         });

//         const dropdown = new Dropdown(container, {
//             title: 'Dropdown Title',
//             nodeID: '3252363646546',
//             iconLeft: srcPath + '/component/img/placeholder.png',
//             iconRight: srcPath + '/component/img/placeholder.png',
//             buttonText: 'Button',
//             buttonIcon: srcPath + '/component/img/placeholder.png',
//             content: '',
//             buttonFunctions: {
//                 normal: () => console.log('Button normal state'),
//                 hover: () => console.log('Button hover state'),
//                 pressed: () => console.log('Button pressed state')
//             }
//         });
//         dropdown.addElement(button.element);
//         dropdown.addElement(button2.element);

//         var switch1 = new Switch({
//             icon: srcPath + '/component/img/placeholder.png',
//             title: 'Switch 1125125125125',
//             hint: 'Off',
//             onChange: function(checked, hintElement) {
//                 hintElement.innerText = checked ? 'On' : 'Off';
//             }
//         });
//         dropdown.addElement(switch1.element);

//         var numInput1 = new NumInput({
//             iconLeft: srcPath + '/component/img/placeholder.png',
//             title: 'Number qgqegeqgqeg',
//             iconRight: srcPath + '/component/img/placeholder.png',
//             min: 0,
//             max: 100,
//             step: 1,
//             precision: 2,
//             round: 1,
//             onChange: function(value) {
//                 console.log('Value changed to: ' + value);
//             }
//         });
//         dropdown.addElement(numInput1.element);


//         var multiInput1 = new MultiInput({
//             placeholder: 'Enter your text here...',
//             textContent: '这是一段提示词',
//             onChange: function(value) {
//                 console.log('Value changed to: ' + value);
//             }
//         });
//         dropdown.addElement(multiInput1.element);

//         const combo1 = new Combo({
//             icon: srcPath + '/component/img/placeholder.png',
//             title: 'Select Option',
//             options: ['Option 1', 'Option 2', 'Option 3'],
//             defaultOption: 'Option 1',
//             callback: (selectedOption) => {
//                 console.log('Selected option:', selectedOption);
//             }
//         });
//         dropdown.addElement(combo1.element);
//     }
// }
