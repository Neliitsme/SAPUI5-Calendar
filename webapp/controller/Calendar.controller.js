sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/library',
    'sap/ui/unified/library',
    'sap/ui/unified/DateTypeRange',
    'sap/ui/unified/CalendarLegendItem',
    'sap/ui/model/json/JSONModel',
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
    JSONModel,
  ) {
    'use strict';
    var CalendarType = coreLibrary.CalendarType;
    var CalendarDayType = unifiedLibrary.CalendarDayType;
    var oVacationDateRange = null;
    var jVacationDateRange = null;
    var oSpecialDates = null;

    return Controller.extend('sapui5calendar.controller.Calendar', {
      oFormatYyyymmdd: null,
      onInit: function () {
        this.oFormatYyyymmdd = DateFormat.getInstance({
          pattern: 'yyyy-MM-dd',
          calendarType: CalendarType.Gregorian,
        });
        this._showSpecialDates();

        oVacationDateRange = {
          vacationDateRange: {
            startDate: null,
            endDate: null,
            totalDays: 0,
            totalWorkDays: 0,
            totalDaysNoHolidays: 0,
          },
        };
        jVacationDateRange = new JSONModel(oVacationDateRange);
        this.getOwnerComponent().setModel(jVacationDateRange);
      },

      handleCalendarSelect: function (oEvent) {
        var oCalendar = oEvent.getSource();
        this._updateText(oCalendar.getSelectedDates()[0]);
        this._updateDateRangeModel(oCalendar.getSelectedDates()[0]);
      },

      _updateDateRangeModel: function (oSelectedDates) {
        var dStartDate = oSelectedDates.getStartDate();
        var dEndDate = oSelectedDates.getEndDate();
        if (!dEndDate) {
          oVacationDateRange.vacationDateRange.startDate = null;
          oVacationDateRange.vacationDateRange.endDate = null;
          oVacationDateRange.vacationDateRange.totalDays = null;
          oVacationDateRange.vacationDateRange.totalWorkDays = null;
          oVacationDateRange.vacationDateRange.totalDaysNoHolidays = null;
          jVacationDateRange.refresh();
          return;
        }

        var iTotalDays = Math.ceil(
          (dEndDate - dStartDate) / (1000 * 60 * 60 * 24) + 1,
        );
        oVacationDateRange.vacationDateRange.startDate =
          this.oFormatYyyymmdd.format(dStartDate);
        oVacationDateRange.vacationDateRange.endDate =
          this.oFormatYyyymmdd.format(dEndDate);
        oVacationDateRange.vacationDateRange.totalDays = iTotalDays;

        var aDates = [];
        var dCurrentDate = new Date(dStartDate);
        while (dCurrentDate <= dEndDate) {
          aDates.push(new Date(dCurrentDate));
          dCurrentDate.setDate(dCurrentDate.getDate() + 1);
        }

        var iTotalWorkDays = iTotalDays;
        var iTotalDaysNoHolidays = iTotalDays;
        for (const dDate of aDates) {
          var bIsHoliday = false;
          var bIsWeekendWorkDay = false;
          for (const oSpecialDate of oSpecialDates) {
            if (oSpecialDate.getStartDate().getTime() === dDate.getTime()) {
              if (
                oSpecialDate.getSecondaryType() === CalendarDayType.NonWorking
              ) {
                bIsHoliday = true;
                break;
              } else if (
                oSpecialDate.getType() === CalendarDayType.Type03 ||
                (oSpecialDate.getType() === CalendarDayType.Type02 &&
                  dDate.getDay() % 6 === 0)
              ) {
                // Type03 is guaranteed to be weekend work day
                // Type02 could be assigned to any day, so you have to check if it is weekend
                bIsWeekendWorkDay = true;
                break;
              }
            }
          }

          if (bIsHoliday) {
            iTotalDaysNoHolidays--;
          }
          if (bIsHoliday || (dDate.getDay() % 6 === 0 && !bIsWeekendWorkDay)) {
            iTotalWorkDays--;
          }
        }
        oVacationDateRange.vacationDateRange.totalWorkDays = iTotalWorkDays;
        oVacationDateRange.vacationDateRange.totalDaysNoHolidays =
          iTotalDaysNoHolidays;
        jVacationDateRange.refresh();
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
        this._updateDateRangeModel(oDateRange);
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

        oSpecialDates = oCalendar.getSpecialDates();

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
