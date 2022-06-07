sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/m/MessageToast', 'sap/ui/core/Fragment'],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageToast, Fragment) {
    'use strict';

    return Controller.extend('sapui5calendar.controller.Calendar', {
      onInit: function () {},

      onOpenDialog: function () {
        // Create dialog lazily
        if (!this.pDialog) {
          this.pDialog = this.loadFragment({
            name: 'sapui5calendar.view.HelloDialog',
          });
        }
        this.pDialog.then((oDialog) => {
          oDialog.open();
        });
      },

      onCloseDialog: function () {
        this.byId('helloDialog').close();
      },

      onShowWorld: function () {
        var oBundle = this.getView().getModel('i18n').getResourceBundle();
        var sRecipient = this.getView()
          .getModel()
          .getProperty('/recipient/name');
        var sMsg = oBundle.getText('helloMsg', [sRecipient]);

        MessageToast.show(sMsg);
      },
    });
  },
);
