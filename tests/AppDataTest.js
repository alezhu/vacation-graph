class AppDataTest extends TestCase {
  test_serialization() {
    const value = new AppData({
      usersData: [
        new UserData({
          fio: 'aaa',
          periods: [
            new Period({ start: new Date(Date.UTC(2022, 5, 1)), end: new Date(Date.UTC(2022, 5, 10)) }),
            new Period({ start: '20220601', end: '20220610' })
          ]
        }),
        new UserData({
          fio: 'bbb',
          periods: [
            new Period({ start: new Date(Date.UTC(2021, 5, 1)), end: new Date(Date.UTC(2021, 5, 10)) }),
            new Period({ start: new Date(Date.UTC(2021, 6, 1)), end: new Date(Date.UTC(2021, 6, 10)) })
          ]
        }),
      ]
    });
    // Logger.log(value);
    const json = value.serialize();
    // Logger.log(json);
    const value2 = AppData.deserialize(json);
    // Logger.log(value2);    
    assertTrue(value2.usersData.length == value.usersData.length);
    assertTrue(value2.usersData.map.has(Array.from(value.usersData)[0].fio));
    assertTrue(value2.usersData.map.has(Array.from(value.usersData)[1].fio));
  }
}