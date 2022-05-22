class UtilsTest extends TestCase {
    test_dateRange() {
        /**
         * @type {Date}
         */
        const start = new Date();
        const end = new Date(start);
        end.setDate(start.getDate() + 10);
        const result = Array.from(Utils.DateRange(start, end));
        assertEqual(result.length, 11);
        assertEqual(result[0], start);
        assertEqual(result[10], end);
    }

    test_getYearDay() {
        let value = new MyDate('20220101');
        let result = Utils.getYearDay(value);
        assertEqual(result, 0)
    }

}

function test_Utils_() {
    new TestCase(this).run(UtilsTest);
}