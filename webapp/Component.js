sap.ui.define([
    "sap/ui/core/UIComponent",
    "empmgmt/model/models"
], (UIComponent, models) => {
    "use strict";

        // Extends the base class ui5 component and also makes it available under the namespace empmgmt.Component
    return UIComponent.extend("empmgmt.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // without a function like init the manifest can't do anything on it's own, so we need to call it here via a function
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            // prototype here is like a class like in java, it allows us to call the init function of the base class

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});