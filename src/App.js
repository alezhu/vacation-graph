/**
 * @field {SpreadsheetApp} _workbook
 */
class App {

  /**
   * @param {SpreadsheetApp} workbook
   * @return App
   */
  static getApp4Spreadsheet(workbook) {
    const getAppMap = App._getAppMap || (App._getAppMap = (() => {
      let id = Symbol();
      App[id] = new Map();
      return function () {
        return App[id];
      }
    })())

    const id = workbook.getId();
    /** 
    * @type {Map<string,App>} appMap 
    */
    const appMap = getAppMap();
    let app = appMap.get(id);
    if (!app) {
      app = new App(workbook)
      appMap.set(id, app);
    }
    return app;
  }

  /**
   * @param {SpreadsheetApp} workbook
   */
  constructor(workbook) {
    this._id = workbook.getId();
    Logger.log("Create app: " + this._id);
    /** @type {Spreadsheet} */
    this._workbook = workbook;
    this._appData = new AppData();//.loadFromCache();
  }

  /**
   * @param {Event}
   */
  static onOpen(event) {
    Logger.log("App.onOpen");
    const workbook = (event && event.source) || SpreadsheetApp.getActiveSpreadsheet();
    const app = App.getApp4Spreadsheet(workbook);
    app.processOpen();
  }

  processOpen() {
    Logger.log("App.processOpen");
    this._rebuildData();
    this._appData.saveToCache();
  }

  _rebuildData() {
    Logger.log("App._rebuildData");
    this._appData = new AppData();
    const sheets = this._workbook.getSheets();
    /**
     * @type {SpreadsheetApp.Sheet} sheet
     */
    for (const sheet of sheets) {
      const name = sheet.getName();
      if (name.startsWith(Settings.graphPrefix)) {
        this._processGraphSheet(sheet);
      } else {
        this._processDataSheet(sheet);
      }
    }

    this._appData.optimizeUsersDataPeriods();
    this._appData.optimizeGraphsDataPeriods();

    this._updateGraphsData();
  }



  /**
  * @param {SpreadsheetApp.Sheet} sheet
  */
  _processDataSheet(sheet) {
    const data = sheet.getDataRange().getValues();
    const context = {
      fioColumnIndex: 0,
      sheet
    }
    for (const row of data) {
      this._processDataRow(context, row);
    }
  }

  /**
  * @param {object} ctx
  * @param {number} ctx.fioColumnIndex
  * @param {SpreadsheetApp.Sheet} ctx.sheet
  * @param {object[]} row
  */
  _processDataRow(ctx, row) {
    let start = null;
    let startIndex = 0;
    const fioRe = /[А-Я][а-я\-]*\s+[А-Я]\.\s*([А-Я]\.?)?/;
    const periods = [];
    for (let i = 0; i < row.length; ++i) {
      const value = row[i];
      if (!value) continue;
      if (!ctx.fioColumnIndex) {
        if (typeof value === 'string') {
          if (value.includes('ФИО')) {
            ctx.fioColumnIndex = i;
            return;
          }
          if (fioRe.test(value)) {
            ctx.fioColumnIndex = i;
          }
        }
      } else if (i == ctx.fioColumnIndex) {
        if (!fioRe.test(value)) {
          return;
        }
      } else {
        if (value instanceof Date) {
          if (!start) {
            startIndex = i;
            start = new MyDate(value);
            continue;
          };
          if (startIndex === i - 1) {
            const end = new MyDate(value);
            const period = new Period({ start, end });
            periods.push(period);
          }
          start = null;
          startIndex = 0;
        }
      }
    }

    if (ctx.fioColumnIndex && periods.length) {
      const fio = row[ctx.fioColumnIndex];
      Logger.log(`App._processDataRow. Found periods on sheet "${ctx.sheet.getName()}" for user ${fio}: ${periods.length}`);

      this._appData.usersData.merge({ fio, periods });
    }
  }

  /**
   * @param {SpreadsheetApp.Sheet} sheet
   */
  _processGraphSheet(sheet) {
    /**
     * @type {SpreadsheetApp.Range}
     */
    const dataRange = sheet.getDataRange();
    const lastRow = dataRange.getLastRow();
    if(lastRow <= Settings.graphStartUsersRow) return;
    const fioRange = sheet.getRange(Settings.graphStartUsersRow, Settings.graphFIOPos.col, lastRow - Settings.graphStartUsersRow + 1, 1);
    /**
     * @type {string[]}
     */
    const fios = fioRange.getValues().map(row => row[0]);
    const backgrounds = dataRange.getBackgrounds();
    const sheetName = sheet.getName();
    const year = parseInt(sheetName.replace(Settings.graphPrefix, ''));
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31));
    const usersData = [];
    for (let row = Settings.graphStartUsersRow-1, index = 0; row < lastRow; ++row, ++index) {
      const fio = fios[index];
      const fioBackgrounds = backgrounds[row];
      const dateRange = Utils.DateRange(startDate, endDate);
      let periodStartDate = null;
      let periodEndDate = null;
      const periods = [];
      for (let col = Settings.graphStartCalendarCol-1; col < fioBackgrounds.length; ++col) {
        const date = dateRange.next().value;
        const color = fioBackgrounds[col];
        if (color === Settings.graphVacationColor) {
          if (!periodStartDate) {
            periodStartDate = date;
          }
          periodEndDate = date;
        }
        if (color === Settings.graphFreeColor) {
          if (periodStartDate) {
            const period = new Period({ start: periodStartDate, end: periodEndDate });
            periods.push(period);
            periodStartDate = null;
          }
        }
      }
      if (periodStartDate) {
        const period = new Period({ start: periodStartDate, end: periodEndDate });
        periods.push(period);
        periodStartDate = null;
      }
      if (periods.length) {
        Logger.log(`App._processGraphSheet. Found periods on sheet "${sheetName}" for user ${fio}: ${periods.length}`);
        const userData = new UserData({ fio, periods });
        usersData.push(userData);
      }
    }
    if (usersData.length) {
      Logger.log(`App._processGraphSheet. Found users on sheet "${sheetName}" for year ${year}: ${usersData.length}`);
      this._appData.graphsData.merge({ year, usersData })
    }
  }

  _updateGraphsData() {
    
  }

}