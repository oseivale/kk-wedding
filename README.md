# Kwazi & Kwasi — wedding website

Next.js 16 (App Router, TypeScript, React 19.2). Guest responses go to a Google Sheet the couple owns, so managing RSVPs and airport pickups is just opening a spreadsheet.

| Page | Route |
| --- | --- |
| Home | `/` |
| Our story | `/our-story` |
| Botswana wedding | `/celebrations/botswana` |
| Ghana wedding | `/celebrations/ghana` |
| Ghana RSVP | `/rsvp` |
| First time in Botswana? | `/travel/botswana` |
| First time in Ghana? (with airport pickup form) | `/travel/ghana` |
| FAQ | `/faq` |
| Wedding gifts | `/gifts` |

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables set, the site runs in **preview mode**: a banner says so, the forms work, nothing is saved, and the invitation code `DEMO2027` opens the RSVP and the gated pages.

## Editing content

Almost everything that changes lives in **`src/lib/site.ts`**:

- **Photos.** Put image files in `public/images/` and set the paths in `photos`, e.g. `hero: "/images/hero.jpg"`. Portrait shots (about 3:4) suit the arched frames. Until a path is set, a monogram placeholder shows.
- **Times and venues.** Ceremony times, the Ghana reception venue and its map link are marked "To be confirmed" and are one-line changes.
- **RSVP deadline.** Set `rsvp.deadlineLabel` (e.g. `"January 15, 2027"`) to show it on the RSVP page.
- **E-transfer email.** Set `gifts.etransferEmail`. Until then the gifts page shows "Coming soon".

Page wording lives in each page file under `src/app/`.

## Invitation-code gate

The home page, Our story and the RSVP page are public. Everything with event details needs the invitation code:

- both wedding pages
- both travel guides, including the airport pickup form
- the FAQ
- the gifts page

One code covers both weddings. The home page shows only the cities, not the venues.

- **First visit:** a guest opening a gated page sees the **Enter your invitation code** screen. Once they enter the code, the browser stays unlocked for 6 months; change this with `gate.rememberDays` in `src/lib/site.ts`. Entering the code on the RSVP page unlocks the site too.
- **Unlock links:** every website link in the invitation and official emails includes the code (`?code=...`), so guests who click them never have to type it. The site removes the code from the address bar straight away. The Botswana invitation also shows the code, for guests who visit later without the link.
- **Who checks it:** the server, in `src/proxy.ts`, before the page is sent. Gated details never reach a browser without the code. The airport pickup form's API is gated the same way.
- **Remembering the device:** a cookie holding a signed token (see `src/lib/access.ts`). Page scripts can't read it, and it can't be faked without `ACCESS_SECRET`.
- **Lost codes:** the code screen tells guests to ask the couple. To give a specific contact instead, set `gate.contact` in `src/lib/site.ts`, e.g. `"WhatsApp Kwazi on +1 416 555 0123"`.
- **Changing what's gated:** edit `gate.protectedPaths` in `src/lib/site.ts`.
- **If the code leaks:** change `INVITE_CODE` (in the website settings *and* the Apps Script property) and redeploy. Every device is locked out until it enters the new code; send guests the new code.

## Fonts

Three free Google Fonts, loaded with Next.js's `next/font`. They're downloaded at build time and served from the site itself, with no requests to Google from guests' browsers.

- **Prata:** headings.
- **Fahkwang:** body copy, buttons, forms, and the small italic touches like the tagline and "With love". Uses the Light (300), Regular (400) and Medium (500) weights.
- **Alex Brush:** the couple's names only: the big home-page heading, the "With love" sign-offs, the footer monogram and the photo placeholders. A script is hard to read in longer headings, so it's kept to the names.

The fonts are set in `src/app/layout.tsx`, and which one each element uses is set by `--font-display`, `--font-body` and `--font-script` at the top of `globals.css`. Prata and Alex Brush come in one weight each, so headings stay at regular weight rather than being faked bold.

The invitation emails keep Georgia and Arial: Gmail and Outlook don't load custom fonts.

## Colours and botanical accents

The palette is ivory, gold, olive green and emerald green. Every colour is defined once at the top of `src/app/globals.css`, in two groups:

- **Palette:** the actual shades (`--emerald`, `--olive`, `--gold` and so on).
- **Roles:** what each shade is used for, e.g. `--accent` (buttons, links, countdown numbers), `--band` (alternating section background), `--footer-bg`, `--label` (small italic labels) and `--botanical` (leaf line art). To change where a colour appears, point a role at a different shade. To adjust a shade, change it once in the palette.

Gold is kept to lines and ornaments, because it's too light for small text on ivory. All text colours meet WCAG AA contrast.

**Botanical accents (currently off).** Olive leaf-and-vine line art is built in but switched off. To turn it on, set `decorations.botanicals` to `true` in `src/lib/site.ts`. It then appears climbing around the home-page photo (growing in once on page load), in the section dividers on every page, in two corners of the welcome section and faintly in the footer. The art is in `src/components/Botanical.tsx`, and how strong it looks is set in the "Botanical line art" section of `globals.css`.

The emails can use a matching leaf divider, `public/email/divider.png`. To use it, replace the divider row under the couple's names in both email templates with:

```html
<tr><td align="center" style="padding:18px 0 6px;">
  <img src="{{siteUrl}}/email/divider.png" width="300" height="52" alt="" style="display:block;width:300px;max-width:80%;height:auto;border:0;">
</td></tr>
```

The image loads from the live website, so the site has to be deployed before those emails are sent.

## Connecting the Google Sheet (about 10 minutes)

1. **Create the sheet.** In the couple's Google account, create a blank Google Sheet (e.g. "Wedding guests").
2. **Add the script.** Open **Extensions → Apps Script**, delete the sample code, and paste in everything from `apps-script/Code.gs`. Save.
3. **Run setup.** Choose `setup` in the function dropdown and press **Run**. Approve the permissions prompt; it needs the sheet and Google Drive (for flight itinerary uploads). This creates the *Summary*, *Ghana RSVPs* and *Airport pickup* tabs and a private Drive folder for itineraries.
4. **Add the shared secret.** Generate a random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   In Apps Script go to **Project Settings → Script properties → Add script property**. Name it `SHARED_SECRET` and paste the string as its value.
5. **Deploy.** **Deploy → New deployment → Web app**. Set *Execute as*: **Me**, *Who has access*: **Anyone**. Deploy and copy the URL ending in `/exec`.
   "Anyone" is needed so the website's server can reach it; requests without the secret are rejected.
6. **Set the website's environment variables** (in `.env.local` locally, and in your host's dashboard for the live site):
   ```
   INVITE_CODE=the code in the invitations
   ACCESS_SECRET=another long random string (generate it the same way as in step 4)
   APPS_SCRIPT_URL=https://script.google.com/macros/s/…/exec
   APPS_SCRIPT_SECRET=the same string as SHARED_SECRET
   ```
7. Redeploy the site. The preview banner disappears and responses start arriving in the sheet.

If you ever edit `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Sending email invitations

The same Google Sheet sends the invitations: one email template for Ghana (with the RSVP link and invitation code) and one for Botswana (no RSVP needed, with links to the details and travel pages). Emails come from the couple's own Gmail, so replies go straight to them.

**One-time setup**

1. In Apps Script, add three more files with the **+** button next to *Files*:
   - a **Script** named `Invitations`: paste `apps-script/Invitations.gs`
   - an **HTML** file named `InviteGhana`: paste `apps-script/InviteGhana.html`
   - an **HTML** file named `InviteBotswana`: paste `apps-script/InviteBotswana.html`
2. Add two more **Script properties**: `SITE_URL` (the live website address, e.g. `https://kwaziandkwasi.com`) and `INVITE_CODE` (the same code as the website's `INVITE_CODE`).
3. Reload the Google Sheet. A **Wedding invitations** menu appears. Choose **Set up the Invitations tab** and approve the permission to send email.

**Sending**

1. In the *Invitations* tab, add one row per guest: name, email, and tick **Invite to Ghana** and/or **Invite to Botswana**. A guest invited to both gets two separate emails.
2. Choose **Send a test of both emails to me** and check them on a phone and a computer.
3. Choose **Send Ghana invitations** or **Send Botswana invitations**. You'll be asked to confirm how many will go out.

Each send is stamped with the date in *Ghana sent* / *Botswana sent*, so running it again only emails new guests. Add late guests at any time and send again. Rows with a mistyped email or an email listed twice are skipped and explained in *Notes*.

**Daily limit:** a regular Gmail account can email about **100 recipients a day** (the test counts as 2). If the list is longer, sending stops at the limit and tells you how many are left; run it again the next day. **Check who hasn't been sent yet** shows what's left and today's remaining allowance.

**Changing the wording or details:** event details (times, reception venue, RSVP deadline) are at the top of `Invitations.gs` in the `INVITE` settings. The wording is in the two HTML files; anything in `{{double braces}}` is filled in automatically. Fill in the ceremony times and reception venue before sending. They currently say "to be confirmed".

To resend one guest's invitation, clear their date in the *sent* column and send again.

## Emailing confirmed Ghana guests

Guests who accept on the Ghana RSVP must give an email address; guests who decline can leave it blank. Nothing is emailed when someone RSVPs. Their response and email are saved in *Ghana RSVPs*, and the couple sends the official wedding details to all confirmed guests when they're ready.

**Setup:** in Apps Script, add two more files with the **+** button:

- a **Script** named `GuestEmails`: paste `apps-script/GuestEmails.gs`
- an **HTML** file named `GuestEmailGhana`: paste `apps-script/GuestEmailGhana.html`

It needs the `SITE_URL` script property (see "Sending email invitations"). After adding the files, deploy a new version: **Deploy → Manage deployments → Edit → New version**.

**Sending:** in the sheet, choose **Wedding invitations → Email confirmed Ghana guests**.

1. Enter a subject, e.g. "Official wedding details".
2. Optionally add a short personal note.
3. Confirm how many emails will go out.

The email includes the date, the ceremony and reception details, the attire note, and links to the wedding page and the travel guide. The details come from the `INVITE.ghana` settings at the top of `Invitations.gs`, so update times and venues there before sending.

- **Who gets it:** everyone who joyfully accepted. A couple who share one email address get one email addressed to both of them ("Dear Ama and Kwame").
- **No repeats:** each send is recorded in *Emails sent*, so the same subject never goes to anyone twice. Guests who RSVP later can be caught up by running it again with the same subject. A different subject (e.g. "One week to go") goes to everyone again.
- **Missing emails:** if any confirmed guests have no email (e.g. rows typed in by hand), you'll be told how many before sending. The *Summary* tab also shows "Attending guests missing an email".
- **Daily limit:** this shares Gmail's ~100-a-day limit with the invitations. A larger list stops cleanly at the limit; run it again the next day with the same subject to finish.

## What the couple sees in the sheet

- **Summary:** adults attending, children attending, total head count, declines, flagged duplicates, pickup requests and pickups needing a re-check.
- **Ghana RSVPs:** one row per adult. If a name or child appears twice, the *Possible duplicate* column says which rows to compare. Nothing is blocked, so the couple decides which to keep. *Email* holds the guest's address, and *Emails sent* lists which official emails they've had, with dates. Sheets set up before these columns existed get them automatically.
- **Airport pickup:** one row per WhatsApp number. If a guest sends the form again with the same number, that row is updated, the old flight details go into *Change history*, and *Pickup status* changes to "Flight changed: re-check". The couple uses *Pickup status* (New / Confirmed / Not available) and *Notes* to track arrangements. Itinerary screenshots are linked from the row and stored in the couple's private Drive folder.

New pickup requests close at the end of January 15, 2027 (Accra time). After that, guests who already sent one can still update their flight details.

## Deploying

Any Next.js host works. The simplest is **Vercel**: push this folder to a GitHub repo, import it at vercel.com/new, add the four environment variables from `.env.example`, and deploy. Leave them out to deploy in preview mode first. A custom domain can be added in the Vercel project settings.

## Security notes

- The invitation code, Apps Script URL and secret only live on the server, never in the browser. The code is checked again when the RSVP is sent, not only on the first step.
- A single shared code can be passed on to people who weren't invited. That's the trade-off of one code for everyone. If it leaks, change `INVITE_CODE` and redeploy.
- Code guessing and spam are slowed by a per-connection rate limit and a hidden honeypot field. On serverless hosts the rate limit is per instance, so it's best-effort.
- Values that start with `=`, `+`, `-` or `@` are neutralised before they reach the sheet, so a guest can't inject spreadsheet formulas.
- Itinerary uploads are limited to JPG, PNG, WEBP, HEIC and PDF up to 4 MB. They're stored in a Drive folder only the couple can see. The form asks guests to hide booking references and payment details first.
- The site asks search engines not to index it (`robots: noindex`), so guests reach it through the link you share.
- Share edit access to the Google Sheet only with people who need guest details: it holds names, email addresses, children's names and WhatsApp numbers. Anyone with edit access to the Apps Script can also send email as the couple.
- The invitation code is in both invitation emails and in their links. Anyone a guest forwards an email to can get in, so the gate keeps details from strangers and search engines, not from someone a guest chooses to share with. If it leaks, change it (see "Invitation-code gate").
- Redirects after entering the code only go to pages on this site, so the code screen can't be used to send people elsewhere.
- Names typed into the guest list are escaped before they go into the email, so a stray `<` or `&` can't break the layout.
- Anyone with the invitation code could type someone else's email into the RSVP form. Nothing is emailed at RSVP time, so this can't be used to flood an inbox. Glance down the *Email* column before sending the official email, and delete any address that looks wrong.
- Guest emails are stored only in the couple's Google Sheet and are used only for the official wedding emails. Delete the sheet (or the *Email* column) after the wedding.
