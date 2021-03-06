sap.ui.define(
  [
    'sap/ui/core/UIComponent',
    'sap/ui/Device',
    'sapui5calendar/model/models',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/xml/XMLModel',
  ],
  function (UIComponent, Device, models) {
    'use strict';

    return UIComponent.extend('sapui5calendar.Component', {
      metadata: {
        interfaces: ['sap.ui.core.IAsyncContentCreation'],
        manifest: 'json',
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        // set the device model
        this.setModel(models.createDeviceModel(), 'device');
      },
    });
  },
);
