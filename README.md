# Ajitha Dental Clinic — Website

Open `index.html` in a browser, or upload the whole folder to any web host.

## Files
- `index.html` — all sections
- `styles.css` — forest green / sage / ivory / champagne gold design
- `script.js` — hero frame animation, navigation, testimonials, appointment form
- `config.js` — **the only file you need to edit** (clinic details and booking connection)
- `frames/` — 300 hero JPG frames (1280×720, frame_001–frame_300), used in the hero only

## Sections (in order)
Hero → About → Services (8 cards) → Case Studies → Why Choose Us → Appointment →
Testimonials → Gallery → Contact band → Footer

## Connecting the clinic's details
Open `config.js` and fill in the address, phone, email, hours and Google Maps link.
Empty values keep their placeholder text, so nothing is shown as real until you add it.

## Connecting the appointment form
Pick ONE option in `config.js`:
- **submitUrl** — a form service or backend that accepts a JSON POST (for example Formspree or a Google Apps Script web app). The confirmation message appears only after the server accepts the request.
- **whatsappNumber** — opens WhatsApp with the request pre-filled. The patient taps Send, so the request is not confirmed until the clinic replies.

If neither is set, the form says online booking is not connected yet and does not claim anything was sent.

## Replacing placeholders
- Images: each dashed box marks where a real image goes (About, Appointment, service cards, case studies, gallery). Replace the `<div class="media-placeholder">` with an `<img>` that has real alt text.
- Case studies: each "View Case Study" button opens an illustrative care journey in a dialog. These are not actual patient records or treatment results; confirm clinic-specific case details before publishing them as real cases.
- Testimonials: edit the `TESTIMONIALS` list in `script.js`. Leave `name` empty if there is no permission to show one. On desktop all cards show side by side; on small screens they become a carousel.
- Service descriptions are general and should be confirmed by the clinic.
- Social links: add them to the footer once the clinic provides them.

## Service photos
Service photos live in `images/` with these names (800 px wide, 4:3):
service-general-dentistry.jpg, service-teeth-cleaning.jpg, service-cosmetic-dentistry.jpg,
service-teeth-whitening.jpg, service-root-canal.jpg, service-dental-implants.jpg,
service-orthodontic-treatment.jpg, service-preventive-care.jpg.
Replace a file with the same name to change a photo; no code change is needed.

## Case study, gallery and appointment photos
Files in `images/`:
- case-01.jpg, case-02.jpg, case-03.jpg (photo area only; the printed text panel was removed to avoid duplicating the card text)
- gallery-01.jpg to gallery-06.jpg
- book-clinic-01.jpg (appointment photo)
Replace a file with the same name to change a photo.

## Contact links (WhatsApp, call, map)
All contact details are set in `config.js`. Nothing is invented; empty values keep the links disabled.
- `whatsappNumber`: digits only with country code, e.g. `919876543210`. Powers the navbar WhatsApp icon (desktop and mobile) and the "Book via WhatsApp" button.
- `phone`: e.g. `+91 98765 43210`. Powers the "Call Clinic" button (`tel:` link).
- `address`: full address. Shows the map in the Contact section and builds the Get Directions link.
- `mapsUrl`: optional Google Maps link for Get Directions (used instead of the address link when filled in).
