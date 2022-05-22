/**
 * @field {UsersData} usersData
 * @field {GraphsData} graphsData
 */
class AppData {
  /**
   * @param {Object} [params]
   * @param {UsersData|UserData[]|Map<string,UserData>} params.usersData
   * @param {GraphsData|GraphData[]|Map<number,GraphData>} params.graphsData
   */

  constructor(params) {
    this.usersData = new UsersData();
    this.graphsData = new GraphsData();
    if (params) this.assign(params);
  }

  optimizeUsersDataPeriods() {
    this.usersData.optimizePeriods();
  }

  optimizeGraphsDataPeriods() {
    this.graphsData.optimizePeriods();
  }


  /**
  * @param {AppData|object} value
   * @param {UsersData|UserData[]|Map<string,UserData>} [value.usersData]
   * @param {GraphsData|GraphData[]|Map<number,GraphData>} [value.graphsData]
  */
  assign(value) {
    if(value instanceof AppData) {
      Object.assign(this,value)
    } else {
      if(value.usersData) {
        this.usersData.assign(value.usersData);
      }
      if(value.graphsData) {
        this.graphsData.assign(value.graphsData);
      }
    }
  }

  /**
   * @returns {AppData}
   */
  static loadFromCache() {
    // const cache = CacheService.getDocumentCache();
    const cache = PropertiesService.getDocumentProperties();
    const value = cache.getProperty(Settings.cacheKey);
    if (value) return AppData.deserialize(value);
    return new AppData();
  }

  saveToCache() {
    const cache = PropertiesService.getDocumentProperties();
    const json = this.serialize();
    cache.setProperty(Settings.cacheKey, json);
  }

  /**
   * @returns {string}
   */
  serialize() {
    const result = JSON.stringify(this);
    return result;
  }

  /**
   * @param {string} str
   * @returns {AppData}
   */
  static deserialize(str) {
    let data = {}
    try {
      data = JSON.parse(str);
    } catch {

    }
    const result = new AppData(data);
    return result;
  }
}

