sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
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

      handleWeekNumberSelect: function (oEvent) {
        var oDateRange = oEvent.getParameter('weekDays');
        this._updateText(oDateRange);
      },

      _showSpecialDates: function () {
        // 1 - Non-working, 2 - Shortened (Any day), 3 - Working day (Weekends)
        var configureHoliday = (oSpecialDate, sHolidayType) => {
          switch (sHolidayType) {
            case '1':
              oSpecialDate.setType(CalendarDayType.Type01);
              oSpecialDate.setSecondaryType(CalendarDayType.NonWorking);
              oSpecialDate.setColor('#FF0000');
              break;
            case '2':
              oSpecialDate.setType(CalendarDayType.Type02);
              oSpecialDate.setColor('#FF8000');
              break;
            case '3':
              oSpecialDate.setType(CalendarDayType.Type03);
              oSpecialDate.setColor('#FFBF00');
              break;
            default:
              console.log('Unknown Holiday Type');
              break;
          }
          return oSpecialDate;
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

        for (const oDayElement of oDays) {
          var dHoliday = new Date(oDayElement.getAttribute('d'));
          dHoliday.setFullYear(sYear);
          var sHolidayType = oDayElement.getAttribute('t');
          var sHolidayId = oDayElement.getAttribute('h');
          var sHolidayTitle = null;
          if (sHolidayId) {
            sHolidayTitle =
              oHolidays[parseInt(sHolidayId) - 1].getAttribute('title');
          }
          var oSpecialDate = new DateTypeRange({
            startDate: dHoliday,
            tooltip: sHolidayTitle,
          });

          oCalendar.addSpecialDate(
            configureHoliday(oSpecialDate, sHolidayType),
          );
        }

        oLegend.addItem(
          new CalendarLegendItem({
            text: 'Holiday',
            type: CalendarDayType.Type01,
            color: '#FF0000',
          }),
        );
        oLegend.addItem(
          new CalendarLegendItem({
            text: 'Shortened Work Day',
            type: CalendarDayType.Type02,
            color: '#FF8000',
          }),
        );
        oLegend.addItem(
          new CalendarLegendItem({
            text: 'Weekend Work Day',
            type: CalendarDayType.Type03,
            color: '#FFBF00',
          }),
        );
      },
    });
  },
);
