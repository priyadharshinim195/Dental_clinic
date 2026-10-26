/*
  EDIT THIS FILE to connect the clinic's real details.
  Leave a value empty ("") until you have the real information.
  Nothing here is shown as real until you fill it in.
*/
window.CLINIC_CONFIG = {
  // One place for all contact details. These values feed:
  //   - navbar WhatsApp icon, Book via WhatsApp button  -> whatsappNumber
  //   - Call Clinic button                               -> phone
  //   - contact section, footer and map                  -> address
  //   - Get Directions                                   -> mapsUrl (or built from address)
  // Leave any value empty until the real information is available.
  // Contact details (shown in the Contact section and footer when filled in)
  address: "",          // e.g. "12 Example Road, Area, City, PIN"
  phone: "1234567890",            // e.g. "+91 00000 00000"
  email: "",            // e.g. "hello@example.com"
  hours: "",            // e.g. "Mon–Sat, 9:00 AM – 7:00 PM"

  // Google Maps link for "Get Directions" (e.g. https://maps.google.com/?q=...)
  mapsUrl: "https://maps.app.goo.gl/9bKrS4fEmxhuFK5H9?g_st=aw",

  // Booking submission. Use ONE of these options:
  //
  // Option A (recommended): a real backend or form service endpoint that accepts
  // a JSON POST and emails/stores the request, e.g. Formspree, Google Apps Script,
  // or your own server. Example: "https://formspree.io/f/your-id"
  submitUrl: "",
  //
  // Option B: send requests via WhatsApp. The patient taps "Send" in WhatsApp
  // themselves, so it is not confirmed until the clinic replies.
  // Digits only with country code, e.g. "919876543210"
  whatsappNumber: "1234567890"
};
