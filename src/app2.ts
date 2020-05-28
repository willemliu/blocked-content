import "element-closest";
import "ie-array-find-polyfill";
import { activateVendor, showLock } from "../utils/gdprLock";

declare var window: any;
if (!("__tfcapi" in window)) {
    window["__tfcapi"] = () => {};
}

let vendorListMemo: any;

const fdmgPurposes = [
    {
        id: null,
        vendorName: "youtube",
        purposes: [],
    },
    {
        id: null,
        vendorName: "twitter",
        purposes: [],
    },
    {
        id: null,
        vendorName: "instagram",
        purposes: [],
    },
    {
        id: null,
        vendorName: "soundcloud",
        purposes: [],
    },
    {
        id: null,
        vendorName: "vimeo",
        purposes: [],
    },
    {
        id: null,
        vendorName: "inline-html",
        purposes: [],
    },
];

function consentVendor(vendorName: string = "") {
    if ((vendorName && vendorName !== "inline-html") || !window.__cmp) {
        activateVendor(vendorName);
    } else {
        window.__tcfapi("accept", 2, (result: any) => {
            console.log(result);
        });
    }
}

if (window.__tcfapi && !document.querySelector("html.cookiewall")) {
    /**
     * consentManagerClosed.
     * Idiotic API design 101. Whoever thought to put the event name at the end of the argument list
     * should be fired ASAP.
     */
    window.__tcfapi(
        "addEventListener",
        2,
        (result: any) => {
            console.log(result);
            window.location.reload();
        },
        "consentManagerClosed"
    );

    /**
     * consentNoticeClosed.
     * Idiotic API design 101. Whoever thought to put the event name at the end of the argument list
     * should be fired ASAP.
     */
    window.__tcfapi(
        "addEventListener",
        2,
        (result: any) => {
            console.log(result);
            window.location.reload();
        },
        "consentNoticeClosed"
    );

    /**
     * saveAndExitButtonClicked.
     * Idiotic API design 101. Whoever thought to put the event name at the end of the argument list
     * should be fired ASAP.
     */
    window.__tcfapi(
        "addEventListener",
        2,
        (result: any) => {
            console.log(result);
            window.location.reload();
        },
        "saveAndExitButtonClicked"
    );

    /**
     * denyAllButtonClicked.
     * Idiotic API design 101. Whoever thought to put the event name at the end of the argument list
     * should be fired ASAP.
     */
    window.__tcfapi(
        "addEventListener",
        2,
        (result: any) => {
            console.log(result);
            window.location.reload();
        },
        "denyAllButtonClicked"
    );

    /**
     * acceptAllButtonClicked.
     * Idiotic API design 101. Whoever thought to put the event name at the end of the argument list
     * should be fired ASAP.
     */
    window.__tcfapi(
        "addEventListener",
        2,
        (result: any) => {
            console.log(result);
            window.location.reload();
        },
        "acceptAllButtonClicked"
    );

    /**
     * CMP Ready.
     * Idiotic API design 101. Whoever thought to put the event name at the end of the argument list
     * should be fired ASAP.
     */
    window.__tcfapi(
        "addEventListener",
        2,
        (e: any) => {
            console.log(e);

            window.__tcfapi("getTCData", 2, (tcData: any, success: any) => {
                console.log(tcData, success);
            });

            /**
             * Retrieve all vendors.
             * Idiotic API design 101. 2016 is calling and wants you to call back...
             * Get it? Callback? Because callback function... ahh never mind.
             * This API is introduced in 2020. It should have been implemented with
             * Promises so we can use async/await instead of this callback-Hell.
             */
            window.__tcfapi("getVendorList", 2, (vendorList: any) => {
                console.log(vendorList);
                vendorListMemo = (Object as any).values(vendorList.vendors);
                vendorListMemo.forEach((vendor: any) => {
                    fdmgPurposes.forEach((fdmgPurpose) => {
                        if (
                            fdmgPurpose.vendorName.toLowerCase() ===
                            vendor.name.toLowerCase()
                        ) {
                            fdmgPurpose.id = vendor.id;
                            fdmgPurpose.purposes = vendor.purposes;
                            window.__tcfapi(
                                "checkConsent",
                                2,
                                (data: any, success: any) => {
                                    console.log(vendor.id, vendor.name, data);
                                    if (data) {
                                        activateVendor(fdmgPurpose.vendorName);
                                    } else {
                                        showLock(fdmgPurpose.vendorName);
                                    }
                                },
                                {
                                    data: [
                                        {
                                            vendorId: vendor.id,
                                            purposeIds: vendor.purposes,
                                        },
                                    ],
                                }
                            );
                        }
                    });
                });
            });
        },
        "cmpReady"
    );

    const footerLink = document.querySelector(
        '.menu-link[href="/cookiebeleid"]'
    );
    if (footerLink) {
        footerLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.__tcfapi("showConsentManager", 2, (result: any) => {
                console.log(result);
            });
        });
    }
}

const consentButtons = document.querySelectorAll(".blocked-content-container");
if (consentButtons.length) {
    [].slice.call(consentButtons).forEach((button: HTMLElement) => {
        button.addEventListener("click", () => {
            const vendorName = button.getAttribute("data-vendor-name") || "";
            const foundVendor = vendorListMemo
                ? vendorListMemo.find(
                      (vendor: any) => vendor.name.toLowerCase() === vendorName
                  )
                : true;
            console.log(foundVendor);
            if (!foundVendor) {
                consentVendor("");
            } else {
                const template = document.querySelector(
                    `textarea[data-vendor-name="${vendorName}"],template[data-vendor-name="${vendorName}"],script[data-vendor-name="${vendorName}"]`
                ) as HTMLElement;
                if (template) {
                    // Accept doesn't work for determined vendors. Bug?
                    window.__tcfapi(
                        "accept",
                        2,
                        (result: any) => {
                            console.log("accept", result);
                        },
                        {
                            data: [
                                {
                                    ...foundVendor,
                                    vendorId: foundVendor.id,
                                    purposeIds: foundVendor.purposes,
                                },
                            ],
                        }
                    );
                    consentVendor(vendorName);
                } else {
                    consentVendor(vendorName);
                }
            }
        });
    });
}
