class GraphChanges {
  /**
   * @param {object} params
   * @param {number} params.year
   * @param {boolean} [fullDelete]
   * @param {GraphUserChanges[]} [params.usersChanges]
   */
  constructor({ year, fullDelete, usersChanges }) {
    this.year = year;
    this.fullDelete = !!fullDelete;
    this.usersChanges = usersChanges;
  }
}