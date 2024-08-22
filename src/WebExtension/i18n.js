// sample use: button.textElement.setAttribute("data-i18n", "QueueFront");
const translations = {
    en: {
        Load: "Load",
        LoadDefault: "Load Default",
        Save: "Save",
        Run: "Run",
        AddToRun: "Add To Run",
        QueueFront: "Queue Front",
        Update: "Update",
        Nodes: "Nodes",
        History: "History",
        All: "All",
        Favorite: "Favorite",
        Notnull: "Notnull",
        Record: "Record",
        Done: "Done",
        Running: "Running",
        Waitting: "Waitting",
        Restore: "Restore",
        Lang: "中文",
        Gallery: "Gallery",
        ClickToSearch: "Click to Search"
    },
    zh: {
        Load: "导入",
        LoadDefault: "导入默认",
        Save: "保存",
        Run: "运行",
        AddToRun: "加入队列",
        QueueFront: "下一个运行",
        Update: "更新",
        Nodes: "节点",
        History: "历史",
        All: "全部",
        Favorite: "收藏",
        Notnull: "非空",
        Record: "记录",
        Done: "完成",
        Running: "运行中",
        Waitting: "等待中",
        Restore: "恢复",
        Lang: "English",
        Gallery: "展馆",
        ClickToSearch: "点击搜索"
    },
};

export class i18n{
    constructor() {
        this.currentLanguage = 'en';
        this.translations = translations;
    }

    setLanguage(language){
        this.currentLanguage = language;
        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.getAttribute("data-i18n");
            element.textContent = translations[language][key];
        });
    }
}



