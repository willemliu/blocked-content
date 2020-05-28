export function htmlToElement(html: string) {
    const span = document.createElement("span");
    span.innerHTML = html.trim();
    return span;
}

export function runJs(scriptElement: HTMLScriptElement) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = scriptElement.src;
    head.appendChild(script);
}

export function loadAllScripts(templateElement: HTMLElement) {
    const scripts = templateElement.querySelectorAll("script");
    if (scripts.length) {
        [].slice.call(scripts).forEach((script) => {
            runJs(script);
        });
    }
}
