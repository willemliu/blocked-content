if (!("remove" in Element.prototype)) {
    (Element.prototype["remove"] as any) = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}
