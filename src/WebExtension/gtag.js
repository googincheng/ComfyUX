export class Gtag{
    constructor() {
        this.init();
    }
    init(){
        var scriptTag1 = document.createElement('script');
        scriptTag1.src = 'https://www.googletagmanager.com/gtag/js?id=G-KEPHTF86C6';
        scriptTag1.async = true;
        
        (document.head || document.body).appendChild(scriptTag1);
        
        scriptTag1.onload = function () {
            var codeToInsert = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
        
            gtag('js', new Date());
            gtag('config', 'G-KEPHTF86C6');
            `;
        
            var newScript = document.createElement('script');
        
            newScript.text = codeToInsert;
        
            var head = document.getElementsByTagName('head')[0];
        
            head.appendChild(newScript);
        
        };
        
    }
}