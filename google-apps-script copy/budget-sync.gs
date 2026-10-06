// Budget app sync endpoint.
//
// IMPORTANT FIX: the previous version stored the entire JSON payload in a single
// cell (A1). Google Sheets caps a single cell at 50,000 characters — once your
// data (transactions, budget snapshot history, etc.) grew past that, setValue()
// started throwing on every push. The catch block below still returns HTTP 200,
// so the app's "Synced!" badge kept showing even though nothing was actually
// saved. That's why edits looked fine on the device that made them (it's just
// reading its own local copy) but never reached other devices.
//
// Fix: split the JSON string across as many cells (one per row in column A) as
// it takes, and reassemble them on read. Also added SpreadsheetApp.flush() so a
// write is fully committed before the response goes out, and a script lock so a
// read can't land in the middle of a write from another device.

var SHEET_NAME = 'BudgetData';
var CHUNK_SIZE = 45000; // stay safely under Sheets' ~50,000 char/cell limit

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function doGet(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var sheet = getSheet_();
    var lastRow = sheet.getLastRow();
    var data = '';
    if (lastRow > 0) {
      var values = sheet.getRange(1, 1, lastRow, 1).getValues();
      data = values.map(function (r) { return r[0] || ''; }).join('');
    }
    var result = data ? JSON.parse(data) : {
      schema: [], txns: [], accounts: [], profile: {}, trips: [],
      incomeSources: [], paymentMethods: [], reimbursementMethods: [],
      budgetSnapshots: {}, budgetSnapshotsAnnual: {}
    };
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var payload = e.postData.contents;
    // Validate before touching the sheet at all, so a malformed/truncated
    // request can never wipe out good data.
    JSON.parse(payload);

    var sheet = getSheet_();
    sheet.clearContents();
    var chunks = [];
    for (var i = 0; i < payload.length; i += CHUNK_SIZE) {
      chunks.push([payload.substr(i, CHUNK_SIZE)]);
    }
    if (chunks.length) {
      sheet.getRange(1, 1, chunks.length, 1).setValues(chunks);
    }
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
