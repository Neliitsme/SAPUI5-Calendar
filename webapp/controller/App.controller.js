sap.ui.define(
  ['sap/ui/core/mvc/Controller', 'sap/m/Switch', 'sap/ui/core/library'],
  function (Controller, Switch) {
    'use strict';

    return Controller.extend('sapui5calendar.controller.App', {
      onInit: function () {
        var bSwitchState = localStorage.getItem('themeSwitchState') === 'true';
        var oSwitch = this.byId('themeSwitch');
        oSwitch.setState(bSwitchState);
        this._handleThemeChange(bSwitchState);
      },
      handleThemeSwitch: function (oEvent) {
        var oSwitch = oEvent.getSource();
        var bSwitchState = oSwitch.getState();
        this._handleThemeChange(bSwitchState);
        localStorage.setItem('themeSwitchState', bSwitchState);
      },

      // true === dark, false === light
      _handleThemeChange: function (bSwitchState) {
        var oCore = sap.ui.getCore();
        if (bSwitchState) {
          oCore.applyTheme('sap_fiori_3_dark');
        } else {
          oCore.applyTheme('sap_fiori_3');
        }
      },
    });
  },
);
