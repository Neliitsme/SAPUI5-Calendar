sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/Table',
    'sap/m/ColumnListItem',
    'sap/ui/model/json/JSONModel',
  ],
  function (Controller, Table, ColumnListItem, JSONModel) {
    'use strict';

    var bIsLongVacationUsed = false;
    var _oVacationTable = null;
    var _oVacationsModel = null;
    var jVacationsModel = null;
    var iMaxVacationDays = 28;

    return Controller.extend('sapui5calendar.controller.VacationTable', {
      /**
       * @override
       */
      onInit: function () {
        _oVacationTable = this.byId('VacationTable');
        _oVacationsModel = {
          vacations: [],
        };
        jVacationsModel = new JSONModel(_oVacationsModel);
        _oVacationTable.setModel(jVacationsModel);
      },

      _refreshLongVacationState: function () {
        bIsLongVacationUsed = _oVacationsModel.vacations.some(
          (el) => el.totalDaysNoHolidays >= 14,
        );
      },

      //TODO: add a proper dialog window or a snackbar
      //TODO: check overlapping vacations
      handleAddVacation: function () {
        if (_oVacationsModel.vacations.length === 4) {
          alert('Total amount of vacations cannot exceed 4');
          return;
        }

        var oVacationDateRange = {
          ...this.getView().getModel().getProperty('/vacationDateRange'),
        };

        if (oVacationDateRange.endDate === null) {
          alert('Please select an end date');
          return;
        }

        if (
          oVacationDateRange.totalDaysNoHolidays < 14 &&
          _oVacationsModel.vacations.length === 3 &&
          !bIsLongVacationUsed
        ) {
          alert(
            'You must have at least one vacation that is 14 days or longer',
          );
          return;
        }
        // TODO: Add check for iMaxVacationHolidays
        _oVacationsModel.vacations.push(oVacationDateRange);
        this._refreshLongVacationState();
        jVacationsModel.refresh();
      },

      handleDeleteVacation: function (oArg) {
        var oHolidayRow = oArg.getSource().getBindingContext().getObject();
        for (let i = 0; i < _oVacationsModel.vacations.length; i++) {
          if (_oVacationsModel.vacations[i] == oHolidayRow) {
            _oVacationsModel.vacations.splice(i, 1);
            jVacationsModel.refresh();
            this._refreshLongVacationState();
            break;
          }
        }
      },
    });
  },
);
