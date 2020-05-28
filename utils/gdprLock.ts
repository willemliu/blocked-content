export function htmlToElement(html: string) {
    const span = document.createElement("span");
    span.innerHTML = html.trim();
    return span;
}

export function runJs(scriptElement: HTMLScriptElement) {
    const head = document.getElementsByTagName("head")[0];
    if (scriptElement.src) {
        const script = document.createElement("script");
        console.log("Load external script", scriptElement);
        script.src = scriptElement.src;
        head.appendChild(script);
    } else {
        try {
            console.log("Eval inline script", scriptElement);
            eval(scriptElement.innerHTML);
        } catch (e) {
            console.log(`Can't eval inline script`, scriptElement);
        }
    }
}

export function loadAllScripts(templateElement: HTMLElement) {
    const scripts = templateElement.querySelectorAll("script");
    if (scripts.length) {
        console.log("Activate scripts", scripts);
        [].slice.call(scripts).forEach((script) => {
            runJs(script);
        });
    }
}

export function cleanUp(elements: HTMLElement[]) {
    elements.forEach((element) => {
        if (element.classList.contains("blocked-content-container")) {
            element.classList.add("hidden-cmp-content");
            element.addEventListener("animationend", () => {
                [].slice
                    .call(
                        document.querySelectorAll(
                            ".unblocked.hidden-cmp-content"
                        )
                    )
                    .forEach((unblocked: HTMLElement) => {
                        unblocked.classList.remove("hidden-cmp-content");
                    });
                element.remove();
            });
        } else {
            element.remove();
        }
    });
}

export function activateTemplate(button: HTMLElement, template: HTMLElement) {
    if (button) {
        const templateElement = htmlToElement(
            template.nodeName === "TEXTAREA"
                ? (template as HTMLTextAreaElement).value
                : template.innerHTML
        ) as HTMLElement;
        templateElement.classList.add("unblocked");
        templateElement.classList.add("hidden-cmp-content");
        templateElement.classList.add("inline-content");
        templateElement.classList.add("block");
        if (templateElement) {
            (button.parentElement as HTMLElement).insertBefore(
                templateElement,
                button
            );
            loadAllScripts(templateElement);
            cleanUp([button, template]);
        }
    }
}

export function activateVendor(vendorName: string) {
    console.log("activate vendor", vendorName);
    const templates: HTMLElement[] = [].slice.call(
        document.querySelectorAll(
            `textarea[data-vendor-name="${vendorName}"],template[data-vendor-name="${vendorName}"],script[data-vendor-name="${vendorName}"]`
        )
    );
    if (templates.length) {
        templates.forEach((template) => {
            activateTemplate(
                template.closest(
                    `.blocked-content-container[data-vendor-name="${vendorName}"]`
                ) as HTMLElement,
                template
            );
        });
    }
}

export function showLock(vendorName: string) {
    console.log("lock vendor", vendorName);
    const templates: HTMLElement[] = [].slice.call(
        document.querySelectorAll(
            `.blocked-content-container[data-vendor-name="${vendorName}"]`
        )
    );
    if (templates.length) {
        templates.forEach((template) => {
            template.style.visibility = "visible";
            template.style.height = "auto";
        });
    }
}
