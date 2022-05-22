function onOpen(event) {
    //App.onOpen(event);
}

function onEdit(event) {
    //
}

function testOnOpen() {
    const wb = SpreadsheetApp.getActiveSpreadsheet();
    var event = {
        source: wb,
    }
    App.onOpen(event);
}