sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/unified/DateRange',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/library',
    'sap/ui/unified/library',
    'sap/ui/unified/DateTypeRange',
    'sap/ui/unified/CalendarLegendItem',
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    DateRange,
    DateFormat,
    coreLibrary,
    unifiedLibrary,
    DateTypeRange,
    CalendarLegendItem,
  ) {
    'use strict';
    var CalendarType = coreLibrary.CalendarType;
    var CalendarDayType = unifiedLibrary.CalendarDayType;

    return Controller.extend('sapui5calendar.controller.Calendar', {
      oFormatYyyymmdd: null,
      onInit: function () {
        this.oFormatYyyymmdd = DateFormat.getInstance({
          pattern: 'yyyy-MM-dd',
          calendarType: CalendarType.Gregorian,
        });
        this._showSpecialDates();
      },

      handleCalendarSelect: function (oEvent) {
        var oCalendar = oEvent.getSource();
        this._updateText(oCalendar.getSelectedDates()[0]);
      },

      _updateText: function (oSelectedDates) {
        var oSelectedDateFrom = this.byId('selectedDateFrom'),
          oSelectedDateTo = this.byId('selectedDateTo'),
          oDate;

        if (oSelectedDates) {
          oDate = oSelectedDates.getStartDate();
          if (oDate) {
            oSelectedDateFrom.setText(this.oFormatYyyymmdd.format(oDate));
          } else {
            oSelectedDateTo.setText('No Date Selected');
          }
          oDate = oSelectedDates.getEndDate();
          if (oDate) {
            oSelectedDateTo.setText(this.oFormatYyyymmdd.format(oDate));
          } else {
            oSelectedDateTo.setText('No Date Selected');
          }
        } else {
          oSelectedDateFrom.setText('No Date Selected');
          oSelectedDateTo.setText('No Date Selected');
        }
      },

      handleSelectThisWeek: function () {
        this._selectWeekInterval(6);
      },

      handleSelectWorkWeek: function () {
        this._selectWeekInterval(4);
      },

      handleWeekNumberSelect: function (oEvent) {
        var oDateRange = oEvent.getParameter('weekDays'),
          iWeekNumber = oEvent.getParameter('weekNumber');

        // if (iWeekNumber % 5 === 0) {
        //   oEvent.preventDefault();
        //   MessageToast.show(
        //     'You are not allowed to select this calendar week!',
        //   );
        //   return;
        // }
        this._updateText(oDateRange);
      },

      _selectWeekInterval: function (iDays) {
        var oCurrent = new Date(), // get current date
          iWeekStart = oCurrent.getDate() - oCurrent.getDay() + 1,
          iWeekEnd = iWeekStart + iDays, // end day is the first day + 6
          oMonday = new Date(oCurrent.setDate(iWeekStart)),
          oSunday = new Date(oCurrent.setDate(iWeekEnd)),
          oCalendar = this.byId('calendar');

        oCalendar.removeAllSelectedDates();
        oCalendar.addSelectedDate(
          new DateRange({ startDate: oMonday, endDate: oSunday }),
        );

        this._updateText(oCalendar.getSelectedDates()[0]);
      },

      _showSpecialDates: function () {
        // 1 - Non-working, 2 - Shortened (Any day), 3 - Working day (Weekends)
        var _getHolidayType = (sT) => {
          switch (sT) {
            case '1':
              return CalendarDayType.Type01;
            case '2':
              return CalendarDayType.Type02;
            case '3':
              return CalendarDayType.Type03;
            default:
              console.log('Unknown Holiday Type');
              return CalendarDayType.None;
          }
        };

        var _getSecondaryHolidayType = (sT) => {
          switch (sT) {
            case '1':
              return CalendarDayType.NonWorking;
            default:
              return CalendarDayType.None;
          }
        };

        var oCalendar = this.byId('calendar');
        var oLegend = this.byId('calendarLegend');

        var oCalendarSpecialDates = this.getOwnerComponent()
          .getModel('calendarSpecialDates')
          .getData();
        var sYear = oCalendarSpecialDates
          .querySelector('calendar')
          .getAttribute('year');
        var oHolidays = oCalendarSpecialDates.querySelectorAll('holiday');
        var oDays = oCalendarSpecialDates.querySelectorAll('day');

        for (const element of oDays) {
          var dHoliday = new Date(element.getAttribute('d'));
          dHoliday.setFullYear(sYear);
          var sHolidayType = element.getAttribute('t');

          oCalendar.addSpecialDate(
            new DateTypeRange({
              startDate: dHoliday,
              type: _getHolidayType(sHolidayType),
              secondaryType: _getSecondaryHolidayType(sHolidayType),
            }),
          );
        }

        oLegend.addItem(
          new CalendarLegendItem({
            text: 'Holiday',
            type: CalendarDayType.Type01,
          }),
        );
        oLegend.addItem(
          new CalendarLegendItem({
            text: 'Shortened Work Day',
            type: CalendarDayType.Type02,
          }),
        );
        oLegend.addItem(
          new CalendarLegendItem({
            text: 'Weekend Work Day',
            type: CalendarDayType.Type03,
          }),
        );
      },
    });
  },
);
