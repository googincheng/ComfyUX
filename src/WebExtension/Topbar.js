
import { Button } from './component/js/button.js';
import { NumInput } from './component/js/numinput.js';
import { Switch } from './component/js/switch.js';
import { Modal } from './component/js/modal.js';
import { ComnfyUIapi, staticPath, ComnfyUIui } from "./ComfyUIConnector.js";
import { NodeListOfSidebar, favWidgetCount, NodeNullCount, ComfyUXi18n } from './ComfyUX.js'
import { Update } from './update.js';


export class Topbar {
    constructor() {

        this.logoUrl = staticPath + 'component/img/logo.png';
        this.logoLink = 'https://y3bpnk8e3u.feishu.cn/docx/RFIrd1kcbotTa7xqis5cKiKhnRf?from=from_copylink';
        this.leftContainer;
        this.rightContainer;

        this.element;
        this.init();
    }
    init() {
        //get static path in __init__.py

        // create container
        this.ComfyBody = document.getElementsByTagName('body')[0];
        this.ComfyBody.style.display = 'inline-flex';
        const container = this.ComfyBody.appendChild(document.createElement('div'));
        container.className = 'ComfyUXTopbar';
        container.style.backgroundColor = 'var(--background-main)';
        container.style.height = '50px';
        container.style.position = 'fixed';
        container.style.zIndex = '99999';
        container.style.left = '0px';
        container.style.right = '0px';
        container.style.top = '0px';
        container.style.bottom = 'unset';
        container.style.padding = '0 var(--space-m)';
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';
        container.style.borderBottom = '1px solid rgb(255, 255, 255, 0.2)';

        // create exist full screen
        this.offScreenContainer = document.createElement('div');
        this.offScreenContainer.className = 'ComfyUXFullScreen'
        this.ComfyBody.appendChild(this.offScreenContainer);
        this.offScreenContainer.style.position = 'fixed';
        this.offScreenContainer.style.zIndex = '99';
        this.offScreenContainer.style.left = '20px';
        this.offScreenContainer.style.right = 'unset';
        this.offScreenContainer.style.top = '20px';
        this.offScreenContainer.style.bottom = 'unset';
        this.offScreenContainer.style.width = 'fit-content';
        this.offScreenContainer.style.height = 'fit-content';
        this.offScreenContainer.style.display = 'none';
        this.offScreenContainer.style.gap = 'var(--space-m)';

        this.offScreenButton = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/off_screen.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    this.element.style.display = 'flex';
                    document.getElementsByClassName('ComfyUXSidebar')[0].style.display = 'block';
                    this.offScreenContainer.style.display = 'none';
                    window.gtag('event', 'click_offscreen');
                }
            }
        });
        this.offScreenButton.element.style.width = '34px';

        this.runButtonOffScreen = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/run.png',
            title: 'Run',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    // document.getElementById('queue-button').click();
                    app.queuePrompt(0, ComnfyUIui.batchCount);
                    window.gtag('event', 'click_offscreen_run');
                    this.runBtnUpdate(this.runButtonOffScreen);
                }
            }
        });

        this.runButtonOffScreen.buttonElement.style.setProperty('--background-main', 'var(--primary)');
        this.runButtonOffScreen.buttonElement.style.setProperty('--text-gray', 'var(--text-main)');
        this.runButtonOffScreen.buttonElement.style.fontWeight = 'var(--bold)';

        this.offScreenContainer.appendChild(this.offScreenButton.element);
        this.offScreenContainer.appendChild(this.runButtonOffScreen.buttonElement);


        // create left container
        const leftContainer = document.createElement('div');
        leftContainer.classList.add('topbar-left');
        container.appendChild(leftContainer);
        leftContainer.style.display = 'flex';
        leftContainer.style.alignItems = 'center';

        // create right container
        const rightContainer = document.createElement('div');
        rightContainer.classList.add('topbar-right');
        container.appendChild(rightContainer);
        rightContainer.style.display = 'flex';
        rightContainer.style.alignItems = 'center';
        rightContainer.style.gap = 'var(--space-m)';

        // create logos
        const logo = document.createElement('img');
        logo.src = this.logoUrl;
        logo.classList.add('topbar-logo');
        logo.style.width = '86px';
        logo.style.height = '18px';
        logo.style.cursor = 'pointer';
        logo.style.marginRight = 'var(--space-m)';
        logo.addEventListener('click', () => {
            window.open(this.logoLink);
            window.gtag('event', 'click_logo');
        });
        leftContainer.appendChild(logo);

        this.leftContainer = leftContainer;
        this.rightContainer = rightContainer;

        //init components
        this.initFullScreenBtn();
        this.initComfyMenuBtn();
        if(document.getElementById('crystools-root')){this.initInspectBtn(); }
        this.initSettingBtn();
        this.initResetViewBtn();
        this.initRefreshBtn();
        this.initClearBtn();
        const line = document.createElement('div');
        line.innerHTML = '<img src = ' + staticPath + 'component/img/verticalline.png style="width: 1px; height: 12px; margin-left: var(--space-m); margin-right: var(--space-m);">';
        this.leftContainer.appendChild(line);
        // this.initRecent(); //can't get localpath ,this is suck 
        this.initLoadBtn();
        this.initLoadDefaultBtn();
        this.initSaveBtn();
        this.initLangBtn();
        setTimeout(() => {
            this.initManagerBtn();
        }, 1000);
        this.initProcess();
        this.initRunBtn();
        this.initQueueFrontBtn();
        this.initAutoRunSwitch();
        this.initBatchInput(); 
        this.initToggleSidebar(); 
        this.initUpdateBtn();

        //return DOM element
        this.element = container;
    }

    addLeftComponent(element) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('topbar-component');
        wrapper.appendChild(element);
        this.leftContainer.appendChild(wrapper);
    }

    addRightComponent(element) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('topbar-component');
        wrapper.appendChild(element);
        this.rightContainer.appendChild(wrapper);
    }

    initFullScreenBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/fullscreen.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    this.element.style.display = 'none';
                    document.getElementsByClassName('ComfyUXSidebar')[0].style.display = 'none';
                    this.offScreenContainer.style.display = 'flex';

                    window.gtag('event', 'click_fullscreen');
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);
    }
    initComfyMenuBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/menu4.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    if (document.getElementsByClassName('comfy-menu')[0].style.display === 'block') {
                        document.getElementsByClassName('comfy-menu')[0].style.display = 'none';
                    }
                    else { 
                        document.getElementsByClassName('comfy-menu')[0].style.display = 'block';
                        document.getElementsByClassName('comfy-menu')[0].style.left = '0px';
                        document.getElementsByClassName('comfy-menu')[0].style.top = '220px';
                     }
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);

    }

    initSettingBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/setting.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    document.getElementsByClassName('comfy-settings-btn')[0].click();
                    window.gtag('event', 'click_setting');
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);
    }

    initResetViewBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/resetview.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    document.getElementById('comfy-reset-view-button').click();
                    window.gtag('event', 'click_resetview');
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);
    }

    initRefreshBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/refresh.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    document.getElementById('comfy-refresh-button').click();
                    window.gtag('event', 'click_refresh');
                    //todo: move this to ComfyUX,make sure to re-init node, and sync with sidebar       
                    // NodeListOfSidebar = [];
                    // favWidgetCount = 0;
                    // NodeNullCount = 0;
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);
    }

    initClearBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/clear.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    document.getElementById('comfy-clear-button').click();
                    window.gtag('event', 'click_clear');
                    //todo: move this to ComfyUX,make sure to re-init node, and sync with sidebar       
                    // NodeListOfSidebar = [];
                    // favWidgetCount = 0;
                    // NodeNullCount = 0;
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);
    }

    initLoadBtn() {
        var isWorkflowMenuOpen = false;
        const button = new Button({
            container: '',
            iconSrc: '',
            title: 'Load',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    window.gtag('event', 'click_load');
                    //todo: move this to ComfyUX,make sure to re-init node, and sync with sidebar       
                    // NodeListOfSidebar = [];
                    // favWidgetCount = 0;
                    // NodeNullCount = 0;

                    if (document.getElementsByClassName('comfyui-workflows-popup comfyui-popup').length) {
                        let workflowMenu = document.getElementsByClassName('comfyui-workflows-popup comfyui-popup')[0];
                        if (isWorkflowMenuOpen) {
                            isWorkflowMenuOpen = false;
                            workflowMenu.classList.remove('open');
                        }
                        else{
                            isWorkflowMenuOpen = true;
                            const rect = button.element.getBoundingClientRect();
                            workflowMenu.style.top = rect.top + 50 + 'px';
                            workflowMenu.style.left = rect.left + 'px';
                            workflowMenu.style.bottom = 'unset';
                            workflowMenu.classList.add('open');
                        }
                    }
                    else {
                        document.getElementById('comfy-load-button').click();
                    }

                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        button.textElement.setAttribute("data-i18n", "Load");
        this.leftContainer.appendChild(button.element);
    }
    initLoadDefaultBtn() {
        const button = new Button({
            container: '',
            iconSrc: '',
            title: 'Load Default',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    document.getElementById('comfy-load-default-button').click();
                    window.gtag('event', 'click_loaddefault');
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        button.textElement.setAttribute("data-i18n", "LoadDefault");
        this.leftContainer.appendChild(button.element);
    }

    initSaveBtn() {
        const button = new Button({
            container: '',
            iconSrc: '',
            title: 'Save',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    document.getElementById('comfy-save-button').click();
                    window.gtag('event', 'click_save', {
                        'node_count': NodeListOfSidebar.length,
                        'fav_count': favWidgetCount,
                        'node_null_count': NodeNullCount
                    });
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        button.textElement.setAttribute("data-i18n", "Save");
        this.leftContainer.appendChild(button.element);

    }

    initLangBtn() {
        const button = new Button({
            container: '',
            iconSrc: '',
            title: '中文',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    if (ComfyUXi18n.currentLanguage === 'en') { ComfyUXi18n.setLanguage('zh') }
                    else { ComfyUXi18n.setLanguage('en') }

                    window.gtag('event', 'click_lang', {
                        'current_Language': ComfyUXi18n.currentLanguage
                    });
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        button.textElement.setAttribute("data-i18n", "Lang");
        this.leftContainer.appendChild(button.element);

    }
    initManagerBtn() {
        const btnsOfComfyMenu = document.getElementsByClassName('comfy-menu')[0].querySelectorAll('button');
        if (btnsOfComfyMenu) {
            for (let i = 0; i < btnsOfComfyMenu.length; i++) {
                if (btnsOfComfyMenu[i].innerText == 'Manager') {
                    const button = new Button({
                        container: '',
                        iconSrc: '',
                        title: 'Manager',
                        fav: '',
                        showFavIcon: false,
                        callbacks: {
                            onClick: () => {
                                btnsOfComfyMenu[i].click();

                                window.gtag('event', 'click_manager');
                            }
                        }
                    });
                    button.buttonElement.style.setProperty('--background-main', 'transparent');
                    this.leftContainer.appendChild(button.element);
                    break;
                }
            }
        }
    }

    initProcess() {

    }

    initRunBtn() {
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/run.png',
            title: 'Run',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    // document.getElementById('queue-button').click();
                    app.queuePrompt(0, ComnfyUIui.batchCount);
                    this.runBtnUpdate(button);
                    window.gtag('event', 'click_run', {
                        'node_count': NodeListOfSidebar.length
                    });
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'var(--primary)');
        button.buttonElement.style.setProperty('--text-gray', 'var(--text-main)');
        button.buttonElement.style.fontWeight = 'var(--bold)';
        button.textElement.setAttribute("data-i18n", "Run");
        this.rightContainer.appendChild(button.element);
    }

    runBtnUpdate(button) {
        let timer = setInterval(() => {
            //await shit can't be inside setInterval
            this.isRunning(button, timer);
        }, 1000);
    }

    async isRunning(button, timer) {
        let queue = await ComnfyUIapi.getQueue();

        if (queue.Running.length) {
            button.setText('Add to Run Queue');
        }
        else {
            button.setText('Run');
            clearInterval(timer);
        }
    }

    initQueueFrontBtn() {
        const button = new Button({
            container: '',
            iconSrc: '',
            title: 'Queue Front',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => document.getElementById('queue-button').click()
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        button.buttonElement.style.border = '1px solid var(--hover)';
        button.textElement.setAttribute("data-i18n", "QueueFront");
        this.rightContainer.appendChild(button.element);
    }

    initInspectBtn(){
        const crystools = document.getElementById('crystools-root');
        const ComfyUXInspect = document.createElement('div');
        ComfyUXInspect.appendChild(crystools);
        document.body.appendChild(ComfyUXInspect);
        ComfyUXInspect.className = 'ComfyUXInspect';
        ComfyUXInspect.style.zIndex = '9999';
        ComfyUXInspect.style.padding = 'var(--space-m)';
        ComfyUXInspect.style.borderRadius = '4px';
        ComfyUXInspect.style.backgroundColor = 'var(--background-main)';
        ComfyUXInspect.style.position = 'fixed';
        ComfyUXInspect.style.width = '200px';
        ComfyUXInspect.style.top = '100px';
        ComfyUXInspect.style.display = 'none';
        ComfyUXInspect.style.left = '8px';

        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/inspect.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    if (ComfyUXInspect.style.display === 'block') {
                        ComfyUXInspect.style.display = 'none';
                        window.gtag('event', 'toggle_inspect',{'toggle': 'close'});
                    }
                    else { 
                        ComfyUXInspect.style.display = 'block';
                        window.gtag('event', 'toggle_inspect',{'toggle': 'open'});
                     }
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'transparent');
        this.leftContainer.appendChild(button.element);
    }

    initAutoRunSwitch() {
        var autoQueueEnabled = false;
        var autoQueueMode = 'change';
        var switch1 = new Switch({
            icon: '',
            title: 'Auto',
            hintOn: '',
            hintOff: '',
            fav: '',
            showFavIcon: false,
            onChange: function (checked, hintElement) {
                if (checked) {
                    autoQueueEnabled = true;
                    autoQueueMode = 'change';
                }
                else {
                    autoQueueEnabled = false;
                }
                window.gtag('event', 'auto_run', {
                    'auto_run': checked
                });
            },
            callbacks: {}
        });
        switch1.titleElement.style.width = '30px';
        switch1.switchContainer.style.paddingTop = '8px';
        switch1.switchContainer.style.setProperty('--background-main', 'var(--background-gray)');
        switch1.switchContainer.style.paddingBottom = '8px';
        this.rightContainer.appendChild(switch1.element);

        ComnfyUIapi.addEventListener("graphChanged", () => {
            if (autoQueueMode === "change" && autoQueueEnabled === true) {
                app.queuePrompt(0, ComnfyUIui.batchCount);
            }
        });

    }

    initBatchInput() {
        const numInput = new NumInput({
            iconLeft: staticPath + 'component/img/arrow_left.png',
            title: 'batch',
            iconRight: staticPath + 'component/img/arrow_right.png',
            min: 1,
            max: 100,
            round: 0,
            step: 1,
            fav: '',
            value: 1,
            showFavIcon: false,
            precision: 0,
            onChange: function (value) {
                ComnfyUIui.batchCount = value;
                window.gtag('event', 'batch_count', {
                    'count': value
                });
            },
            callbacks: {
            }
        });
        numInput.titleElement.style.width = '40px';
        numInput.numberInputElement.style.width = '20px';
        numInput.numInputContainer.style.setProperty('--background-main', 'var(--background-gray)');
        numInput.numInputContainer.style.paddingTop = '5px';
        numInput.numInputContainer.style.paddingBottom = '5px';
        this.rightContainer.appendChild(numInput.element);
    }

    initToggleSidebar(){
        const button = new Button({
            container: '',
            iconSrc: staticPath + 'component/img/toggle_sidebar.png',
            title: '',
            fav: '',
            showFavIcon: false,
            callbacks: {
                onClick: () => {
                    if (document.getElementsByClassName('ComfyUXSidebar')[0].style.display === 'block') {
                        document.getElementsByClassName('ComfyUXSidebar')[0].style.display = 'none';
                        window.gtag('event', 'toggle_sidebar',{'toggle': 'close'});
                    }
                    else { 
                        document.getElementsByClassName('ComfyUXSidebar')[0].style.display = 'block';
                        window.gtag('event', 'toggle_sidebar',{'toggle': 'open'});
                     }
                }
            }
        });
        button.buttonElement.style.setProperty('--background-main', 'var(--background-gray)');
        this.rightContainer.appendChild(button.element);
    }
    initUpdateBtn() {
        const localVersionUrl = staticPath + "version.json";
        const githubRepoOwner = "googincheng";
        const githubRepoName = "ComfyUX";
        const giteeRepoOwner = "googincheng";
        const giteeRepoName = "ComfyUX";
        
        const checker = new Update(localVersionUrl, githubRepoOwner, githubRepoName, giteeRepoOwner, giteeRepoName);

        if (typeof window.gtag != 'undefined') {
            window.gtag('event', 'comfyux_start', {
                'local_version': checker.localVersion,
                'target_version': checker.targetVersion
            });
        }

        async function createUpdateBtn(rightContainer, showUpdateModal) {
            const updateInfo = await checker.checkForUpdates();
            const githubUrl = checker.githubUrl;
            const giteeUrl = checker.giteeUrl;
            if (updateInfo.localVersion !== updateInfo.latestVersion) {
                const button = new Button({
                    container: '',
                    iconSrc: '',
                    title: 'Update',
                    fav: '',
                    showFavIcon: false,
                    callbacks: {
                        onClick: () => {
                            showUpdateModal(updateInfo, githubUrl, giteeUrl);

                            window.gtag('event', 'update_click_entry');
                        }
                    }
                });
                window.gtag('event', 'update_available');
                button.buttonElement.style.setProperty('--background-main', '-primary');
                button.buttonElement.style.border = '1px solid var(--hover)';
                button.textElement.setAttribute("data-i18n", "Update");
                rightContainer.appendChild(button.element);
            }
        }

        createUpdateBtn(this.rightContainer, this.showUpdateModal);
    }

    showUpdateModal(updateInfo, githubUrl, giteeUrl) {
        // Example usage
        const modal = new Modal(staticPath + 'component/img/update_icon.png', 'New Version!', updateInfo.description, '');
        document.body.appendChild(modal.getElement());

        // const extraContent = document.createElement('p');
        // extraContent.textContent = 'Additional content';
        // modal.addContent(extraContent);

        const buttons = [
            {
                text: 'Github', primary: true, callback: () => {
                    window.open(githubUrl, '_blank');
                    window.gtag('event', 'update_click_github');
                }
            },
            {
                text: 'Gitee (中国)', primary: true, callback: () => {
                    window.open(giteeUrl, '_blank');
                    window.gtag('event', 'update_click_gitee');
                }
            },
            {
                text: 'Maybe Later', primary: false, callback: () => {
                    modal.removeElement();
                    window.gtag('event', 'update_click_cancel');
                }
            }
        ];

        modal.addFooter(buttons, 'Remember my choice', (checked) => {
            if (checked) {
                alert('Checkbox checked');
            } else {
                alert('Checkbox unchecked');
            }
        });


    }
}

