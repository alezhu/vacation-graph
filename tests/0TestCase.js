class TestCase {
    constructor(globalCtx) {
        this._global = globalCtx;
    }

    /**
     * @param {TestCase[]} testCases
     */
    run(...testCases) {
        if (!testCases.length) return;
        try {
            this._init();
            for (const testCase of testCases) {
                const _case = new testCase();
                const tests = _case.get_tests_();
                if (tests && tests.length) {
                    _case.setUpAll()
                    for (const test of tests) {
                        this._initTest(testCase.name, test);
                        try {
                            _case.setUp(test);
                            _case[test]();
                            _case.tearDown(test);
                        } catch (error) {
                            // const stack = e.stack;
                            this._runContext.results.push({
                                valid: false,
                                message: error.message,
                                error,
                            })
                        }
                        this._finishTest();
                    }
                    _case.tearDownAll();
                }
            }
        } finally {
            this._release();
        }
    }

    _initTest(className, testName) {
        this._runContext = {
            className,
            testName,
            results: []
        }
    }

    _finishTest() {
        const invalid = this._runContext.results.filter(value => !value.valid);
        const prefix = `Test ${this._runContext.className}.${this._runContext.testName} :`
        if (invalid.length) {
            const errors = [];
            for (const result of invalid) {
                const failPlace = result.error.stack.split(' at ').find(value => value.includes('.test'));
                errors.push(`${result.message} at ${failPlace}`);
            }
            const errorsStr = errors.join("\t\n");
            console.error(`${prefix} Failed`, "\n", errorsStr);
        } else {
            console.log(`${prefix} Passed`);
        }
    }

    _init() {
        const items = Object.getOwnPropertyNames(this).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
        const asserts = items.filter(item => typeof this[item] === 'function' && item.startsWith('assert'));
        for (const assert of asserts) {
            this._global[assert] = this[assert].bind(this);
        }
    }

    _release() {
        const items = Object.getOwnPropertyNames(this);
        const asserts = items.filter(item => typeof this[item] === 'function' && item.startsWith('assert'));
        for (const assert of asserts) {
            delete this._global[assert];
        }

    }

    _assert(condition, message) {
        try {
            if (!condition) throw Error(message);
            this._runContext.results.push({
                valid: true
            })
        } catch (error) {
            // const stack = e.stack;
            this._runContext.results.push({
                valid: false,
                message,
                error,
            })
        }
    }

    assertTrue(condition, message = 'Condition is not true') {
        this._assert(!!condition, message);
    }

    assertFalse(condition, message = 'Condition is true') {
        this._assert(!condition, message);
    }

    assertEqual(actual, expected, message = `"${actual}" is not equal to "${expected}"`) {
        this._assert(actual === expected || actual.valueOf() === expected.valueOf(), message);
    }

    assertNotEqual(actual, expected, message = `"${actual}" is equal to "${expected}"`) {
        this._assert(actual !== expected && actual.valueOf() === expected.valueOf(), message);
    }

    assertThrow(callback, message = 'Must throw exception') {
        try {
            callback();
            this._assert(false, message);
        } catch {

        }

    }

    assertNotThrow(callback, message = 'Must not throw exception') {
        try {
            callback();
        } catch {
            this._assert(false, message);
        }
    }

    get_tests_() {
        const items = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        const result = items.filter(item => typeof this[item] === 'function' && item.startsWith('test'));
        return result;
    }

    /**
     * @param {string} testName
     */
    setUp(testName) {}
    setUpAll() {}
        /**
         * @param {string} testName
         */
    tearDown(testName) {}
    tearDownAll() {}



}