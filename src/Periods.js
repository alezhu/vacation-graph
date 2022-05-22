/**
 * @property {Period[]} periods
 */
class Periods {
    /**
     * @param {Periods|Period[]|Object[]} [params]
     * @param {MyDate|Date|string|number|object} params.start
     * @param {MyDate|Date|string|number|object} params.end
     */
    constructor(params) {
        this.periods = [];
        if (params) this.assign(params);
    }

    /**
     * @param {Periods|Period[]|Object[]} value
     */
    assign(value) {
        if (value instanceof Periods) {
            this.periods = value.periods;
        } else if (Array.isArray(value)) {
            this.periods = value;
            for (let i = 0; i < this.periods.length; ++i) {
                const period = this.periods[i];
                if (!(period instanceof Period)) {
                    this.periods[i] = new Period(period);
                }
            }
        }
    }

    /**
     * @param {...Period} periods
     * @return {Periods}
     */
    add(...periods) {
        this.periods.push(...periods)
        return this;
    }

    /**
     * @return {Periods}
     */
    sort() {
        this.periods = Periods.sort(this.periods);
        return this;
    }

    /**
     * @return {Periods}
     */
    optimizePeriods() {
        this.periods = Periods.optimizePeriods(this.periods);
        return this;
    }

    /**
     * @param {Period[]} periods
     * @return {Period[]}
     */
    static sort(periods) {
        const result = periods.sort((a, b) => {
            const result = a.start.valueOf() - b.start.valueOf();
            return result;
        });
        return result;
    }

    /**
     * @param {Period[]} periods
     * @return {Period[]}
     */
    static optimizePeriods(periods) {
        const sorted = Periods.sort(periods);
        const result = [];
        for (let i = 0; i < sorted.length; ++i) {
            let period = sorted[i];
            let j = i + 1;
            while (j < sorted.length) {
                const other = sorted[j];
                const start1 = period.start.valueOf();
                const end1 = period.end.valueOf();
                const start2 = other.start.valueOf() - 1;
                const end2 = other.end.valueOf();
                if (
                    start1 <= end2 &&
                    end1 >= start2
                ) {
                    //Intersection
                    if (period === sorted[i]) {
                        period = new Period(period);
                    }
                    if (start1 > start2) {
                        period.start = other.start;
                    }
                    if (end1 < end2) {
                        period.end = other.end;
                    }
                    sorted.splice(j, 1);
                } else {
                    break;
                }
            }
            result.push(period);
        }
        return result;
    }

    /**
     * @param {Period} one
     * @param {Period} two
     * @return {Period[]}
     */
    static unionPair(one, two) {
        if (Periods.equal(one, two)) {
            return [one]
        } else if (!Periods.isIntersect(one, two)) {
            return Periods.optimizePeriods([one, two]);
        } else {
            const start1 = one.start.valueOf();
            const end1 = one.end.valueOf();
            const start2 = two.start.valueOf();
            const end2 = two.end.valueOf();
            const start = (start1 < start2) ? one.start : two.start;
            const end = (end1 > end2) ? one.end : two.end;
            return [new Period({ start, end })];
        }
    }

    /**
     * @param {Period|Period[]|Periods} one
     * @param {Period|Period[]|Periods} two
     * @return {Period[]}
     */
    static union(one, two) {
        if (one instanceof Periods) {
            one = one.periods;
        } else if (one instanceof Period) {
            one = [one];
        }
        if (two instanceof Periods) {
            two = two.periods
        } else if (two instanceof Period) {
            two = [two]
        };
        if (one.length === 1 && two.length === 1) {
            return Periods.unionPair(one[0], two[0]);
        } else {
            if (!one.length) {
                return two
            } else if (!two.length) {
                return one;
            } else {
                return Periods.optimizePeriods([...one, ...two]);
            }
        }
    }

    /**
     * @param {Periods|Period[]} other
     * @return {Periods}
     */
    union(others) {
        this.periods = Periods.union(this, other);
        return this;
    }


    /**
     * @param {Period} one
     * @param {Period} two
     * @return {boolean}
     */

    static isIntersect(one, two) {
        return (one.start.valueOf() <= two.end.valueOf() && one.end.valueOf() >= two.start.valueOf());
    }

    /**
     * @param {Period} one
     * @param {Period} two
     * @return {boolean}
     */

    static equal(one, two) {
        return one === two || ((one.start === two.start || one.start.valueOf() === two.start.valueOf()) &&
            (one.end === two.end || one.end.valueOf() === two.end.valueOf()));
    }

    /**
     * @yields {Period}
     */
    *
    [Symbol.iterator]() {
        for (const period of this.periods) {
            yield period;
        }
    }

    /**
     * @param {Period} one
     * @param {Period} two
     * @return {Period[]}
     */
    static subtractPair(one, two) {
        if (Periods.equal(one, two)) {
            //При вычитании совпадающих периодов - получаем пустое множество
            return [];
        } else if (!Periods.isIntersect(one, two)) {
            //Если периоды не пересекаются - получаем исходный период
            return [one];
        } else {
            const start1 = one.start.valueOf();
            const end1 = one.end.valueOf();
            const start2 = two.start.valueOf();
            const end2 = two.end.valueOf();
            const result = [];
            if (start1 < start2) {
                /*
                ...[     1       
                ........[ 2   
                ==================
                ...[ a ]..........
                */
                const period1 = new Period({ start: one.start, end: new MyDate(two.start - 1) });
                result.push(period1);
            }

            if (end1 > end2) {
                /*
                        1 ] ......       
                 2   ]............  
                ==================
                ......[ b ].......
                */
                const period2 = new Period({ start: new MyDate(two.end + 1), end: one.end });
                result.push(period2);
            }
            return result;
        }
    }

    /**
     * @param {Periods|Period[]|Period} periods
     * @param {Periods|Period[]|Period} subs
     * @return {Period[]}
     */
    static subtract(periods, subs) {
            const diff = Periods.getDiff(periods, subs)
                .filter(value => value.mode === '-')
                .map(value => value.period);
            return Periods.optimizePeriods(diff);
        }
        /**
         * @param {Periods|Period[]} subs
         * @return {Period[]}
         */
    subtract(subs) {
        this.periods = Periods.subtract(this.periods, subs);
        return this;
    }

    /**
     * @param {Period[]|Periods} periods1
     * @param {Period[]|Periods} periods2
     * @return {PeriodChange[]} 
     */
    static getChanges(periods1, periods2) {
        // const result = [];
        // const union = Periods.union(periods1, periods2);
        // const free = Periods.subtract(union, periods2);
        // const busy = Periods.subtract(union, periods1);

        // result.push(...free.map(period => new PeriodChange(true, period)));
        // result.push(...busy.map(period => new PeriodChange(false, period)));
        const diff = Periods.getDiff(periods1, periods2);
        const result = diff
            .filter(value => value.mode !== '')
            .map(value => new PeriodChange(value.mode === '-', value.period));
        return result;
    }

    /**
     * @param {Period[]|Periods} periods
     * @return {PeriodChange[]} 
     */
    getChanges(periods) {
        return Periods.getChanges(this, periods);
    }

    /**
     * @typedef {object} DiffResult
     * @property {string} DiffResult.mode
     * @property {Period} DiffResult.period
     */


    /**
     * @param {Period[]|Periods} periods
     * @param {Period[]|Periods} newPeriods
     * @return {DiffResult[]}
     * @
     */
    static getDiff(periods, newPeriods) {
        if (periods instanceof Periods) {
            periods = periods.periods;
        } else if (periods instanceof Period) {
            periods = [periods]
        }
        if (newPeriods instanceof Periods) {
            newPeriods = newPeriods.periods;
        } else if (newPeriods instanceof Period) {
            newPeriods = [newPeriods]
        }
        if (!periods.length) {
            return newPeriods.map(value => {
                return {
                    mode: '+',
                    period: value
                }
            });
        }
        if (!newPeriods.length) {
            return periods.map(value => {
                return {
                    mode: '-',
                    period: value
                }
            });
        }
        let work = [];
        for (const period of periods) {
            work.push({ value: period.start, include: true, start: true });
            work.push({ value: period.end, include: true, start: false });
        }

        for (const period of newPeriods) {
            work.push({ value: period.start, include: false, start: true });
            work.push({ value: period.end, include: false, start: false });
        }
        work = work.sort((a, b) => a.value - b.value);
        const result = [];
        let include = false;
        let exclude = false;
        let start = null;

        for (const item of work) {
            if (item.include) {
                if (item.start) {
                    if (exclude) {
                        if (!start.equal(item.value)) {
                            const diff = {
                                mode: '+',
                                period: new Period({ start, end: new MyDate(item.value - 1) })
                            }
                            result.push(diff);
                            start = item.value;
                        } else {
                            //skip
                        }
                    } else {
                        start = item.value;
                    }
                } else {
                    //include ends
                    if (exclude) {
                        if (!start.equal(item.value)) {
                            const diff = {
                                mode: '',
                                period: new Period({ start, end: item.value })
                            }
                            result.push(diff);
                            start = new MyDate(item.value + 1);
                        } else {
                            //skip
                        }
                    } else {
                        if (!start.equal(item.value)) {
                            const diff = {
                                mode: '-',
                                period: new Period({ start, end: item.value })
                            }
                            result.push(diff);
                        }
                        start = null;
                    }
                }
                include = item.start;
            } else {
                //item exclude
                if (item.start) {
                    if (include) {
                        if (!start.equal(item.value)) {
                            const diff = {
                                mode: '-',
                                period: new Period({ start, end: new MyDate(item.value - 1) })
                            }
                            result.push(diff);
                        }
                    } else {
                        start = item.value;
                    }
                } else {
                    //exclude ends
                    if (include) {
                        if (!start.equal(item.value)) {
                            const diff = {
                                mode: '',
                                period: new Period({ start, end: item.value })
                            }
                            result.push(diff);
                            start = new MyDate(item.value + 1);
                        } else {
                            //skip
                        }
                    } else {
                        const diff = {
                            mode: '+',
                            period: new Period({ start, end: item.value })
                        }
                        result.push(diff);
                        start = null;
                    }
                }

                exclude = item.start;
            }
        }
        return result;
    }
}