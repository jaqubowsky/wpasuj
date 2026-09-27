const PEOPLE = ["Kuba", "Ola", "Michał", "Zuza", "Bartek", "Kasia"];

const HOURS = [17, 18, 19, 20, 21, 22];

const FREE = {
  "0": [[0, 1, 2], [1, 2, 3, 4], [], [0, 1, 2, 3], [2, 3, 4, 5], [1, 2, 3]],
  "1": [[2, 3, 4, 5], [0, 1], [1, 2, 3, 4, 5], [2, 3, 4], [2, 3, 4, 5], [1, 2, 3, 4]],
  "2": [[0, 1], [0, 1, 2], [0, 1, 2], [], [0, 1], [0]],
};

function countAt(day, hourIndex) {
  const names = [];
  PEOPLE.forEach((name, p) => {
    if ((FREE[day][p] || []).includes(hourIndex)) names.push(name);
  });
  return names;
}

function bucket(n, total) {
  if (n === 0) return "";
  const share = n / total;
  if (share <= 0.2) return "h1";
  if (share <= 0.4) return "h2";
  if (share <= 0.6) return "h3";
  if (share <= 0.8) return "h4";
  return "h5";
}

function renderGrid(el, { days, cell, timeCol, mode, mine, add, best, counts }) {
  el.style.gridTemplateColumns = `${timeCol}px repeat(${days.length}, 1fr)`;
  el.style.gridTemplateRows = `auto repeat(${HOURS.length}, ${cell}px)`;
  const parts = [`<div></div>`];
  days.forEach((d) => parts.push(`<div class="dh"><div class="wd">${d.wd}</div><div class="dn">${d.dn}</div></div>`));
  HOURS.forEach((h, s) => {
    parts.push(`<div class="tl">${h}:00</div>`);
    days.forEach((_, i) => {
      const cls = ["c"];
      let label = "";
      if (mode === "heat") {
        const n = countAt(String(i), s).length;
        const b = bucket(n, PEOPLE.length);
        if (b) cls.push(b);
        if (n === PEOPLE.length) cls.push("all");
        if (counts && n > 0) label = n;
      }
      if (mode === "mine" && mine(i, s)) cls.push("mine");
      if (add && add(i, s)) cls.push("add");
      if (best && best(i, s)) cls.push("best");
      parts.push(`<div class="${cls.join(" ")}">${label}</div>`);
    });
  });
  el.innerHTML = parts.join("");
}
