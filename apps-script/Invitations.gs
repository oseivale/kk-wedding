/**
 * Kwazi & Kwasi — email invitations
 * ----------------------------------
 * Adds a "Wedding invitations" menu to the Google Sheet. Guests go in the
 * "Invitations" tab; tick which wedding(s) each guest is invited to, then send.
 *
 * - Each guest receives one email per wedding they're invited to.
 * - Every send is stamped in the sheet, so running it again never emails anyone twice.
 * - Emails come from the Google account that runs the script, so replies go to the couple.
 * - Regular Gmail accounts can email about 100 recipients a day. If the limit is reached,
 *   sending stops cleanly; run it again the next day and it carries on where it left off.
 *
 * Wording lives in InviteGhana.html and InviteBotswana.html. Event details live below.
 * Before sending, set these Script Properties (Project Settings → Script properties):
 *   SITE_URL     e.g. https://kwaziandkwasi.com   (no trailing slash)
 *   INVITE_CODE  the same code as the website's INVITE_CODE
 */

const INVITE = {
  fromName: 'Kwazi & Kwasi',
  couple: 'Kwazi & Kwasi',

  ghana: {
    subject: 'You\'re invited: Kwazi & Kwasi\'s wedding in Ghana, February 20, 2027',
    date: 'Saturday, February 20, 2027',
    ceremonyVenue: 'ICGC Holy Ghost Temple',
    ceremonyLocation: 'Fafraha, Adenta, Accra, Ghana',
    ceremonyTime: 'Time to be confirmed',
    receptionVenue: 'Venue to be confirmed',
    receptionLocation: 'Accra, Ghana',
    receptionTime: '5:00 PM – 10:00 PM',
    rsvpDeadline: '', // e.g. 'January 15, 2027'. Leave empty to leave the line out.
    pickupDeadline: 'January 15, 2027',
  },

  botswana: {
    subject: 'You\'re invited: Kwazi & Kwasi\'s wedding in Botswana, February 13, 2027',
    date: 'Saturday, February 13, 2027',
    venue: 'Heavenly Gardens',
    location: 'Matshelagabedi Road, Francistown, Botswana',
    time: '11:00 AM',
  },
};

const INVITE_SHEET = 'Invitations';
const INVITE_HEADERS = ['Name', 'Email', 'Invite to Ghana', 'Invite to Botswana', 'Ghana sent', 'Botswana sent', 'Notes'];
const COL = { name: 1, email: 2, ghana: 3, botswana: 4, ghanaSent: 5, botswanaSent: 6, notes: 7 };

// ---------- Menu ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Wedding invitations')
    .addItem('Send a test of both emails to me', 'sendTestInvites')
    .addSeparator()
    .addItem('Send Ghana invitations', 'sendGhanaInvites')
    .addItem('Send Botswana invitations', 'sendBotswanaInvites')
    .addSeparator()
    .addItem('Check who hasn\'t been sent yet', 'showInviteStatus')
    .addSeparator()
    .addItem('Email confirmed Ghana guests', 'emailConfirmedGhanaGuests')
    .addSeparator()
    .addItem('Set up the Invitations tab', 'setupInvitations')
    .addToUi();
}

function setupInvitations() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(INVITE_SHEET);
  if (!sh) {
    sh = ss.insertSheet(INVITE_SHEET, 1);
    sh.getRange(1, 1, 1, INVITE_HEADERS.length).setValues([INVITE_HEADERS])
      .setFontWeight('bold').setBackground('#f4ede1');
    sh.setFrozenRows(1);
    sh.setColumnWidth(COL.name, 220);
    sh.setColumnWidth(COL.email, 260);
    sh.setColumnWidths(COL.ghanaSent, 2, 150);
    sh.setColumnWidth(COL.notes, 260);
  }
  sh.getRange(2, COL.ghana, 999, 2).insertCheckboxes();
  ui_().alert(
    'Invitations tab ready',
    'Add one row per guest: their name, email, and tick the wedding(s) they\'re invited to.\n\n' +
      'Then use "Send a test of both emails to me" before sending to everyone.',
    ui_().ButtonSet.OK
  );
}

// ---------- Sending ----------

function sendGhanaInvites() { sendInvites_('ghana'); }
function sendBotswanaInvites() { sendInvites_('botswana'); }

function sendInvites_(wedding) {
  const ui = ui_();
  const cfg = config_();
  if (!cfg) return;

  const label = wedding === 'ghana' ? 'Ghana' : 'Botswana';
  const pending = pendingRows_(wedding);
  if (!pending.length) {
    ui.alert('Nothing to send', 'Every guest ticked for the ' + label + ' wedding has already been sent an invitation.', ui.ButtonSet.OK);
    return;
  }

  const quota = MailApp.getRemainingDailyQuota();
  const batch = Math.min(pending.length, quota);
  if (batch < 1) {
    ui.alert('Daily limit reached', 'Google\'s daily email limit for this account has been used up. Try again tomorrow.', ui.ButtonSet.OK);
    return;
  }

  const msg = 'Send the ' + label + ' invitation to ' + batch + ' guest' + (batch === 1 ? '' : 's') + '?' +
    (batch < pending.length
      ? '\n\nGoogle allows ' + quota + ' more emails from this account today, so ' + (pending.length - batch) +
        ' will be left for tomorrow. Just run this again then.'
      : '');
  if (ui.alert('Send ' + label + ' invitations', msg, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  const sh = sheet_(INVITE_SHEET, INVITE_HEADERS);
  const sentCol = wedding === 'ghana' ? COL.ghanaSent : COL.botswanaSent;
  let sent = 0;
  const failed = [];

  for (let i = 0; i < batch; i++) {
    const g = pending[i];
    try {
      sendOne_(wedding, g.name, g.email, cfg);
      sh.getRange(g.row, sentCol).setValue(new Date());
      sent++;
    } catch (err) {
      failed.push(g.name + ' (' + g.email + ')');
      sh.getRange(g.row, COL.notes).setValue(label + ' send failed: ' + String(err.message || err).slice(0, 120));
    }
  }
  SpreadsheetApp.flush();

  let summary = 'Sent ' + sent + ' ' + label + ' invitation' + (sent === 1 ? '' : 's') + '.';
  if (failed.length) summary += '\n\nCouldn\'t send to:\n' + failed.join('\n') + '\n\nSee the Notes column.';
  const left = pending.length - sent - failed.length;
  if (left > 0) summary += '\n\n' + left + ' still to send. Run this again tomorrow.';
  ui.alert('Done', summary, ui.ButtonSet.OK);
}

function sendTestInvites() {
  const cfg = config_();
  if (!cfg) return;
  const me = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  sendOne_('ghana', 'Test Guest', me, cfg, '[TEST] ');
  sendOne_('botswana', 'Test Guest', me, cfg, '[TEST] ');
  ui_().alert('Test sent', 'Both invitations were sent to ' + me + '. Check how they look on your phone too.', ui_().ButtonSet.OK);
}

function showInviteStatus() {
  const g = pendingRows_('ghana').length;
  const b = pendingRows_('botswana').length;
  ui_().alert(
    'Invitations still to send',
    'Ghana: ' + g + '\nBotswana: ' + b + '\n\nEmails left today for this account: ' + MailApp.getRemainingDailyQuota(),
    ui_().ButtonSet.OK
  );
}

function sendOne_(wedding, name, email, cfg, subjectPrefix) {
  const ev = INVITE[wedding];
  const firstName = String(name).trim().split(/\s+/)[0] || 'friend';
  const values = {
    firstName: firstName,
    couple: INVITE.couple,
    siteUrl: cfg.siteUrl,
    inviteCode: cfg.inviteCode,
    codeParam: encodeURIComponent(cfg.inviteCode), // links that unlock the website in one click
  };
  Object.keys(ev).forEach(function (k) { values[k] = ev[k]; });

  const file = wedding === 'ghana' ? 'InviteGhana' : 'InviteBotswana';
  const html = renderInvite_(HtmlService.createHtmlOutputFromFile(file).getContent(), values);

  MailApp.sendEmail({
    to: email,
    subject: (subjectPrefix || '') + ev.subject,
    htmlBody: html,
    body: plainText_(wedding, values),
    name: INVITE.fromName,
  });
}

// ---------- Helpers ----------

/** Rows ticked for this wedding, with a valid email, not yet sent. */
function pendingRows_(wedding) {
  const sh = sheet_(INVITE_SHEET, INVITE_HEADERS);
  if (sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, INVITE_HEADERS.length).getValues();
  const invitedIdx = (wedding === 'ghana' ? COL.ghana : COL.botswana) - 1;
  const sentIdx = (wedding === 'ghana' ? COL.ghanaSent : COL.botswanaSent) - 1;
  // Addresses that already received this invitation (in any row) are never sent again.
  const seen = {};
  rows.forEach(function (r) {
    if (r[sentIdx]) seen[String(r[COL.email - 1]).trim().toLowerCase()] = true;
  });
  const out = [];
  rows.forEach(function (r, i) {
    const email = String(r[COL.email - 1]).trim().toLowerCase();
    if (r[invitedIdx] !== true || r[sentIdx]) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (email) sh.getRange(i + 2, COL.notes).setValue('Check this email address');
      return;
    }
    if (seen[email]) { // same address listed twice, or already sent: send once
      if (!r[COL.notes - 1]) sh.getRange(i + 2, COL.notes).setValue('Same email as another guest: not sent twice');
      return;
    }
    seen[email] = true;
    out.push({ row: i + 2, name: String(r[COL.name - 1]).trim(), email: email });
  });
  return out;
}

/** Replaces {{key}} with the HTML-escaped value. Unknown keys become empty. */
function renderInvite_(template, values) {
  return template.replace(/<!--[\s\S]*?-->/g, '').replace(/\{\{\s*(\w+)\s*\}\}/g, function (_, key) {
    return escapeHtml_(values[key] == null ? '' : values[key]);
  }).replace(/\[\[if:(\w+)\]\]([\s\S]*?)\[\[endif\]\]/g, function (_, key, inner) {
    return values[key] ? inner : ''; // optional blocks, e.g. the RSVP deadline line
  });
}

function escapeHtml_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/** Plain-text version for email apps that don't show HTML (also helps deliverability). */
function plainText_(wedding, v) {
  if (wedding === 'ghana') {
    return [
      'Dear ' + v.firstName + ',',
      '',
      'With grateful hearts and so much joy, we invite you to celebrate our wedding in Ghana.',
      '',
      v.date,
      'Wedding ceremony: ' + v.ceremonyVenue + ', ' + v.ceremonyLocation + ' (' + v.ceremonyTime + ')',
      'Wedding reception: ' + v.receptionVenue + ', ' + v.receptionLocation + ' (' + v.receptionTime + ')',
      '',
      'Please RSVP at ' + v.siteUrl + '/rsvp?code=' + v.codeParam + (v.rsvpDeadline ? ' by ' + v.rsvpDeadline : ''),
      'Your invitation code: ' + v.inviteCode + ' (it also opens the wedding details on our website)',
      'Each adult guest completes their own RSVP. Children under 18 can be added to one parent\'s RSVP.',
      '',
      'Travelling to Ghana? Travel tips and airport pickup (request by ' + v.pickupDeadline + '): ' + v.siteUrl + '/travel/ghana?code=' + v.codeParam,
      'Formal, elegant attire is encouraged. Children are welcome.',
      '',
      'With love,',
      v.couple,
    ].join('\n');
  }
  return [
    'Dear ' + v.firstName + ',',
    '',
    'With grateful hearts and so much joy, we invite you to celebrate our wedding in Botswana.',
    '',
    v.date,
    v.venue + ', ' + v.location + ' (' + v.time + ')',
    '',
    'No RSVP is needed for our Botswana wedding.',
    'Wedding details: ' + v.siteUrl + '/celebrations/botswana?code=' + v.codeParam,
    'Travelling to Botswana? ' + v.siteUrl + '/travel/botswana?code=' + v.codeParam,
    'If the website asks for an invitation code, use: ' + v.inviteCode,
    'Formal, elegant attire is encouraged. Children are welcome.',
    '',
    'With love,',
    v.couple,
  ].join('\n');
}

function config_() {
  const props = PropertiesService.getScriptProperties();
  const siteUrl = String(props.getProperty('SITE_URL') || '').replace(/\/+$/, '');
  const inviteCode = props.getProperty('INVITE_CODE') || '';
  const missing = [];
  if (!/^https:\/\//.test(siteUrl)) missing.push('SITE_URL (the website address, starting with https://)');
  if (!inviteCode) missing.push('INVITE_CODE (the same code the website uses)');
  if (missing.length) {
    ui_().alert(
      'Two settings needed first',
      'Add these in Apps Script under Project Settings → Script properties:\n\n' + missing.join('\n'),
      ui_().ButtonSet.OK
    );
    return null;
  }
  return { siteUrl: siteUrl, inviteCode: inviteCode };
}

function ui_() { return SpreadsheetApp.getUi(); }
