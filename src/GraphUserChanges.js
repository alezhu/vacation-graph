class GraphUserChanges {
    /**
     * @param {object} params
     * @param {string} params.fio
     * @param {PeriodChange[]} [params.periodChanges]
     * @param {boolean} [params.fullDelete]
     */
    constructor({ fio, periodChanges, fullDelete }) {
        this.fio = fio;
        this.periodChanges = periodChanges;
        this.fullDelete = !!fullDelete;
    }
}