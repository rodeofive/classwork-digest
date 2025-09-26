const DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vTqAVTZ3CEh6HCcBfqnzXfVcY172xtQqxau19mgJLA_i5SecbHHJ1ZRrIFCzpU37JCx_D0_Xnl5ArIs/pub?urp=gmail_link";

const teachers = {
  "Morrison": { key: "ELA", css: "ela" },
  "Raffauf": { key: "Math", css: "math" },
  "Mattia": { key: "Science", css: "science" },
  "O'Brien": { key: "Global Studies", css: "global" },
};

// Simple date patterns
const dateRegexes = [
  /\b(\d{1,2})\/(\d{1,2})\b/,                    // 9/30
  /\b([A-Z][a-z]+)\.? (\d{1,2})\b/,              // Sept 30 or September 30
  /\b(Monday|Tuesday|Wednesday|Thursday|Friday)\b/i, // weekday only
];

function parseDate(text) {
  const today = new Date();

  for (let regex of dateRegexes) {
    const match = text.match(regex);
    if (!match) continue;

    // case 1: MM/DD
    if (regex === dateRegexes[0]) {
      let [_, m, d] = match;
      return new Date(today.getFullYear(), parseInt(m) - 1, parseInt(d));
    }

    // case 2: Month DD
    if (regex === dateRegexes[1]) {
      let [_, monthStr, d] = match;
      const monthNames = ["January","February","March","April","May","June",
        "July","August","September","October","November","December"];
      let m = monthNames.findIndex(mn => mn.startsWith(monthStr));
      return new Date(today.getFullYear(), m, parseInt(d));
    }

    // case 3: Weekday only → find next occurrence
    if (regex === dateRegexes[2]) {
      let weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      let targetDay = weekday.findIndex(w => w.toLowerCase() === match[1].toLowerCase());
      let date = new Date(today);
      while (date.getDay() !== targetDay) {
        date.setDate(date.getDate() + 1);
      }
      return date;
    }
  }

  return null;
}

async function loadCalendar() {
  try {
    const res = await fetch(DOC_URL);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const rows = Array.from(doc.querySelectorAll("table tr"));
    const assignments = [];

    rows.forEach(tr => {
      const text = tr.innerText.trim();
      if (!text) return;

      for (let t in teachers) {
        if (text.includes(t)) {
          let date = parseDate(text);
          let clean = text.replace(t, "").replace(/\s+/g, " ").trim();
          assignments.push({
            teacher: teachers[t].key,
            css: teachers[t].css,
            desc: clean,
            date: date ? date.toDateString() : "Undated",
          });
        }
      }
    });

    // Group by date
    const grouped = {};
    assignments.forEach(a => {
      if (!grouped[a.date]) grouped[a.date] = [];
      grouped[a.date].push(a);
    });

    // Render
    const calEl = document.getElementById("calendar");
    calEl.innerHTML = "";

    Object.keys(grouped).sort((a,b) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return new Date(a) - new Date(b);
    }).forEach(dateStr => {
      const box = document.createElement("div");
      box.className = "day";
      box.innerHTML = `<h2>${dateStr}</h2>`;
      grouped[dateStr].forEach(item => {
        box.innerHTML += `<div class="item ${item.css}"><strong>${item.teacher}:</strong> ${item.desc}</div>`;
      });
      calEl.appendChild(box);
    });

  } catch (err) {
    document.getElementById("calendar").innerText = "Error loading calendar: " + err;
  }
}

loadCalendar();
