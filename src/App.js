/**
 * @property {SpreadsheetApp} _workbook
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
    /** @type {SpreadsheetApp} */
    this._workbook = workbook;
    this._appData = new AppData(); //.loadFromCache();
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
      sheet,
      fioRE: /[А-Я][а-я\-]*\s+[А-Я]\.\s*([А-Я]\.?)?/
    }
    for (const row of data) {
      this._processDataRow(context, row);
    }
  }

  /**
   * @param {object} ctx
   * @param {number} ctx.fioColumnIndex
   * @param {SpreadsheetApp.Sheet} ctx.sheet
   * @param {RegExp} ctx.fioRE
   * @param {object[]} row
   */
  _processDataRow(ctx, row) {
    let start = null;
    let startIndex = 0;
    const fioRe = ctx.fioRE;
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
    const grSheet = new GraphSheet({ sheet, workbook: this._workbook });
    const grData = grSheet.getGraphData();
    if (grData.usersData.length) {
      Logger.log(`App._processGraphSheet. Found users on sheet "${sheet.getName()}" for year ${grData.year}: ${grData.usersData.length}`);
      this._appData.graphsData.merge(grData);
    }
  }

  _updateGraphsData() {
    const newGraphsData = this._appData.usersData.getGraphsData();
    const changes = this._appData.graphsData.getChanges(newGraphsData);
    if (!changes.length) {
      Logger.log('No differences between table data and graph data');
      return;
    };
    this._applyGraphChanges(changes);
    this._appData.graphsData = newGraphsData;
  }

  /**
   * 
   * @param {GraphChanges[]} changes 
   */
  _applyGraphChanges(changes) {
    for (const yearChanges of changes) {
      const grSheet = new GraphSheet({
        year: yearChanges.year,
        workbook: this._workbook
      });
      if (yearChanges.fullDelete) {
        grSheet.deleteSheet();
      } else {
        grSheet.applyChanges(yearChanges);
      }
    }
  }


}