const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a date as "03-June-2026": zero-padded day, full month name, 4-digit
 *  year. Parses "YYYY-MM-DD" as a LOCAL date (split → new Date(y, m-1, d)) to
 *  avoid a timezone off-by-one; tolerates full ISO datetimes and blank values. */
export function longDate(value) {
  if (!value) return "";
  const s = String(value);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

/** Today's date as "YYYY-MM-DD" in LOCAL time (for the Today button). */
export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
