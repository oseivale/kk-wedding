/**
 * Kwazi & Kwasi — official emails to confirmed Ghana guests
 * ----------------------------------------------------------
 * Nothing is emailed when someone RSVPs. When the couple is ready, they choose
 * Wedding invitations → Email confirmed Ghana guests to send the official details
 * (and later, any follow-ups) to everyone who joyfully accepted.
 *
 * - One email per address: couples who share an email get a single copy.
 * - Each send is recorded in the "Emails sent" column, so the same email never goes
 *   to anyone twice, and a send interrupted by Gmail's daily limit can be finished later.
 *
 * Uses the event details in INVITE (Invitations.gs) and the SITE_URL script property.
 * Counts toward Gmail's daily limit (about 100 recipients a day on a regular Gmail account),
 * shared with the invitations.
 */

function emailConfirmedGhanaGuests() {
  const ui = SpreadsheetApp.getUi();
  const siteUrl = requireSiteUrl_();
  if (!siteUrl) return;
  const inviteCode = PropertiesService.getScriptProperties().getProperty('INVITE_CODE') || '';
  if (!inviteCode) {
    ui.alert('Invitation code needed', 'Add a script property named INVITE_CODE (the same code as the website) under Project Settings → Script properties. It goes into the links so they open the website directly.', ui.ButtonSet.OK);
    return;
  }
  const codeParam = encodeURIComponent(inviteCode);

  const subjectRes = ui.prompt(
    'Subject of this email',
    'For example "Official wedding details" or "One week to go".\n' +
      'It\'s also used to make sure nobody gets the same email twice.',
    ui.ButtonSet.OK_CANCEL
  );
  if (subjectRes.getSelectedButton() !== ui.Button.OK) return;
  const subject = String(subjectRes.getResponseText()).trim().slice(0, 80);
  if (!subject) {
    ui.alert('A subject is needed.');
    return;
  }

  const noteRes = ui.prompt(
    'Add a personal note (optional)',
    'A short message shown at the top of the email. Leave blank to skip.',
    ui.ButtonSet.OK_CANCEL
  );
  if (noteRes.getSelectedButton() !== ui.Button.OK) return;
  const note = String(noteRes.getResponseText()).trim().slice(0, 600);

  // Group confirmed guests by email address.
  const sh = sheet_(SHEETS.rsvp, RSVP_HEADERS);
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, RSVP_HEADERS.length).getValues() : [];
  const byEmail = {};
  let missingEmail = 0;
  rows.forEach(function (r, i) {
    if (r[RSVP_COL.response - 1] !== 'Joyfully accepts') return;
    const email = cleanEmail_(r[RSVP_COL.email - 1]);
    if (!email) {
      missingEmail++;
      return;
    }
    const already = String(r[RSVP_COL.emailsSent - 1]).split('\n').some(function (line) {
      return line.replace(/ \(\d{4}-\d{2}-\d{2}\)$/, '') === subject;
    });
    if (!byEmail[email]) byEmail[email] = { rows: [], names: [], already: false };
    byEmail[email].rows.push(i + 2);
    byEmail[email].names.push(firstName_(r[RSVP_COL.name - 1]));
    if (already) byEmail[email].already = true;
  });
  const pending = Object.keys(byEmail).filter(function (e) { return !byEmail[e].already; });
  const missingNote = missingEmail
    ? '\n\n' + missingEmail + ' confirmed guest' + (missingEmail === 1 ? ' has' : 's have') + ' no email in the sheet and won\'t receive this.'
    : '';

  if (!pending.length) {
    ui.alert('Nothing to send', 'Every confirmed guest with an email has already had "' + subject + '".' + missingNote, ui.ButtonSet.OK);
    return;
  }
  const quota = MailApp.getRemainingDailyQuota();
  const batch = Math.min(pending.length, quota);
  if (batch < 1) {
    ui.alert('Daily limit reached', 'Google\'s daily email limit for this account has been used up. Try again tomorrow.', ui.ButtonSet.OK);
    return;
  }
  const msg = 'Send "' + subject + '" to ' + batch + ' email address' + (batch === 1 ? '' : 'es') + '?' +
    (batch < pending.length ? '\n\nOnly ' + quota + ' emails are left today, so ' + (pending.length - batch) +
      ' will wait. Run this again tomorrow with the same subject to finish.' : '') + missingNote;
  if (ui.alert('Email confirmed guests', msg, ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  const template = HtmlService.createHtmlOutputFromFile('GuestEmailGhana').getContent();
  const ev = INVITE.ghana;
  const stamp = subject + ' (' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + ')';
  let sent = 0;
  const failed = [];
  for (let i = 0; i < batch; i++) {
    const email = pending[i];
    const g = byEmail[email];
    // Event details first, then this email's own values (so its subject wins over the invitation's).
    const values = {};
    Object.keys(ev).forEach(function (k) { values[k] = ev[k]; });
    values.firstName = joinNames_(g.names); // "Ama and Kwame" for a shared address
    values.note = note;
    values.subject = subject;
    values.couple = INVITE.couple;
    values.siteUrl = siteUrl;
    values.codeParam = codeParam;
    try {
      MailApp.sendEmail({
        to: email,
        subject: subject + ': Kwazi & Kwasi\'s wedding in Ghana',
        htmlBody: renderInvite_(template, values),
        body: guestEmailText_(values),
        name: INVITE.fromName,
      });
      g.rows.forEach(function (row) {
        const cell = sh.getRange(row, RSVP_COL.emailsSent);
        const prev = String(cell.getValue());
        cell.setValue(prev ? prev + '\n' + stamp : stamp);
      });
      sent++;
    } catch (err) {
      failed.push(email);
    }
  }
  SpreadsheetApp.flush();
  let summary = 'Sent "' + subject + '" to ' + sent + ' address' + (sent === 1 ? '' : 'es') + '.';
  if (failed.length) summary += '\n\nCouldn\'t send to:\n' + failed.join('\n');
  const left = pending.length - sent - failed.length;
  if (left > 0) summary += '\n\n' + left + ' still to send. Run this again tomorrow with the same subject.';
  ui.alert('Done', summary + missingNote, ui.ButtonSet.OK);
}

function guestEmailText_(v) {
  return [
    'Dear ' + v.firstName + ',',
    '',
    v.note || 'Thank you for confirming that you\'ll be joining us. Here are the details for our wedding in Accra.',
    '',
    v.date,
    'Wedding ceremony: ' + v.ceremonyVenue + ', ' + v.ceremonyLocation + ' (' + v.ceremonyTime + ')',
    'Wedding reception: ' + v.receptionVenue + ', ' + v.receptionLocation + ' (' + v.receptionTime + ')',
    'Attire: formal and elegant.',
    '',
    'Wedding details: ' + v.siteUrl + '/celebrations/ghana?code=' + v.codeParam,
    'Travel guide and airport pickup: ' + v.siteUrl + '/travel/ghana?code=' + v.codeParam,
    '',
    'With love,',
    v.couple,
  ].join('\n');
}

// ---------- Helpers ----------

/** "Ama", "Ama and Kwame", "Ama, Kwame and Esi" (duplicates removed). */
function joinNames_(names) {
  const unique = names.filter(function (n, i) { return names.indexOf(n) === i; });
  if (unique.length < 2) return unique[0] || 'friend';
  return unique.slice(0, -1).join(', ') + ' and ' + unique[unique.length - 1];
}

function siteUrl_() {
  const url = String(PropertiesService.getScriptProperties().getProperty('SITE_URL') || '').replace(/\/+$/, '');
  return /^https:\/\//.test(url) ? url : '';
}

/** The website address, or null after telling the couple how to set it. */
function requireSiteUrl_() {
  const url = siteUrl_();
  if (!url) {
    SpreadsheetApp.getUi().alert(
      'Website address needed',
      'Add a script property named SITE_URL with the live website address (starting with https://) under Project Settings → Script properties.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return null;
  }
  return url;
}

function firstName_(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'friend';
}
