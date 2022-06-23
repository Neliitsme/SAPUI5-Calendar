sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/m/Table',
    'sap/m/ColumnListItem',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Sorter',
    'sap/m/MessageBox',
  ],
  function (Controller, Table, ColumnListItem, JSONModel, Sorter, MessageBox) {
    'use strict';

    var _oVacationTable = null;
    var bIsLongVacationUsed = false;
    var _oVacationsModel = null;
    var jVacationsModel = null;
    var _oVacationDayInfoModel = null;
    var jVacationDaysInfo = null;
    var oResourceBundle = null;

    return Controller.extend('sapui5calendar.controller.VacationTable', {
      /**
       * @override
       */
      onInit: function () {
        _oVacationTable = this.byId('VacationTable');
        var oVacationDaysInfo = this.byId('vacationDaysInfo');
        _oVacationsModel = {
          vacations: [],
        };
        jVacationsModel = new JSONModel(_oVacationsModel);
        _oVacationTable.setModel(jVacationsModel);

        _oVacationDayInfoModel = {
          currentVacationDays: 0,
          maxVacationDays: 28,
        };
        jVacationDaysInfo = new JSONModel(_oVacationDayInfoModel);
        oVacationDaysInfo.setModel(jVacationDaysInfo);
        oResourceBundle = this.getOwnerComponent()
          .getModel('i18n')
          .getResourceBundle();
      },

      _refreshLongVacationState: function () {
        bIsLongVacationUsed = _oVacationsModel.vacations.some(
          (el) => el.totalDaysNoHolidays >= 14,
        );
      },

      handleAddVacation: function () {
        if (_oVacationsModel.vacations.length === 4) {
          MessageBox.alert(
            oResourceBundle.getText('vacationExceedsNumLimitAlert'),
          );
          return;
        }

        var oVacationDateRange = {
          ...this.getView().getModel().getProperty('/vacationDateRange'),
        };

        if (oVacationDateRange.endDate === null) {
          MessageBox.alert(oResourceBundle.getText('vacationNoEndDateAlert'));
          return;
        }

        if (
          oVacationDateRange.totalDaysNoHolidays < 14 &&
          _oVacationsModel.vacations.length === 3 &&
          !bIsLongVacationUsed
        ) {
          MessageBox.alert(oResourceBundle.getText('vacationNoLongAlert'));
          return;
        }

        if (
          _oVacationDayInfoModel.currentVacationDays +
            oVacationDateRange.totalDaysNoHolidays >
          _oVacationDayInfoModel.maxVacationDays
        ) {
          MessageBox.alert(
            oResourceBundle.getText('vacationExceedsDaysLimitAlert'),
          );
          return;
        }

        if (_oVacationsModel.vacations.length) {
          var bIsOverlapping = _oVacationsModel.vacations.some(
            (el) =>
              new Date(oVacationDateRange.startDate).getTime() <=
                new Date(el.endDate).getTime() &&
              new Date(oVacationDateRange.endDate).getTime() >=
                new Date(el.startDate).getTime(),
          );
          if (bIsOverlapping) {
            MessageBox.alert(
              oResourceBundle.getText('vacationOverlapAlert'),
            );
            return;
          }
        }

        _oVacationDayInfoModel.currentVacationDays +=
          oVacationDateRange.totalDaysNoHolidays;
        _oVacationsModel.vacations.push(oVacationDateRange);
        this._refreshLongVacationState();
        jVacationsModel.refresh();
        jVacationDaysInfo.refresh();
        this._sortByStartDate();
      },

      handleDeleteVacation: function (oArg) {
        var oHolidayRow = oArg.getSource().getBindingContext().getObject();
        for (let i = 0; i < _oVacationsModel.vacations.length; i++) {
          if (_oVacationsModel.vacations[i] == oHolidayRow) {
            var deletedRow = _oVacationsModel.vacations.splice(i, 1);
            _oVacationDayInfoModel.currentVacationDays -=
              deletedRow[0].totalDaysNoHolidays;
            jVacationsModel.refresh();
            jVacationDaysInfo.refresh();
            this._refreshLongVacationState();
            break;
          }
        }
      },
      _sortByStartDate: function () {
        var oBinding = _oVacationTable.getBinding('items');
        var oSorters = [];
        var sPath = 'startDate';
        var bDescending = false;
        oSorters.push(new Sorter(sPath, bDescending));
        oBinding.sort(oSorters);
      },
    });
  },
);
