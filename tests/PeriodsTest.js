class PeriodsTest extends TestCase {
  test_isIntersect() {
    /*
    ......[ 1 ]......
    [ 2 ]............
    */
    let result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220101'), end: new MyDate('20220131') }),
    )
    assertFalse(result);

    /*
    ......[ 1 ]......
    [  2  ]........
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220101'), end: new MyDate('20220501') }),
    )
    assertTrue(result);

    /*
    ......[ 1 ]......
    [  2    ]........
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220101'), end: new MyDate('20220510') }),
    )
    assertTrue(result);

    /*
    ......[ 1 ]......
    [  2      ]......
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220101'), end: new MyDate('20220531') }),
    )
    assertTrue(result);


    /*
    ......[ 1 ]......
    [  2        ]....
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220101'), end: new MyDate('20220610') }),
    )
    assertTrue(result);

    /*
    ......[ 1 ]......
    ......[ 2   ]....
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220610') }),
    )
    assertTrue(result);


    /*
    ......[ 1 ]......
    ........[ 2   ]..
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220510'), end: new MyDate('20220610') }),
    )
    assertTrue(result);

    /*
    ......[ 1 ]......
    ..........[ 2   ]
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220531'), end: new MyDate('20220610') }),
    )
    assertTrue(result);

    /*
    ......[ 1 ]......
    ...........[ 2 ].
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220601'), end: new MyDate('20220610') }),
    )
    assertFalse(result);

    /*
    ......[ 1 ]......
    ......[ 2 ]......
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
    )
    assertTrue(result);

    /*
    ....[   1   ]....
    ......[ 2 ]......
    */
    result = Periods.isIntersect(
      new Period({ start: new MyDate('20220401'), end: new MyDate('20220731') }),
      new Period({ start: new MyDate('20220501'), end: new MyDate('20220531') }),
    )
    assertTrue(result);
  }

  test_equal() {
    const start = new MyDate('20220501');
    const end = new MyDate('20220531');
    const one = new Period({ start, end });
    let result = Periods.equal(one, one);
    assertTrue(result);

    const start2 = start;
    const end2 = end;
    const two = new Period({ start: start2, end: end2 });
    result = Periods.equal(one, two);
    assertTrue(result);

    const start3 = new MyDate(start);
    const end3 = new MyDate(end);
    const three = new Period({ start: start3, end: end3 });
    result = Periods.equal(one, three);
    assertTrue(result);


    const start4 = new MyDate('20220510');
    const end4 = new MyDate('20220531');
    const four = new Period({ start: start4, end: end4 });
    result = Periods.equal(one, four);
    assertFalse(result);

  }

  test_union() {
    /*
    ......[ 1 ]......
    ......[ 2 ]......
    =================
    ......[   ]......
    */
    const start1 = new MyDate('20220501');
    const end1 = new MyDate('20220531');
    const period1 = new Period({ start: start1, end: end1 });
    let result = Periods.union(period1, period1);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, start1);
    assertEqual(result[0].end, end1);

    const start2 = start1;
    const end2 = end1;
    const period2 = new Period({ start: start2, end: end2 });
    result = Periods.union(period1, period2);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, start1);
    assertEqual(result[0].end, end1);

    const start3 = new MyDate(start1);
    const end3 = new MyDate(end1);
    const period3 = new Period({ start: start3, end: end3 });
    result = Periods.union(period1, period3);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, start1);
    assertEqual(result[0].end, end1);

    /*
   ......[ 1 ]......
   [ 4 ]............
   =================
   [ 4 ].[ 1 ]......
   */
    const period4 = new Period({ start: new MyDate('20220101'), end: new MyDate('20220131') });
    result = Periods.union(period1, period4);
    assertEqual(result.length, 2);
    assertEqual(result[0].start, period4.start);
    assertEqual(result[0].end, period4.end);
    assertEqual(result[1].start, period1.start);
    assertEqual(result[1].end, period1.end);


    /*
    ......[ 1 ]......
    [  5  ]..........
    =================
    [  5+1    ]......
    */
    const period5 = new Period({ start: new MyDate('20220101'), end: new MyDate('20220501') });
    result = Periods.union(period1, period5);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period5.start);
    assertEqual(result[0].end, period1.end);

    /*
    ......[ 1 ]......
    [ 51 ]...........
    =================
    [  51+1    ].....
    */
    const period51 = new Period({ start: new MyDate('20220101'), end: new MyDate('20220430') });
    result = Periods.union(period1, period51);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period51.start);
    assertEqual(result[0].end, period1.end);

    /*
    ......[ 1 ]......
    [  6    ]........
    =================
    [  6+1    ]......
    */
    const period6 = new Period({ start: new MyDate('20220101'), end: new MyDate('20220510') });
    result = Periods.union(period1, period6);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period6.start);
    assertEqual(result[0].end, period1.end);

    /*
    ......[ 1 ]......
    [  7      ]......
    =================
    [  7+1    ]......
    */
    const period7 = new Period({ start: new MyDate('20220101'), end: new MyDate('20220531') });
    result = Periods.union(period1, period7);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period7.start);
    assertEqual(result[0].end, period1.end);


    /*
    ......[ 1 ]......
    [  8        ]....
    =================
    [  8        ]....
    */
    const period8 = new Period({ start: new MyDate('20220101'), end: new MyDate('20220610') });
    result = Periods.union(period1, period8);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period8.start);
    assertEqual(result[0].end, period8.end);

    /*
    ......[ 1 ]......
    ......[ 9   ]....
    =================
    ......[  9  ]....
    */
    const period9 = new Period({ start: new MyDate('20220501'), end: new MyDate('20220610') });
    result = Periods.union(period1, period9);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period1.start);
    assertEqual(result[0].end, period9.end);


    /*
    ......[ 1 ]......
    ........[ 10   ].
    =================
    ......[  10    ].
    */
    const period10 = new Period({ start: new MyDate('20220510'), end: new MyDate('20220610') });
    result = Periods.union(period1, period10);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period1.start);
    assertEqual(result[0].end, period10.end);

    /*
    ......[ 1 ]......
    ..........[ 11  ]
    =================
    ......[  11     ]
    */
    const period11 = new Period({ start: new MyDate('20220531'), end: new MyDate('20220610') });
    result = Periods.union(period1, period11);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period1.start);
    assertEqual(result[0].end, period11.end);

    /*
    ......[ 1 ]......
    .......... [ 12 ]
    =================
    ......[  12     ]
    */
    const period12 = new Period({ start: new MyDate('20220601'), end: new MyDate('20220610') });
    result = Periods.union(period1, period12);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period1.start);
    assertEqual(result[0].end, period12.end);


    /*
    ......[ 1 ].......
    ............[ 13 ]
    ==================
    ......[ 1 ].[ 13 ]
    */
    const period13 = new Period({ start: new MyDate('20220610'), end: new MyDate('20220620') });
    result = Periods.union(period1, period13);
    assertEqual(result.length, 2);
    assertEqual(result[0].start, period1.start);
    assertEqual(result[0].end, period1.end);
    assertEqual(result[1].start, period13.start);
    assertEqual(result[1].end, period13.end);
  }

  test_optimize() {
    const value = new Periods([
      new Period({ start: '20220101', end: '20220110' }),
      new Period({ start: '20220102', end: '20220110' }),
      new Period({ start: '20220110', end: '20220110' }),
      new Period({ start: '20220101', end: '20220102' }),
      new Period({ start: '20220101', end: '20220110' }),
      new Period({ start: '20220210', end: '20220220' }),
      new Period({ start: '20220209', end: '20220219' }),
      new Period({ start: '20220211', end: '20220221' }),
      new Period({ start: '20220301', end: '20220310' }),
      new Period({ start: '20220301', end: '20220331' }),
      new Period({ start: '20220401', end: '20220410' }),
    ]);

    value.optimizePeriods();
    assertEqual(value.periods.length, 3);
  }

  test_subtract() {
    const period1 = new Period({ start: '20220201', end: '20220331' });
    const period2 = new Period({ start: '20220701', end: '20220930' });

    const periods = new Periods([
      period1,
      period2
    ]);

    const period3 = new Period({ start: '20220101', end: '20220227' });
    const period4 = new Period({ start: '20220501', end: '20220531' });
    const period5 = new Period({ start: '20220801', end: '20220831' });

    const subs = [
      period3,
      period4,
      period5,
    ];
    /*
    111222333444555666777888999
    ...[1111].........[2222222]
    [3333]......[4]......[5]...
    ===========================
    ......[1].........[2]...[2]
    */

    let result = Periods.subtract(period1, period1);
    assertEqual(result.periods.length, 0);

    result = Periods.subtract(period1, period2);
    assertEqual(result.periods.length, 1);
    assertEqual(result.periods[0], period1);
    assertEqual(result.periods[0], period1);

    result = Periods.subtract(period2, period1);
    assertEqual(result.periods.length, 1);
    assertEqual(result.periods[0], period2);
    assertEqual(result.periods[0], period2);

    result = Periods.subtract(period1, period3);
    assertEqual(result.periods.length, 1);
    assertEqual(result.periods[0].start, new MyDate(period3.end + 1));
    assertEqual(result.periods[0].end, period1.end);

    result = Periods.subtract(period3, period1);
    assertEqual(result.periods.length, 1);
    assertEqual(result.periods[0].start, period3.start);
    assertEqual(result.periods[0].end, new MyDate(period1.start - 1));

    result = Periods.subtract(period2, period5);
    assertEqual(result.periods.length, 2);
    assertEqual(result.periods[0].start, period2.start);
    assertEqual(result.periods[0].end, new MyDate(period5.start - 1));
    assertEqual(result.periods[1].start, new MyDate(period5.end + 1));
    assertEqual(result.periods[1].end, period2.end);


    periods.subtract(subs).sort();
    assertEqual(periods.periods.length, 3);
    assertEqual(periods.periods[0].start, new MyDate(period3.end + 1));
    assertEqual(periods.periods[0].end, period1.end);
    assertEqual(periods.periods[1].start, period2.start);
    assertEqual(periods.periods[1].end, new MyDate(period5.start - 1));
    assertEqual(periods.periods[2].start, new MyDate(period5.end + 1));
    assertEqual(periods.periods[2].end, period2.end);
  }

  test_subtract() {
    const period1 = new Period({ start: '20220201', end: '20220331' });
    const period2 = new Period({ start: '20220701', end: '20220930' });

    const periods = [
      period1,
      period2
    ];

    const period3 = new Period({ start: '20220101', end: '20220227' });
    const period4 = new Period({ start: '20220501', end: '20220531' });
    const period5 = new Period({ start: '20220801', end: '20220831' });

    const newPeriods = [
      period3,
      period4,
      period5,
    ];

    /*
    .....[  1  ].....
    [  3    ]........
    =================
    .........[1].....
    */
    let result = Periods.subtract(period1, period3);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period3.end + 1);
    assertEqual(result[0].end, period1.end);

    /*
    [       1  ].....
    [  3    ]........
    =================
    .........[1].....
    */

    let union = Periods.unionPair(period1, period3);
    result = Periods.subtract(union, period3);
    assertEqual(result.length, 1);
    assertEqual(result[0].start, period3.end + 1);
    assertEqual(result[0].end, period1.end);
  }

  test_getChanges() {
    const period1 = new Period({ start: '20220201', end: '20220331' });
    const period2 = new Period({ start: '20220701', end: '20220930' });

    const periods = new Periods([
      period1,
      period2
    ]);

    const period3 = new Period({ start: '20220101', end: '20220227' });
    const period4 = new Period({ start: '20220501', end: '20220531' });
    const period5 = new Period({ start: '20220801', end: '20220831' });

    const newPeriods = [
      period3,
      period4,
      period5,
    ];

    const changes = periods.getChanges(newPeriods);
    assertEqual(changes.length, 5);
    assertTrue(changes.find(value => value.free && value.period.start.equal(period3.end + 1) && value.period.end.equal(period1.end)));
    assertTrue(changes.find(value => value.free && value.period.start.equal(period2.start) && value.period.end.equal(period5.start - 1)));
    assertTrue(changes.find(value => value.free && value.period.start.equal(period5.end + 1) && value.period.end.equal(period2.end)));
    assertTrue(changes.find(value => !value.free && value.period.start.equal(period3.start) && value.period.end.equal(period1.start - 1)));
    assertTrue(changes.find(value => !value.free && value.period.start.equal(period4.start) && value.period.end.equal(period4.end)));
  }


  test_getDiff() {
    /*
    .....[ 1 ].....
    .....[ 2 ].....
    ===============
    .....[   ].....
    */

    const period1 = new Period({ start: '20220110', end: '20220120' });
    const period2 = new Period({ start: '20220110', end: '20220120' });
    let diff = Periods.getDiff([period1], [period2]);
    assertEqual(diff.length, 1)
    assertTrue(diff[0].mode === '');
    assertEqual(diff[0].period.start, period1.start);
    assertEqual(diff[0].period.end, period1.end);

    /*
    .....[ 3 ].....
    .....[ 4  ]....
    ===============
    .....     +....
    */

    const period3 = new Period({ start: '20220110', end: '20220120' });
    const period4 = new Period({ start: '20220110', end: '20220121' });
    diff = Periods.getDiff([period3], [period4]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '');
    assertEqual(diff[0].period.start, period3.start);
    assertEqual(diff[0].period.end, period3.end);
    assertTrue(diff[1].mode === '+');
    assertEqual(diff[1].period.start, period3.end + 1);
    assertEqual(diff[1].period.end, period4.end);


    /*
    .....[ 5 ].....
    .....[ 6    ]..
    ===============
    .....     +++..
    */

    const period5 = new Period({ start: '20220110', end: '20220120' });
    const period6 = new Period({ start: '20220110', end: '20220130' });
    diff = Periods.getDiff([period5], [period6]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '');
    assertEqual(diff[0].period.start, period5.start);
    assertEqual(diff[0].period.end, period5.end);
    assertTrue(diff[1].mode === '+');
    assertEqual(diff[1].period.start, period5.end + 1);
    assertEqual(diff[1].period.end, period6.end);

    /*
    .....[ 7 ].....
    ..[ 8    ].....
    ===============
    ..+++     .....
    */

    const period7 = new Period({ start: '20220110', end: '20220120' });
    const period8 = new Period({ start: '20220101', end: '20220120' });
    diff = Periods.getDiff([period7], [period8]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '+');
    assertEqual(diff[0].period.start, period8.start);
    assertEqual(diff[0].period.end, period7.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period7.start);
    assertEqual(diff[1].period.end, period7.end);

    /*
    .....[ 9 ].....
    ....[ 10 ].....
    ===============
    ....+     .....
    */

    const period9 = new Period({ start: '20220110', end: '20220120' });
    const period10 = new Period({ start: '20220109', end: '20220120' });
    diff = Periods.getDiff([period9], [period10]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '+');
    assertEqual(diff[0].period.start, period10.start);
    assertEqual(diff[0].period.end, period9.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period9.start);
    assertEqual(diff[1].period.end, period9.end);


    /*
    .....[ 11 ]....
    ......[12 ]....
    ===============
    .....-     .....
    */

    const period11 = new Period({ start: '20220110', end: '20220120' });
    const period12 = new Period({ start: '20220111', end: '20220120' });
    diff = Periods.getDiff([period11], [period12]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '-');
    assertEqual(diff[0].period.start, period11.start);
    assertEqual(diff[0].period.end, period12.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period12.start);
    assertEqual(diff[1].period.end, period12.end);

    /*
    .....[ 13 ]....
    .......[14]....
    ===============
    .....--    ....
    */

    const period13 = new Period({ start: '20220110', end: '20220120' });
    const period14 = new Period({ start: '20220115', end: '20220120' });
    diff = Periods.getDiff([period13], [period14]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '-');
    assertEqual(diff[0].period.start, period13.start);
    assertEqual(diff[0].period.end, period14.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period14.start);
    assertEqual(diff[1].period.end, period14.end);


    /*
    .....[ 15 ]....
    .....[16]......
    ===============
    .....    --....
    */

    const period15 = new Period({ start: '20220110', end: '20220120' });
    const period16 = new Period({ start: '20220110', end: '20220115' });
    diff = Periods.getDiff([period15], [period16]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '');
    assertEqual(diff[0].period.start, period15.start);
    assertEqual(diff[0].period.end, period16.end);
    assertTrue(diff[1].mode === '-');
    assertEqual(diff[1].period.start, period16.end + 1);
    assertEqual(diff[1].period.end, period15.end);

    /*
    .....[ 17 ]....
    .....[18 ].....
    ===============
    .....     -....
    */

    const period17 = new Period({ start: '20220110', end: '20220120' });
    const period18 = new Period({ start: '20220110', end: '20220119' });
    diff = Periods.getDiff([period17], [period18]);
    assertEqual(diff.length, 2)
    assertTrue(diff[0].mode === '');
    assertEqual(diff[0].period.start, period17.start);
    assertEqual(diff[0].period.end, period18.end);
    assertTrue(diff[1].mode === '-');
    assertEqual(diff[1].period.start, period18.end + 1);
    assertEqual(diff[1].period.end, period17.end);    

    /*
    .....[ 19 ]....
    ......[20].....
    ===============
    .....-    -....
    */

    const period19 = new Period({ start: '20220110', end: '20220120' });
    const period20 = new Period({ start: '20220111', end: '20220119' });
    diff = Periods.getDiff([period19], [period20]);
    assertEqual(diff.length, 3)
    assertTrue(diff[0].mode === '-');
    assertEqual(diff[0].period.start, period19.start);
    assertEqual(diff[0].period.end, period20.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period20.start);
    assertEqual(diff[1].period.end, period20.end);        
    assertTrue(diff[2].mode === '-');
    assertEqual(diff[2].period.start, period20.end+1);
    assertEqual(diff[2].period.end, period19.end);   

    /*
    ......[21].....
    .....[ 22 ]....
    ===============
    .....+    +....
    */

    const period21 = new Period({ start: '20220110', end: '20220120' });
    const period22 = new Period({ start: '20220109', end: '20220121' });
    diff = Periods.getDiff([period21], [period22]);
    assertEqual(diff.length, 3)
    assertTrue(diff[0].mode === '+');
    assertEqual(diff[0].period.start, period22.start);
    assertEqual(diff[0].period.end, period21.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period21.start);
    assertEqual(diff[1].period.end, period21.end);        
    assertTrue(diff[2].mode === '+');
    assertEqual(diff[2].period.start, period21.end+1);
    assertEqual(diff[2].period.end, period22.end);    

    /*
    ....[ 23 ].....
    .....[ 24 ]....
    ===============
    ....-     +....
    */

    const period23 = new Period({ start: '20220110', end: '20220120' });
    const period24 = new Period({ start: '20220111', end: '20220121' });
    diff = Periods.getDiff([period23], [period24]);
    assertEqual(diff.length, 3)
    assertTrue(diff[0].mode === '-');
    assertEqual(diff[0].period.start, period23.start);
    assertEqual(diff[0].period.end, period24.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period24.start);
    assertEqual(diff[1].period.end, period23.end);        
    assertTrue(diff[2].mode === '+');
    assertEqual(diff[2].period.start, period23.end+1);
    assertEqual(diff[2].period.end, period24.end);     

    /*
    ....[ 25 ].....
    ...[ 26 ]......
    ===============
    ...+     -....
    */

    const period25 = new Period({ start: '20220110', end: '20220120' });
    const period26 = new Period({ start: '20220109', end: '20220119' });
    diff = Periods.getDiff([period25], [period26]);
    assertEqual(diff.length, 3)
    assertTrue(diff[0].mode === '+');
    assertEqual(diff[0].period.start, period26.start);
    assertEqual(diff[0].period.end, period25.start - 1);
    assertTrue(diff[1].mode === '');
    assertEqual(diff[1].period.start, period25.start);
    assertEqual(diff[1].period.end, period26.end);        
    assertTrue(diff[2].mode === '-');
    assertEqual(diff[2].period.start, period26.end+1);
    assertEqual(diff[2].period.end, period25.end);      

  }


}

function test_Periods() {
  new TestCase(this).run(PeriodsTest);
}