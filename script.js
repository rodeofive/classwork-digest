const DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vTqAVTZ3CEh6HCcBfqnzXfVcY172xtQqxau19mgJLA_i5SecbHHJ1ZRrIFCzpU37JCx_D0_Xnl5ArIs/pub?urp=gmail_link";

const teachers = {
  "Ramsey": { key: "ELA", css: "ela" },
  "Raffauf": { key: "Math", css: "math" },
  "Mattia": { key: "Science", css: "science" },
  "O'Brien": { key: "Global Studies", css: "global" },
};

async function loadCalendar() {
  try {
    const res = await fetch(DOC_URL);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Grab all table rows
    const rows = Array.from(doc.querySelectorAll("table tr"));

    // Container
    const calEl = document.getElementById("calendar");
    calEl.innerHTML = "";

    // Build a 5-day week (Mon–Fri)
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
    const week = {};
    days.forEach(d => { week[d] = []; });

    // Parse each row
    rows.forEach(tr => {
      const text = tr.innerText.trim();
      if (!text) return;

      // Look for teacher names
      for (let t in teachers) {
        if (text.includes(t)) {
          // crude date detection
          let day = days.find(d => text.includes(d));
          if (!day) {
            // fallback: put undated into Friday
            day = "Friday";
          }
          week[day].push({
            teacher: teachers[t].key,
            css: teachers[t].css,
            desc: text.replace(/\s+/g," "),
          });
        }
      }
    });

    // Render
    for (let d of days) {
      const box = document.createElement("div");
      box.className = "day";
      box.innerHTML = `<h2>${d}</h2>`;
      week[d].forEach(item => {
        box.innerHTML += `<div class="item ${item.css}"><strong>${item.teacher}:</strong> ${item.desc}</div>`;
      });
      calEl.appendChild(box);
    }
  } catch (err) {
    document.getElementById("calendar").innerText = "Error loading calendar: " + err;
  }
}

loadCalendar();
