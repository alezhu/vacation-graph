class PeriodTest extends TestCase {
  test_creating() {
    const period = new Period({ start: 1, end: 0 });
    assertEqual(period.start, 0);
    assertEqual(period.end, 1);
  }

  test_iterator() {
    const period = new Period({ start: '20211231', end: '20220109' });
    const result = Array.from(period);
    assertEqual(result.length,10);
  }
}

function test_Period_( ) {
  new TestCase(this).run(PeriodTest);
}
