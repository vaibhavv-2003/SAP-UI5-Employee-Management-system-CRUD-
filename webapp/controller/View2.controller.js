sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("empmgmt.controller.View2", {

        onInit: function () {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            const sEmpId = oEvent.getParameter("arguments").Empid;
            const sPath = "/EmployeeSet('" + sEmpId + "')";

            this.getView().bindElement({
                path: sPath
            });
        },

        onNavBack: function () {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView1");
        }

    });
});