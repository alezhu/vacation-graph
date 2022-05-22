class MyDateTest extends TestCase {
  test_it_should_init_with_zeros() {
    let value = new MyDate();
    assertTrue(value.year == 0 && value.month == 0 && value.day == 0, 'Invalid initial');
  }

  test_it_whould_throw_exception_if_construct_from_boolean() {
    assertThrow(() => { new MyDate(true); }, 'Boolean value is not valid  parameter for contruct MyDate');
  }

  test_it_should_construct_from_Date() {
    let value = new MyDate();
    const now = new Date();
    value = new MyDate(now);
    assertTrue(value.year == now.getUTCFullYear() && value.month == now.getUTCMonth() + 1 && value.day == now.getUTCDate(), 'Error construct MyDate from Date');
    const date_utc = Date.UTC(2022, 0, 13);
    const date = new Date(date_utc);
    value = new MyDate(date);
    assertTrue(value.year == 2022 && value.month == 1 && value.day == 13, 'Error construct MyDate from Date')
  } 

  test_toString() {
    const date_utc = Date.UTC(2022, 0, 13);
    const date = new Date(date_utc);
    const value = new MyDate(date);
    assertEqual(value.toString(), '20220113');
  }

  test_valueOf() {
    const value = new MyDate('20220113');
    const intvalue = +value;

    assertEqual(value.valueOf(), intvalue);
  }

  test_conversion_to_number() {
    let value = new MyDate('20220113');

    const intvalue = value.valueOf();
    assertEqual(+value, intvalue);
  }

  test_compare() {
    const date_utc = Date.UTC(2022, 0, 13);
    const date = new Date(date_utc);
    const value = new MyDate(date);
    const intvalue = value.valueOf();

    assertTrue(value == intvalue);
    assertTrue(value == value);

    let compare_result = value.compare(date);
    assertEqual(compare_result, 0);
    compare_result = value.compare('20220113');
    assertEqual(compare_result, 0);
    compare_result = value.compare('01.13.2022');
    assertEqual(compare_result, 0);
    compare_result = value.compare('13-01-2022');
    assertEqual(compare_result, 0);
    compare_result = value.compare('2022/01/13');
    assertEqual(compare_result, 0);

    const value2 = new MyDate('20220114');
    assertTrue(value < value2);
    assertTrue(value2 > value);
  }

  test_equal() {
    const date_utc = Date.UTC(2022, 0, 13);
    const date = new Date(date_utc);
    const value = new MyDate(date);
    const intvalue = value.valueOf();

    assertTrue(value.equal(intvalue));
    assertTrue(value.equal(value));
    assertTrue(value.equal(date));
    assertTrue(value.equal('20220113'));
    assertTrue(value.equal('01.13.2022'));
    assertTrue(value.equal('13-01-2022'));
    assertTrue(value.equal('2022/01/13'));
  }
  test_json_convert() {
    const value = new MyDate('20220113');
    const json = JSON.stringify(value);
    assertEqual(json, '{"year":2022,"month":1,"day":13}');
  }

  test_date_diff() {
    const value1 = new MyDate('00211231');
    const value2 = new MyDate('00220101');
    const diff = value2 - value1;
    assertEqual(diff,1);
  }
}
