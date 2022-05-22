/**
 * @field {number} year
 * @field {number} month
 * @field {number} day
 */
class MyDate {
  /**
   * @param {MyDate|Date|string|number|object} value
   */
  constructor(value) {
    this.year = 0;
    this.month = 0;
    this.day = 0;

    this._assign(value);
    delete this._value;
  }

  /**
  * @access private
  * @param {MyDate|Date|string|number|object} value
  */
  _assign(value) {
    let self = this;
    switch (typeof value) {
      case "string":
        this._assignString(value);
        break;
      case "number":
        this._assignNumber(value);
        break;
      case "object":
        if (value instanceof Date) {
          this._assignDate(value)
        } else {
          Object.assign(this, value);
        }
        break;
      case "undefined":
        break;
      default:
        throw Error(`"${value}" Invalid parameter for contruct MyDate`);
    }
  }


  /**
   * @param {MyDate|Date|string|number|object} value
   */
  static convert(value) {
    return (value instanceof MyDate) ? value : new MyDate(value);
  }

  /**
   * @param {MyDate|Date|string|number|object} other
   * @returns {number}
   */
  compare(other) {
    const value = (typeof other == "number") ? other : MyDate.convert(other);
    return Math.sign(+this - value);
  }

  /**
   * @param {MyDate|Date|string|number|object} other
   * @returns {boolean}
   */
  equal(other) {
    return (this === other) || this.compare(other) === 0;
  }

  [Symbol.toPrimitive](hint) {
    return hint == "string" ? this.toString() : this.valueOf();
  }

  /**
   * @returns {number}
   */
  valueOf() {
    const self = this;
    if(!this._value) {
      this._value = Date.UTC(this.year, this.month - 1, this.day) / (24 * 60 * 60 * 1000);
    }
    return this._value;
    // const sign = Math.sign(this.year);
    // const result = (Math.abs(this.year) << 9) | (this.month << 5) | this.day;
    // if(sign < 0) result *= sign;
    // return result;
  }

  /**
   * @return {Date}
   */
  toDate() {
    return new Date(Date.UTC(this.year, this.month - 1, this.day));
  }

  /**
   * @returns {string}
   */
  toString() {
    return ((Math.sign(this.year) < 0) ? "-" : "")
      + ("000" + Math.abs(this.year)).slice(-4) + ("0" + this.month).slice(-2) + ("0" + this.day).slice(-2);
  }


  /**
   * @param {number} value
   */
  _assignNumber(value) {
    const date = new Date(value * 24 * 60 * 60 * 1000);
    this.year = date.getUTCFullYear();
    this.month = date.getUTCMonth() + 1;
    this.day = date.getUTCDate();
    this._value = value;
  }

  /**
 * @param {Date} value
 */
  _assignDate(value) {
    this.year = value.getUTCFullYear();
    this.month = value.getUTCMonth() + 1;
    this.day = value.getUTCDate();
  }


  /**
   * @access private
   * @param {string} value 
   */
  _assignString(value) {
    const getPatterns = MyDate._getPatterns || (MyDate._getPatterns = (() => {
      const id = Symbol();
      MyDate[id] = [
        { //YYYYMMDD 
          regexp: /^(\d{4})[.\/\-]?(0?[1-9]|1[012])[.\/\-]?(0?[1-9]|[12][0-9]|3[01])$/,
          year_index: 1,
          month_index: 2,
          day_index: 3,
        },
        { //DDMMYYYY
          regexp: /^(0?[1-9]|[12][0-9]|3[01])[.\/\-](0?[1-9]|1[012])[.\/\-](\d{4})$/,
          year_index: 3,
          month_index: 2,
          day_index: 1,
        },
        { //MMDDYYYY 
          regexp: /^(0?[1-9]|1[012])[.\/\-](0?[1-9]|[12][0-9]|3[01])[.\/\-](\d{4})$/,
          year_index: 3,
          month_index: 1,
          day_index: 2,
        },
      ];
      return function () { return MyDate[id] }
    })());


    for (const pattern of getPatterns()) {
      let matcher = value.match(pattern.regexp);
      if (matcher) {
        this.year = parseInt(matcher[pattern.year_index]);
        this.month = parseInt(matcher[pattern.month_index]);
        this.day = parseInt(matcher[pattern.day_index]);
        return;
      }
    }

    const date = new Date(value);
    if (date) {
      this._assignDate(date);
      return;
    }

    throw Error(`Значение "${value}" не распознано как дата`)

  }
}
