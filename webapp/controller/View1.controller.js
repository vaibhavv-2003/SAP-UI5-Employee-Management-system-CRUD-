sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, Filter, FilterOperator, MessageToast, MessageBox, Fragment, JSONModel) {
    "use strict";
 
    return Controller.extend("empmgmt.controller.View1", {
 
         // Initialization logic
        onInit() {
            // Get the main OData model from the component and set it to the view
            let oModel = this.getOwnerComponent().getModel();
            // new line of code experimenting for multiple entry delete 
            oModel.setUseBatch(true); // enable for not batch mode for immediate operations
            // we are now creating a que like group to store our requests
            // 🚩🚩oModel.setDeferredGroups(["deleteGroup"]); // create a group for delete operations
            // this is casuing problem with create also with premature creation when clicked on the address column
            this.getView().setModel(oModel);
 
            // Create a JSON model for dialog state (used for create/edit dialog)
            const oViewModel = new JSONModel({
                dialogTitle: "",       // Title of the dialog
                saveButtonText: "",    // Text for the save button
                isCreate: false        // Flag to indicate create vs edit mode
            });
            this.getView().setModel(oViewModel, "viewModel");
 
        },
 
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
            this.byId("searchField").setValue("");
            const oBinding = oTable.getBinding("items");
 
            // Clear filters
            oBinding.filter([], "Application");
 
            // Force backend reload
            this.getView().getModel().refresh(true);
 
            // Clear Selections
            oTable.removeSelections();
        },
 
        onEmpSelect: function (oEvent) {
            //oItem is just a instance like a structure of the table item
            const oItem = oEvent.getParameter("listItem");
            // oCtx is the context of the item, it contains the data of the item, it is like a pointer to the data of the item, to liknk this instance and data we use the Binding context.
            const oCtx = oItem.getBindingContext();
              // whatever empid we have selected will be store in sEmpId
              // Whatever empid was stored in the variable sEmpId will be passed to the route as a parameter,index.html to index.html#/Employees/101
            const sEmpId = oCtx.getProperty("Empid");
 
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteView2", {
                // Whatever empid was stored in the variable sEmpId will be passed to the route as a parameter,index.html to index.html#/Employees/101
                Empid: sEmpId
            });
        },
 
        // Handle table row selection changes
        onSelectionChange(oEvent) {
            const oTable = this.byId("table1");
            const aSelectedItems = oTable.getSelectedItems();
            const bHasSelection = aSelectedItems.length > 0;
            const bSingleSelection = aSelectedItems.length === 1;
           
            // Enable edit button only if one row is selected
            this.byId("editButton").setEnabled(bSingleSelection);
            // Enable delete button if at least one row is selected
            this.byId("deleteButton").setEnabled(bHasSelection);
        },
 
        // Handle create button press → open dialog in create mode
        async onCreatePress() {
            this._openDialog(true, null);
        },
 
        // Handle edit button press → open dialog in edit mode
        async onEditPress() {
            const oTable = this.byId("table1");
            const aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Select a row to edit");
                return;
            }
           
            const oSelectedItem = aSelectedItems[0];
            const oBindingContext = oSelectedItem.getBindingContext();
            this._openDialog(false, oBindingContext);
        },
 
        // Handle delete button press → confirm deletion
        onDeletePress() {
            const oTable = this.byId("table1");
            const aSelectedItems = oTable.getSelectedItems();
           
            if (aSelectedItems.length === 0) {
                MessageToast.show("Select row(s) to delete");
                return;
            }
           
            const iCount = aSelectedItems.length;
            const sMessage = iCount === 1 ?
                `Are you sure you want to delete the selected Employee?` :
                `Are you sure you want to delete ${iCount} selected Employees?`;
           
            // Show confirmation dialog before deletion
            MessageBox.confirm(sMessage, {
                title: "Confirm Deletion",
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        this._deleteEmployee(aSelectedItems);
                    }
                }
            });
        },
 
        // Open dialog for create or edit
        async _openDialog(bIsCreate, oBindingContext) {
            const oViewModel = this.getView().getModel("viewModel");
           
            // Set dialog properties based on mode
            oViewModel.setProperty("/isCreate", bIsCreate);
            oViewModel.setProperty("/dialogTitle", bIsCreate ? "Create Employee" : "Edit Employee");
            oViewModel.setProperty("/saveButtonText", bIsCreate ? "Create" : "Update");
           
            // Load fragment if not already loaded
            if (!this._oDialog) {
                this._oDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "empmgmt.view.fragments.CreateEditDialog",
                    controller: this
                });
                this.getView().addDependent(this._oDialog);
            }
           
            if (bIsCreate) {
                // Create new entry in OData model for binding
                const oModel = this.getView().getModel();
                const oNewEntry = oModel.createEntry("/EmployeeSet", {
                    properties: {
                        Empid: "",
                        Fname: "",
                        Lname: "",
                        Title: "",
                        City: "",
                        Dob: "",
                        Address: "",
                        Notes: "",  
                    }
                });
                this._oDialog.setBindingContext(oNewEntry);
            } else {
                // Bind dialog to existing entry for editing
                this._oDialog.setBindingContext(oBindingContext);
            }
           
            // Open the dialog
            this._oDialog.open();
        },
 
        // Save employee (create or update)
        onSavePress() {
            const oModel = this.getView().getModel();
            const oViewModel = this.getView().getModel("viewModel");
            const bIsCreate = oViewModel.getProperty("/isCreate");
           
            // Submit changes to backend
            oModel.submitChanges({
                success: () => {
                    const sMessage = bIsCreate ? "Employee data created successfully" : "Employee data updated successfully";
                    MessageToast.show(sMessage);
                    this._oDialog.close();
                    this._refreshTable(); // Refresh table after save
                },
                error: (oError) => {
                    const sMessage = bIsCreate ? "Failed to create Employee" : "Failed to update Employee";
                    MessageToast.show(sMessage);
                    console.error("Save Error:", oError);
                }
            });
        },
 
        // Cancel and close dialog
        onCancelPress() {
            const oModel = this.getView().getModel();
           
            // Reset unsaved changes if any
            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }
           
            this._oDialog.close();
        },
 
        // Delete selected employees
        // _deleteEmployee(aSelectedItems) {
        //     const oModel = this.getView().getModel();
        //     let iDeletedCount = 0;
        //     const iTotalCount = aSelectedItems.length;
           
        //     // Loop through selected items and remove them
        //     aSelectedItems.forEach((oItem) => {
        //         const oBindingContext = oItem.getBindingContext();
        //         oModel.remove(oBindingContext.getPath(), 
                
        //         {
        //             success: () => {
        //                 iDeletedCount++;
        //                 // Show success message after all deletions
        //                 if (iDeletedCount === iTotalCount) {
        //                     const sMessage = iTotalCount === 1 ?
        //                         "Employee deleted successfully" :
        //                         `${iTotalCount} Employees deleted successfully`;
        //                     MessageToast.show(sMessage);
        //                     this._refreshTable();
        //                 }
        //             },
        //             error: (oError) => {
        //                 MessageToast.show("Failed to delete Employee");
        //                 console.error("Delete Error:", oError);
        //             }
        //         });
        //     });
        // },
 

_deleteEmployee(aSelectedItems) {
    const oModel = this.getView().getModel();

    // Mark each selected row for deletion, note: this 3 lines of code works but const variable ocontext is not used anywhere else, so we can remove it and directly use oItem.getBindingContext() in the remove method, this is just for better readability and understanding
    // aSelectedItems.forEach(oItem => {
    //     const oContext = oItem.getBindingContext();
    //     oModel.remove(oContext.getPath(), { groupId: "deleteGroup" });
    // });

    aSelectedItems.forEach((oItem) => {
                oModel.remove(oItem.getBindingContext().getPath(), {
                    groupId: "deleteGroup"
                });
            });
 

    // Submit all deletes together
    oModel.submitChanges({
        groupId: "deleteGroup",
        success: () => {
            const iCount = aSelectedItems.length;
            MessageToast.show(
                iCount === 1
                    ? "Employee deleted successfully"
                    : `${iCount} Employees deleted successfully`
            );
            this._refreshTable();
        },
        error: (oError) => {
            MessageBox.error("Failed to delete selected Employees");
            console.error("Batch Delete Error:", oError);
        }
    });
},



        // Refresh table binding and reset selection state
        _refreshTable() {
            const oTable = this.byId("table1");
           
            // Clear selection and disable buttons
            oTable.removeSelections();
            this.byId("editButton").setEnabled(false);
            this.byId("deleteButton").setEnabled(false);
           
            // Refresh table binding to reload data
            oTable.getBinding("items").refresh();
        }
    });
});