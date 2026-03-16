const text = `[
  {"raw_name": "حنان أحمد", "date": "2025-02-22", "check_in": "07:11", "check_out": "15:32", "confidence": 0.9},
  {"raw_name": "مديحة", "date": "2025-02-22", "check_in": "07:40", "check_out": "15:32", "confidence": 0.9},
  {"raw_name": "إيمان رشاد", "date": "2025-02-22", "check_in": "07:30", "check_out": "15:50", "confidence": 0.9},
  {"raw_name": "فايزه عبد الكريم", "date": "2025-02-22", "check_in": "07:10", "check_out": "15:57", "confidence": 0.9},
  {"raw_name": "خلود", "date": "2025-02-22", "check_in": "07:12", "check_out": "15:13", "confidence": 0.9},
  {"raw_name": "نجوي إبراهيم", "date": "`;

const regex = /{[^{}]*}/g;
const matches = text.match(regex);
console.log("Matches:", matches);

if (matches) {
  const extractedData = matches.map(m => {
    try {
      return JSON.parse(m);
    } catch (err) {
      console.error("Failed to parse:", m, err.message);
      return null;
    }
  }).filter(Boolean);
  console.log("Extracted:", extractedData.length);
}
