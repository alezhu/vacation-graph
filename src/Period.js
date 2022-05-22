/**
 * @field {MyDate} start
 * @field {MyDate} end
 */
class Period {
  /**
   * @param {Object|Period} [params]
   * @param {MyDate|object|Date|string|number} [params].start
   * @param {MyDate|object|Date|string|number} [params].end
   */
  constructor(params) {
    const self = this;
    if (params) this.assign(params);
  }

  /**
   * @param {Object|Period} value
   * @param {MyDate|object|Date|string|number} value.start
   * @param {MyDate|object|Date|string|number} value.end
   */
  assign(value) {
    if (value instanceof Period) {
      Object.assign(this,value);
    } else if ('start' in value && 'end' in value) {
      this.start = MyDate.convert(value.start);
      this.end = MyDate.convert(value.end);
      if (this.start > this.end) {
        [this.start, this.end] = [this.end, this.start];
      }
    }
  }

  /**
   * @yields MyDate
   */
  *[Symbol.iterator]() {
    for (let date of Utils.DateRange(this.start.toDate(), this.end.toDate())) {
      yield new MyDate(date);
    }
  }
  /**
   * @return {number}
   */
  length() {
    return end - start + 1;
  }
}

