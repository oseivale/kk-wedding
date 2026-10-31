/**
 * Kwazi & Kwasi wedding — Google Sheets backend
 * ------------------------------------------------
 * Paste this into Extensions → Apps Script inside the couple's Google Sheet.
 * Run `setup` once, set the SHARED_SECRET script property, then deploy as a web app.
 * Full steps are in the project README.
 *
 * Only the website's server knows SHARED_SECRET, so guests can't write here directly.
 */

const SHEETS = {
  rsvp: 'Ghana RSVPs',
  pickup: 'Airport pickup',
  summary: 'Summary',
};

const RSVP_HEADERS = [
  'Submitted', 'Full name', 'Response', 'Children (count)',
  'Child 1', 'Child 2', 'Child 3', 'Child 4', 'Possible duplicate',
  'Email', 'Emails sent',
];
const RSVP_COL = { name: 2, response: 3, email: 10, emailsSent: 11 };

const PICKUP_HEADERS = [
  'First submitted', 'Last updated', 'Full name', 'WhatsApp', 'Needs pickup',
  'Airline', 'Flight number', 'Arrival date', 'Arrival time (Ghana)', 'Itinerary file',
  'Pickup status', 'Notes', 'Change history',
];

// End of January 15, 2027 in Accra (UTC+0). New pickup requests close after this; updates stay open.
const PICKUP_DEADLINE = new Date('2027-01-15T23:59:59Z');

// ---------- Web app entry point ----------

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || req.secret !== secret) return json_({ ok: false, error: 'Not authorised.' });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000); // one write at a time so rows never collide
    try {
      if (req.action === 'rsvp') return json_(saveRsvp_(req.data));
      if (req.action === 'pickup') return json_(savePickup_(req.data));
      return json_({ ok: false, error: 'Unknown action.' });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'We couldn\'t save that just now. Please try again.' });
  }
}

function doGet() {
  return ContentService.createTextOutput('OK');
}

// ---------- RSVP ----------

function saveRsvp_(d) {
  const sheet = sheet_(SHEETS.rsvp, RSVP_HEADERS);
  const children = (d.children || []).slice(0, 4).map(function (c) { return safe_(c, 100); });
  const name = safe_(d.fullName, 100);

  // Flag (don't block) likely duplicates so the couple can tidy up.
  const flags = [];
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues() : [];
  const norm = function (s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); };
  rows.forEach(function (r, i) {
    const rowNum = i + 2;
    if (norm(r[1]) === norm(name)) flags.push('Same name as row ' + rowNum);
    r.slice(4, 8).forEach(function (c) {
      children.forEach(function (child) {
        if (c && norm(c) === norm(child)) flags.push('Child "' + child + '" also in row ' + rowNum);
      });
    });
  });

  const email = cleanEmail_(d.email);
  sheet.appendRow([
    new Date(),
    name,
    d.attending === 'accepts' ? 'Joyfully accepts' : 'Regretfully declines',
    children.length,
    children[0] || '', children[1] || '', children[2] || '', children[3] || '',
    flags.join('; '),
    email,
    '', // Emails sent: filled in when the couple emails confirmed guests (GuestEmails.gs)
  ]);
  return { ok: true };
}

// ---------- Airport pickup ----------

function savePickup_(d) {
  const sheet = sheet_(SHEETS.pickup, PICKUP_HEADERS);
  const digits = String(d.whatsapp || '').replace(/\D/g, '');
  if (digits.length < 8) return { ok: false, error: 'Please check your WhatsApp number.' };

  // Find an earlier request from the same WhatsApp number, so flight changes update that row.
  let rowNum = 0;
  if (sheet.getLastRow() > 1) {
    const numbers = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < numbers.length; i++) {
      if (String(numbers[i][0]).replace(/\D/g, '') === digits) { rowNum = i + 2; break; }
    }
  }

  if (!rowNum && new Date() > PICKUP_DEADLINE) {
    return {
      ok: false,
      error: 'The deadline for new pickup requests has passed. If you already sent one, use the same WhatsApp number you used then.',
    };
  }

  let fileCell = '';
  if (d.needsPickup && d.file && d.file.base64) {
    fileCell = saveItinerary_(d);
  }

  const now = new Date();
  const values = [
    safe_(d.fullName, 100),
    "'" + String(d.whatsapp || '').replace(/[^\d+ ().-]/g, '').slice(0, 25), // leading ' keeps the + and stops Sheets treating it as a number
    d.needsPickup ? 'Yes' : 'No',
    d.needsPickup ? safe_(d.airline, 60) : '',
    d.needsPickup ? safe_(d.flightNumber, 12) : '',
    d.needsPickup ? safe_(d.arrivalDate, 10) : '',
    d.needsPickup ? safe_(d.arrivalTime, 5) : '',
  ];

  if (rowNum) {
    const old = sheet.getRange(rowNum, 1, 1, PICKUP_HEADERS.length).getValues()[0];
    const summary = [old[5], old[6], old[7], old[8]].filter(String).join(' ');
    const history = (old[12] ? old[12] + '\n' : '') +
      Utilities.formatDate(now, 'UTC', 'yyyy-MM-dd HH:mm') + ' UTC — previously: ' + (summary || 'no flight details') +
      (old[10] ? ' (status was: ' + old[10] + ')' : '');
    sheet.getRange(rowNum, 2, 1, 8).setValues([[now].concat(values)]);
    if (fileCell) sheet.getRange(rowNum, 10).setValue(fileCell);
    sheet.getRange(rowNum, 13).setValue(history);
    // Flag for the couple: a confirmed pickup may need re-confirming.
    sheet.getRange(rowNum, 11).setValue('Flight changed: re-check');
    return { ok: true, updated: true };
  }

  sheet.appendRow([now, now].concat(values, [fileCell, 'New', '', '']));
  return { ok: true, updated: false };
}

function saveItinerary_(d) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
  if (allowed.indexOf(d.file.type) === -1) return '';
  const bytes = Utilities.base64Decode(d.file.base64);
  if (bytes.length > 4 * 1024 * 1024) return '';
  const ext = (String(d.file.name).match(/\.[a-z0-9]{2,5}$/i) || [''])[0];
  const name = [d.arrivalDate, safe_(d.fullName, 60), safe_(d.flightNumber, 12)].join(' ').replace(/[\\/:*?"<>|]/g, '') + ext;
  const blob = Utilities.newBlob(bytes, d.file.type, name);
  const file = folder_().createFile(blob);
  // The folder stays private to the couple; only people they share it with can open these links.
  return '=HYPERLINK("' + file.getUrl() + '","View itinerary")';
}

// ---------- One-time setup ----------

/** Run once from the Apps Script editor (select `setup`, press Run). */
function setup() {
  sheet_(SHEETS.rsvp, RSVP_HEADERS);
  sheet_(SHEETS.pickup, PICKUP_HEADERS);
  folder_();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEETS.summary);
  if (!s) s = ss.insertSheet(SHEETS.summary, 0);
  s.clear();
  const R = "'" + SHEETS.rsvp + "'";
  const P = "'" + SHEETS.pickup + "'";
  s.getRange(1, 1, 11, 2).setValues([
    ['Ghana wedding RSVPs', ''],
    ['Adults attending', '=COUNTIF(' + R + '!C:C,"Joyfully accepts")'],
    ['Children attending', '=SUMIF(' + R + '!C:C,"Joyfully accepts",' + R + '!D:D)'],
    ['Total guests attending', '=B2+B3'],
    ['Adults declined', '=COUNTIF(' + R + '!C:C,"Regretfully declines")'],
    ['RSVPs flagged as possible duplicates', '=COUNTIF(' + R + '!I2:I,"?*")'],
    ['Attending guests with an email', '=COUNTIFS(' + R + '!C:C,"Joyfully accepts",' + R + '!J:J,"?*")'],
    ['Attending guests missing an email', '=B2-B7'],
    ['', ''],
    ['Airport pickup requests', '=COUNTIF(' + P + '!E:E,"Yes")'],
    ['Pickups needing a re-check', '=COUNTIF(' + P + '!K2:K,"*re-check*")'],
  ]);
  s.getRange('A1').setFontWeight('bold').setFontSize(13);
  s.setColumnWidth(1, 300);

  const sheet = ss.getSheetByName(SHEETS.pickup);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'Confirmed', 'Not available', 'Flight changed: re-check'], false)
    .setAllowInvalid(true)
    .build();
  sheet.getRange('K2:K').setDataValidation(rule);

  if (!PropertiesService.getScriptProperties().getProperty('SHARED_SECRET')) {
    Logger.log('Next: add a script property named SHARED_SECRET (Project Settings → Script properties).');
  }
  Logger.log('Setup complete.');
}

// ---------- Helpers ----------

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#eeefe2');
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < headers.length) {
    // Columns added in a later version: add their headings to an existing tab.
    const from = sh.getLastColumn() + 1;
    sh.getRange(1, from, 1, headers.length - from + 1)
      .setValues([headers.slice(from - 1)]).setFontWeight('bold').setBackground('#eeefe2');
  }
  return sh;
}

/** Lower-cased email if it looks valid, otherwise empty. */
function cleanEmail_(v) {
  const e = String(v || '').trim().toLowerCase().slice(0, 254);
  return /^[^\s@<>(),;:"\[\]]+@[^\s@<>(),;:"\[\]]+\.[a-z]{2,}$/.test(e) ? e : '';
}

function folder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('ITINERARY_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* recreate below */ }
  }
  const folder = DriveApp.createFolder('Wedding — guest flight itineraries');
  props.setProperty('ITINERARY_FOLDER_ID', folder.getId());
  return folder;
}

/** Trim, cap length and stop spreadsheet formula injection (values starting with = + - @). */
function safe_(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
