// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/core/UIComponent"
// ], function (Controller, UIComponent) {
//     "use strict";

//     return Controller.extend("empmgmt.controller.View1", {

//         onEmpSelect: function (oEvent) {
//             const oItem = oEvent.getParameter("listItem");
//             const oCtx = oItem.getBindingContext();

//             const sEmpId = oCtx.getProperty("Empid");

//             const oRouter = UIComponent.getRouterFor(this);
//             oRouter.navTo("RouteView2", {
//                 Empid: sEmpId
//             });
//         }

//     });
// });


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, UIComponent, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("empmgmt.controller.View1", {

    onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oTable = this.byId("table1");
            const oBinding = oTable.getBinding("items");

            //handing the edge case here, if the binding is not there then we can't do anything, so we return
            if (!oBinding) {
                return;
            }

            if (!sQuery) {
                oBinding.filter([], "Application");
                return;
            }

            // EXACT match with backend
            const oFilter = new Filter(
                "Fname",
                FilterOperator.EQ,   
                sQuery
            );

            // This WILL appear in URL in Payload, this url will be sent to your backedn and data will be filtered in the backend and only the matching data will be sent to the frontend, this is called server side filtering
            // Control bucket and Application bucket, application bucket is used for filtering in the frontend and control bucket is used for filtering in the frontend, if you want to do client side filtering then you can use control bucket and if you want to do server side filtering then you can use application bucket
            oBinding.filter([oFilter], "Application");
        },

        onRefresh: function () {
            const oTable = this.byId("table1");
            const oBinding = oTable.getBinding("items");

            // Clear filters
            oBinding.filter([], "Application");

            // Force backend reload
            this.getView().getModel().refresh(true);
        },

        
        // Handle table selection change
        // This was the newly added code on 25.04.2026
        onSelectionChange(oEvent) {
            const oTable = this.byId("table1");
            const aSelectedItems = oTable.getSelectedItems();
            const bHasSelection = aSelectedItems.length > 0;
            const bSingleSelection = aSelectedItems.length === 1;
            
            // Enable/disable buttons based on selection
            this.byId("editButton").setEnabled(bSingleSelection);
            this.byId("deleteButton").setEnabled(bHasSelection);
        },
  
        onEmpSelect: function (oEvent) {
            //oItem is just a instance like a structure of the table item
            const oItem = oEvent.getParameter("listItem");
            // oCtx is the context of the item, it contains the data of the item, it is like a pointer to the data of the item, to liknk this instance and data we use the Binding context.
            const oCtx = oItem.getBindingContext();
            
            // whatever empid we have selected will be store in sEmpId
            const sEmpId = oCtx.getProperty("Empid");
            
            
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView2", {
            
            // Whatever empid was stored in the variable sEmpId will be passed to the route as a parameter,index.html to index.html#/Employees/101
                Empid: sEmpId
            });
        }

    });
});