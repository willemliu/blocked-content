import "element-closest";
import "ie-array-find-polyfill";
import {
    activateVendor,
    showLock,
    htmlToElement,
    loadAllScripts,
} from "../utils/gdprLock";

declare var window: any;
if (!("__cmp" in window)) {
    window["__cmp"] = () => {};
}

/**
 * Element.remove() polyfill for IE11.
 */
if (!("remove" in Element.prototype)) {
    (Element.prototype["remove"] as any) = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

const consentButtons = document.querySelectorAll(".blocked-content-container");
let additionalVendorList: any[any] = [];
const allPurposeConsents = [1, 2, 3, 4, 5];

function consentVendor(vendorName: string = "") {
    if ((vendorName && vendorName !== "inline-html") || !window.__cmp) {
        activateVendor(vendorName);
    } else {
        window.__cmp("acceptAll", undefined, () => {
            window.__cmp("acceptAllAdditional", undefined, () => {
                window.location.reload();
            });
        });
    }
}

if (consentButtons.length) {
    [].slice.call(consentButtons).forEach((button: HTMLElement) => {
        button.addEventListener("click", () => {
            const vendorName = button.getAttribute(
                "data-vendor-name"
            ) as string;
            /**
             * In case the vendor list is empty we shall proceed as if we found the
             * vendor because we assume Faktor is unreachable.
             */
            const foundVendor = additionalVendorList.vendors
                ? additionalVendorList.vendors.find(
                      (vendor: any) => vendor.name.toLowerCase() === vendorName
                  )
                : true;
            if (!foundVendor) {
                consentVendor("");
            } else {
                const template = document.querySelector(
                    `textarea[data-vendor-name="${vendorName}"],template[data-vendor-name="${vendorName}"],script[data-vendor-name="${vendorName}"]`
                ) as HTMLElement;
                if (template) {
                    if (window.__cmp) {
                        window.__cmp("acceptAll", {
                            purposeIds: foundVendor.purposeIds,
                        });
                        window.__cmp("acceptAllAdditional", {
                            vendorIds: [foundVendor.id],
                        });
                        consentVendor(vendorName);
                    } else {
                        consentVendor(vendorName);
                    }
                }
            }
        });
    });
}

let memoPurposeConsents: any;
function getVendorConsentsMemoized(cb: (purposeConsents: any) => void) {
    if (memoPurposeConsents) {
        cb(memoPurposeConsents);
    } else {
        window.__cmp("getVendorConsents", undefined, (purposeConsents: any) => {
            memoPurposeConsents = purposeConsents;
            cb(memoPurposeConsents);
        });
    }
}

let memoAdditionalVendorConsents: any;
function getAdditionalVendorConsentsMemoized(
    cb: (additionalVendorConsents: any) => void
) {
    if (memoAdditionalVendorConsents) {
        cb(memoAdditionalVendorConsents);
    } else {
        window.__cmp(
            "getAdditionalVendorConsents",
            [],
            (additionalVendorList: any) => {
                memoAdditionalVendorConsents = additionalVendorList;
                cb(memoAdditionalVendorConsents);
            }
        );
    }
}

function clearMemoization() {
    memoPurposeConsents = undefined;
    memoAdditionalVendorConsents = undefined;
}

if (window.__cmp && !document.querySelector("html.cookiewall")) {
    const checkVendors = function () {
        window.__cmp("getAdditionalVendorList", null, function (vendors: any) {
            additionalVendorList = vendors;
            getAdditionalVendorConsentsMemoized(function (
                additionalVendorConsents: any
            ) {
                const lockedIds: any[] = [];
                Object.keys(additionalVendorConsents.vendorConsents).forEach(
                    (key: any) => {
                        if (
                            additionalVendorList.vendors &&
                            additionalVendorConsents.vendorConsents[key]
                        ) {
                            additionalVendorList.vendors.forEach(
                                (vendor: any) => {
                                    let purposeFullfilled: boolean[] = [];
                                    vendor.purposeIds.forEach(
                                        (purposeId: number) => {
                                            getVendorConsentsMemoized(
                                                (purposes: any) => {
                                                    purposeFullfilled.push(
                                                        purposes
                                                            .purposeConsents[
                                                            purposeId
                                                        ]
                                                    );
                                                }
                                            );
                                        }
                                    );
                                    if (
                                        vendor.id == key &&
                                        purposeFullfilled.reduce(
                                            (
                                                state: boolean,
                                                purpose: boolean
                                            ) => state && purpose === true
                                        )
                                    ) {
                                        activateVendor(
                                            vendor.name.toLowerCase()
                                        );
                                    } else if (vendor.id == key) {
                                        showLock(vendor.name.toLowerCase());
                                    }
                                }
                            );
                        } else if (
                            additionalVendorConsents.vendorConsents[key] ===
                            false
                        ) {
                            lockedIds.push(key);
                        }
                    }
                );
                additionalVendorList.vendors.forEach((vendor: any) => {
                    if (lockedIds.indexOf(`${vendor.id}`) > -1) {
                        showLock(vendor.name.toLowerCase());
                    }
                });
            });
        });
    };

    window.__cmp("addEventListener", "consentManagerClosed", () => {
        window.location.reload();
    });

    window.__cmp("addEventListener", "acceptAllButtonClicked", () => {
        window.location.reload();
    });

    getVendorConsentsMemoized((vendorConsents: any) => {
        const consentAll = allPurposeConsents
            .map((purposeId: number) => {
                return vendorConsents.purposeConsents[purposeId];
            })
            .reduce((res: boolean, consent: boolean) => {
                return res === consent && consent;
            });

        if (consentAll) {
            activateVendor("inline-html");
        } else {
            showLock("inline-html");
        }

        const consentConvert = [1, 2, 4, 5]
            .map((purposeId: number) => {
                return vendorConsents.purposeConsents[purposeId];
            })
            .reduce((res: boolean, consent: boolean) => {
                return res === consent && consent;
            });

        if (consentConvert) {
            const template = document.querySelector(
                `template[data-vendor-name="convert"]`
            ) as HTMLElement;
            if (template) {
                const templateElement = htmlToElement(
                    template.innerHTML
                ) as HTMLElement;
                (template.parentElement as HTMLElement).insertBefore(
                    templateElement,
                    template
                );
                loadAllScripts(templateElement);
            }
        }

        // If purpose 2 consent has been given.
        if (vendorConsents.purposeConsents[2]) {
            activateVendor("fdmg-personalized");
        } else {
            showLock("fdmg-personalized");
        }
    });

    window.__cmp("addEventListener", "cmpReady", function () {
        checkVendors();
        window.__cmp("addEventListener", "consentChanged", () => {
            clearMemoization();
            window.__cmp(
                "consentDataExist",
                undefined,
                (dataExist: boolean) => {
                    if (dataExist) {
                        window.__cmp("showConsentTool", false);
                    }
                }
            );
        });
    });

    // const footerLink = document.querySelector(
    //     '.menu-link[href="/cookiebeleid"]'
    // );
    // if (footerLink) {
    //     footerLink.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         window.__cmp("showConsentManager", true);
    //     });
    // }
}
