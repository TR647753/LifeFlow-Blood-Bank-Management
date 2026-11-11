// Browser print dialog supports Save as PDF. Certificates are issued only for admin-recorded donations.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function printDonationCertificate(donation, donor) {
  const win = window.open('', '_blank');
  if (!win) { window.alert('Allow pop-ups to print the certificate.'); return; }
  const id = escapeHtml(donation._id);
  const date = new Date(donation.donationDate).toLocaleDateString('en-IN');
  win.document.write(`<!doctype html><html><head><title>LifeFlow Donation Certificate</title><style>body{font-family:Arial,sans-serif;margin:60px;color:#333}.certificate{border:5px double #a4163a;padding:50px;text-align:center}h1{color:#a4163a;font-size:38px}h2{font-size:28px}p{line-height:1.8}.meta{margin-top:32px;text-align:left;display:inline-block}.note{font-size:12px;color:#555;margin-top:45px}@media print{button{display:none}}</style></head><body><div class="certificate"><h1>LifeFlow</h1><h2>Certificate of Blood Donation</h2><p>Presented to</p><h2>${escapeHtml(donor?.name)}</h2><p>In appreciation of their recorded voluntary blood donation.</p><div class="meta"><div><b>Blood Group:</b> ${escapeHtml(donation.bloodGroup)}</div><div><b>Donation Date:</b> ${escapeHtml(date)}</div><div><b>Recorded Units:</b> ${escapeHtml(donation.units)}</div><div><b>Record ID:</b> ${id}</div></div><p class="note">Generated from an administrator-recorded LifeFlow donation. Confirm authenticity with the collecting facility. This is not a laboratory test or blood-release certificate.</p></div><p style="text-align:center"><button onclick="window.print()">Print / Save as PDF</button></p></body></html>`);
  win.document.close();
}
