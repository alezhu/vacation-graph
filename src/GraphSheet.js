class GraphSheet {
  /**
   * 
   * @param {object} [params]
   * @param {number} [params.year]
   * @param {SpreadsheetApp.Sheet} [params.sheet]
   * @param {SpreadsheetApp} [params.workbook]
   */
  constructor(params) {
    this._year = params && params.year ? { value: params.year } : null;
    this._sheet = params && params.sheet || null;
    this._workbook = params && params.workbook || null;

    this._dataRange = null;
    this._lastRow = 0;
    this._fioRange = null;
    this._FIO = null;
    this._backgrounds = null;
  }

  get workbook() {
    return this._workbook || (this._workbook = SpreadsheetApp.getActiveSpreadsheet());
  }

  get sheet() {
    return this._sheet || (this._sheet = this.workbook.getSheetByName(Settings.graphPrefix + this._year.value))
  }
  get year() {
    if (!this._year) {
      const sheetName = this.sheet.getName();
      const year = parseInt(sheetName.replace(Settings.graphPrefix, ''));
      this._year = { value: year };
    }
    return this._year.value;
  }

  get dataRange() {
    if (!this._dataRange) {
      this._dataRange = this.sheet.getDataRange();
    }
    return this._dataRange;
  }

  get lastRow() {
    if (!this._lastRow) {
      this._lastRow = this.dataRange.getLastRow();
    }
    return this._lastRow;
  }

  get fioRange() {
    if (!this._fioRange) {
      if (this.lastRow <= Settings.graphStartUsersRow) return null;
      this._fioRange = this.sheet.getRange(Settings.graphStartUsersRow, Settings.graphFIOPos.col, this.lastRow - Settings.graphStartUsersRow + 1, 1);
    }
    return this._fioRange;
  }

  get FIO() {
    if (!this._FIO) {
      this._FIO = (this.fioRange && this.fioRange.getValues().map(row => row[0])) || [];
    }
    return this._FIO
  }

  get backgrounds() {
    if (!this._backgrounds) {
      this._backgrounds = this.dataRange.getBackgrounds()
    }
    return this._backgrounds;
  }

  /**
   * @returns {GraphData}
   */
  getGraphData() {
    const result = new GraphData({ year: this.year, usersData: [] });
    const lastRow = this.lastRow;
    if (lastRow <= Settings.graphStartUsersRow) return result;
    const fios = this.FIO;
    const backgrounds = this.backgrounds;
    const sheetName = this.sheet.getName();
    const year = this.year;
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31));
    for (let row = Settings.graphStartUsersRow - 1, index = 0; row < lastRow; ++row, ++index) {
      const fio = fios[index];
      const fioBackgrounds = backgrounds[row];
      const dateRange = Utils.DateRange(startDate, endDate);
      let periodStartDate = null;
      let periodEndDate = null;
      const periods = [];
      for (let col = Settings.graphStartCalendarCol - 1; col < fioBackgrounds.length; ++col) {
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
        Logger.log(`GraphSheet.getGraphData. Found periods on sheet "${sheetName}" for user ${fio}: ${periods.length}`);
        const userData = new UserData({ fio, periods });
        result.merge(userData);
      }
    }
    return result;
  }

  deleteSheet() {
    Logger.log(`GraphSheet. Delete sheet "${grSheet.sheet.getName()}"`);
    this.workbook.deleteSheet(this.sheet);
  }

  /**
   * 
   * @param {GraphChanges} changes 
   */
  applyChanges(changes) {
    try {
      if (!this.sheet) {
        this._buildSheet();
      } else {
        // this.sheet.hideSheet();
      }
      const changesMap = changes.usersChanges.reduce((map, value) => { map.set(value.fio, value); return map }, new Map());
      const backgrounds = this.backgrounds;
      let row = Settings.graphStartUsersRow;
      const rows2Delete = [];
      let hasUpdates = false;
      for (const fio of this.FIO) {
        const fioChanges = changesMap.get(fio);
        if (fioChanges) {
          changesMap.delete(fio);
          if (fioChanges.fullDelete) {
            rows2Delete.unshift(row);
          } else if (fioChanges.periodChanges.length) {
            const backgroundsUser = backgrounds[row - 1];
            if (this._applyPeriodChanges2Background(fioChanges.periodChanges, backgroundsUser)) {
              hasUpdates = true;
              backgrounds[row - 1] = backgroundsUser;
            }
          }
        } else {
          rows2Delete.unshift(row);
        }
        row++;
      }
      if (hasUpdates) {
        this.dataRange.setBackgrounds(backgrounds);
      }
      const newUsers = [];
      const newUsersBackgrounds = [];
      const lastCol = this.sheet.getLastColumn();

      for (let newUser of changesMap.values()) {
        newUsers.push([newUser.fio]);
        const backgroundsUser = Array(lastCol);
        backgroundsUser.fill(Settings.graphFreeColor);
        this._applyPeriodChanges2Background(newUser.periodChanges, backgroundsUser);
        newUsersBackgrounds.push(backgroundsUser);
      }
      if (newUsers.length) {
        const newFioRange = this.sheet.getRange(this.lastRow + 1, Settings.graphFIOPos.col, newUsers.length, 1);
        newFioRange.setValues(newUsers);
        this.sheet.autoResizeColumn(Settings.graphFIOPos.col);
      }

      if (newUsersBackgrounds.length) {
        const newUserBgRange = this.sheet.getRange(this.lastRow + 1, 1, newUsers.length, lastCol);
        newUserBgRange.setBackgrounds(newUsersBackgrounds);
      }

      for (let row in rows2Delete) {
        this.sheet.deleteRow(row);
      }
      this._FIO = null;
      this._backgrounds = null;
      this._dataRange = null;
      this._lastRow = null;
      this._fioRange = null;

      this._sortByUsers();

    } finally {
      this.sheet.showSheet();
    }
  }

  _sortByUsers() {
    const endRow = this.lastRow;
    const startRow = Settings.graphStartUsersRow;
    const range = this.sheet.getRange(`${startRow}:${endRow}`);
    range.sort({ column: Settings.graphFIOPos.col, ascending: true });
  }

  _applyPeriodChanges2Background(periodChanges, backgroudns) {
    let updated = false;
    for (const periodChange of periodChanges) {
      const startIndex = Utils.getYearDay(periodChange.period.start) + Settings.graphStartCalendarCol - 1;
      const endIndex = Utils.getYearDay(periodChange.period.end) + Settings.graphStartCalendarCol - 1;
      const color = (periodChange.free) ? Settings.graphFreeColor : Settings.graphVacationColor;
      for (let index = startIndex; index <= endIndex; ++index) {
        if (backgroudns[index] !== color) {
          backgroudns[index] = color;
          updated = true;
        }
      }
    }
    return updated;
  }

  _buildSheet() {
    const sheetName = Settings.graphPrefix + this.year;
    Logger.log(`GraphSheet. Createsheet "${sheetName}"`);
    const sheet = this._sheet = this.workbook.insertSheet(sheetName);

    sheet.hideSheet();
    // this._workbook.getSheetByName(Settings.dataSheet).activate();
    const maxColumns = this._sheet.getMaxColumns();
    const colsToAdd = 366 + (Settings.graphStartCalendarCol - 1) - maxColumns;
    if (colsToAdd > 0) {
      sheet.insertColumns(maxColumns, colsToAdd);
    }

    const rowHeight = sheet.getRowHeight(Settings.graphStartUsersRow);
    let col = Settings.graphStartCalendarCol;
    for (let month = 0; month < 12; ++month) {
      const monthColStart = col;
      const start = new Date(this.year, month, 1);
      const monthName = start.toLocaleString('ru-RU', { month: 'long' });
      const end = new Date(this.year, month + 1, 0);
      const days = [];
      while (start <= end) {
        const day = start.getDate();
        days.push(day);

        sheet.setColumnWidth(col, rowHeight);

        start.setDate(day + 1);
        col++;
      }
      const daysCount = col - monthColStart;
      const monthRange = sheet.getRange(Settings.graphStartCalendarCol, monthColStart, 1, daysCount);
      monthRange.setValues([days]);
      const monthNameRange = sheet.getRange(Settings.graphMonthNamesRow, monthColStart, 1, daysCount);
      monthNameRange.merge();
      monthNameRange.setValue(monthName);
    }

    sheet.getRange(Settings.graphFIOPos.row, Settings.graphFIOPos.col).setValue('ФИО');
    sheet.setFrozenColumns(Settings.graphFrosenCols);
    sheet.setFrozenRows(Settings.graphStartUsersRow - 1);


  }
}