/**
 * @property {Map<number,GraphData>} map
 */
class GraphsData {
    /**
     * @param {Map<number,GraphData>|GraphData[]|GraphsData} [params]
     */
    constructor(params) {
        this.map = new Map();
        if (params) this.assign(params);
    }

    /**
     * @param {Map<number,GraphData>|GraphData[]|GraphsData} value
     */
    assign(value) {
        if (value instanceof GraphsData) {
            this.map = value.map
        } else if (value instanceof Map) {
            this.map = value
        } else if (Array.isArray(value)) {
            this.map.clear()
            for (const item of value) {
                this.map.set(item.year, item);
            }
        }
    }

    /**
     * @param {number} year 
     * @returns {GraphData}
     */
    get(year) {
        return this.map.get(year);
    }

    /**
     * @param {Map<number,GraphData>|GraphData[]|GraphsData} values
     */
    merge(...values) {
        if (values) {
            for (const value of values) {
                if (value instanceof GraphsData) {
                    this.merge(...Array.from(value))
                } else if (value instanceof Map) {
                    this.merge(...Array.from(value.values()))
                } else {
                    /**
                     * @type {GraphData}
                     */
                    let exists = this.map.get(value.year);
                    if (!exists) {
                        exists = new GraphData(value);
                        this.map.set(value.year, exists);
                    } else {
                        exists.merge(...value.usersData);
                    }
                }
            }
        }
    }

    optimizePeriods() {
        for (const item of this.map.values()) {
            item.optimizePeriods();
        }
    }

    /**
     * @return {GraphData[]}
     */
    toJSON() {
        const result = Array.from(this.map.values());
        return result;
    }

    /**
     * @@yields {GraphData}
     */
    *[Symbol.iterator]() {
        for (let item of this.map.values()) {
            yield item;
        }
    }
    /**
     * @param {GraphsData} other
     * @return {GraphChanges[]}
     */
    getChanges(other) {
        const result = [];
        for (const yearData of this) {
            let update = other.get(yearData.year);
            if (update) {
                //Update year
                const item = new GraphChanges({
                    year: yearData.year,
                    usersChanges: yearData.getChanges(update)
                });
                result.push(item);
            } else {
                //Build delete all changes for year
                const item = new GraphChanges({
                    year: yearData.year,
                    fullDelete: true
                });
                result.push(item);
            }
        }

        for (const yearData of other) {
            if (!this.map.has(yearData.year)) {
                //Build new year
                const item = new GraphChanges({
                    year: yearData.year,
                    usersChanges: new GraphData().getChanges(yearData)
                });
                result.push(item);
            }
        }

        return result;
    }
}