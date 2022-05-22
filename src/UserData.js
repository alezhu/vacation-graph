/**
 * @property {string} fio
 * @property {Periods} periods
 */
class UserData {
    /**
     * @param {Object|UserData} [params]
     * @param {string} params.fio
     * @param {Period[]|Object[]|Periods} params.periods
     */
    constructor(params) {
        this.fio = "";
        this.periods = new Periods();
        if (params) this.assign(params);
    }

    /**
     * @param {Object|UserData} value
     * @param {string} value.fio
     * @param {Period[]|Object[]|Periods} value.periods
     */
    assign(value) {
        if (value instanceof UserData) {
            Object.assign(this, value);
        } else if ("fio" in value && "periods" in value) {
            this.fio = value.fio;
            this.periods.assign(value.periods);
        }
    }

    /**
     * @param {Period[]} periods
     */
    addPeriods(...periods) {
        this.periods.add(...periods);
    }

    optimizePeriods() {
        this.periods.optimizePeriods();
    }

    buildGraphsData() {
        const result = new GraphsData();
        const sorted = this.periods.sort().periods;
        for (const period of sorted) {
            for (let year = period.start.year; year <= period.end.year; ++year) {
                const start =
                    year == period.start.year ?
                    period.start.year :
                    new MyDate(new Date(Date.UTC(year, 0, 1)));
                const end =
                    year === period.end.year ?
                    periond.end :
                    new MyDate(new Date(Date.UTC(year, 11, 31)));
                result.merge({
                    year,
                    usersData: [{
                        fio: this.fio,
                        periods: [{ start, end }],
                    }, ],
                });
            }
        }
        return result;
    }

    /**
     * @param {UserData} other
     * @return {PeriodChange[]}
     */
    getChanges(other) {
        const result = this.periods.getChanges(other.periods);
        return result;
    }
}