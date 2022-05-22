/**
 * @field {number} year
 * @field {UsersData} usersData
 */
class GraphData {
  /**
   * @param {object} [params]
   * @param {number} params.year
   * @param {UserData[]|UsersData|Map<string,UserData>} params.usersData
   */
  constructor(params) {
    this.year = 0;
    this.usersData = new UsersData();
    if (params) this.assign(params);
  }

  /**
   * @param {object|GraphData} value
   * @param {number} value.year
   * @param {UserData[]|UsersData|Map<string,UserData>} value.usersData
   */
  assign(value) {
    if (value instanceof GraphData) {
      Object.assign(this, value)
    } else if ('year' in value && 'usersData' in value) {
      this.year = value.year;
      this.usersData.assign(value.usersData);
    }
  }

  /**
   * @param {UserData[]|UsersData|Map<string,UserData>} usersData
   */

  merge(...usersData) {
    this.usersData.merge(...usersData);
  }

  optimizePeriods() {
    this.usersData.optimizePeriods();
  }

  /**
   * @@yields {UserData}
   */
  *[Symbol.iterator]() {
    for (let item of this.usersData) {
      yield item;
    }
  }

  /**
   * @param {GraphData} other
   * @return {GraphUserChanges[]}
   */
  getChanges(other) {
    const result = [];
    for (const userData of this.usersData) {
      const update = other.usersData.map.get(userData.fio);
      if (update) {
        const item = new GraphUserChanges({fio: userData.fio,periodChanges: userData.getChanges(update)});
        result.push(item);
      } else {
        //Build full delete for user
        const item = new GraphUserChanges({fio: userData.fio,fullDelete: true});
        result.push(item);
      }

    }

    for(const userData of other) {
      if(!this.usersData.map.has(userData.fio)) {
        //Build new year
        // const item = new GraphUserChanges({fio: userData.fio,periodChanges: userData.getChanges(update)});
        // result.push(item);
      }
    }    

    return result;
  }
}