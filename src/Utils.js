class Utils {
  /**
   * @param {Date} start
   * @param {Date} end
   * @@yields {Date}
   */
  static *DateRange(start, end) {
    let index = start;
    while (index < end) {
      yield index;
      index = new Date(index);
      index.setDate(index.getDate() + 1);
    }
    if (start != end) {
      yield end;
    }
  }

  /**
   * @param value
   * @return {boolean}
   */
  static isIterable(value) {
    return Symbol.iterator in Object(value);
  }

  /**
   * @param {MyDate|Date|string|number} date
   * @return {number}
   */
  static getYearDay(date){
    const value = MyDate.convert(date);
    const year = value.year;
    const firstDay = new MyDate(new Date(Date.UTC(year,0,1)));
    const result = value - firstDay;
    return result;
  }
}