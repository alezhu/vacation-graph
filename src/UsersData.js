/**
 * @field {Map<string,UserData>} map
 */
class UsersData {
  /**
   * @param {Map<string,UserData>|UserData[]} [params]
   */
  constructor(params) {
    this.map = new Map();
    if (params) this.assign(params);
  }

  /**
   * @param {Map<string,UserData>|UserData[]|UsersData} value
   */
  assign(value) {
    if (value instanceof UsersData) {
      this.map = value.map;
    } else if (value instanceof Map) {
      this.map = value;
    } else if (Array.isArray(value)) {
      this.map.clear();
      for (const item of value) {
        this.map.set(item.fio, item);
      }
    }
  }

  /**
   * @param {Map<string,UserData>|UserData[]|UsersData} values
   */
  merge(...values) {
    if (values) {
      for (const value of values) {
        if (value instanceof UsersData) {
          this.merge(...Array.from(value))
        } else if (value instanceof Map) {
          this.merge(...Array.from(value.values()))
        } else {
          let exists = this.map.get(value.fio);
          if (!exists) {
            exists = new UserData(value);
            this.map.set(value.fio, exists);
          } else {
            exists.addPeriods(value.periods);
          }
        }
      }
    }
  }

  optimizePeriods() {
    for (const userData of this.map.values()) {
      userData.optimizePeriods();
    }
  }

  /**
   * @return {UserData[]}
   */
  toJSON() {
    const result = Array.from(this.map.values());
    return result;
  }

  /**
   * @yields {UserData}
   */
  *[Symbol.iterator]() {
    for (let item of this.map.values()) {
      yield item;
    }
  }

  getGraphsData() {
    const result = new GraphsData();
    for (const data of this) {
      const result4User = data.buildGraphsData();
      result.merge(result4User);
    }
    return result;
  }

}