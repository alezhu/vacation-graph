class UserDataTest extends TestCase {


    test_getChanges() {
        const oldData = new UserData({
            fio: 'test',
            periods: [
                new Period({ start: '20220110', end: '20220120' }),
            ]
        });
        const newData = new UserData({
            fio: 'test',
            periods: [
                new Period({ start: '20220109', end: '20220111' }),
                new Period({ start: '20220114', end: '20220116' }),
                new Period({ start: '20220119', end: '20220121' }),
            ]
        });

        const changes = oldData.getChanges(newData);
        const add = changes.filter(value => !value.free);
        const free = changes.filter(value => value.free);
        assertEqual(add.length, 2)
        assertEqual(free.length, 2)
        assertEqual(add[0].period.start.day, 9);
        assertEqual(add[0].period.end.day, 9);
        assertEqual(add[1].period.start.day, 21);
        assertEqual(add[1].period.end.day, 21);
        assertEqual(free[0].period.start.day, 12);
        assertEqual(free[0].period.end.day, 13);
        assertEqual(free[1].period.start.day, 17);
        assertEqual(free[1].period.end.day, 18);
    }

    test_getChanges2() {
        const oldData = new UserData({
            fio: 'test',
            periods: [
                new Period({ start: '20220201', end: '20220331' }),
                new Period({ start: '20220701', end: '20220930' }),
            ]
        });
        const newData = new UserData({
            fio: 'test',
            periods: [
                new Period({ start: '20220101', end: '20220227' }),
                new Period({ start: '20220501', end: '20220531' }),
                new Period({ start: '20220801', end: '20220831' }),
            ]
        });

        const changes = oldData.getChanges(newData);
        const add = changes.filter(value => !value.free);
        const free = changes.filter(value => value.free);
        assertEqual(add.length, 2)
        assertEqual(free.length, 3)

        assertTrue(add[0].period.start.equal('20220101'));
        assertTrue(add[0].period.end.equal('20220131'));

        assertTrue(add[1].period.start.equal('20220501'));
        assertTrue(add[1].period.end.equal('20220531'));

        assertTrue(free[0].period.start.equal('20220228'));
        assertTrue(free[0].period.end.equal('20220331'));

        assertTrue(free[1].period.start.equal('20220701'));
        assertTrue(free[1].period.end.equal('20220731'));

        assertTrue(free[2].period.start.equal('20220901'));
        assertTrue(free[2].period.end.equal('20220930'));
    }
}

function test_UserData() {
    new TestCase(this).run(UserDataTest);
}