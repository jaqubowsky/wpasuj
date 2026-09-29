const polls = [
  { title: "Grill u Oli", when: "sb 3.10", people: "6 osób", tone: "coral" },
  { title: "Planszówki", when: "pt 17, 20:00", people: "5 osób", tone: "ink" },
  { title: "Urodziny Zuzy", when: "pt 24, 21:00", people: "12 osób", tone: "peach" },
  { title: "Tatry", when: "15–17.11", people: "8 osób", tone: "deep" },
  { title: "Kino", when: "czw 9, 19:30", people: "4 osoby", tone: "paper" },
  { title: "Karaoke u Kasi", when: "sb 25, 21:00", people: "9 osób", tone: "pink" },
  { title: "Orlik", when: "nd 12, 10:00", people: "10 osób", tone: "ink" },
  { title: "Escape room", when: "pt 17, 20:00", people: "6 osób", tone: "coral" },
  { title: "Wigilia klasowa", when: "19.12, 18:00", people: "22 osoby", tone: "peach" },
  { title: "Próba zespołu", when: "wt 7, 18:00", people: "5 osób", tone: "deep" },
  { title: "Pizza po pracy", when: "śr 8, 17:30", people: "7 osób", tone: "paper" },
  { title: "Spacer z psami", when: "sb 11, 9:00", people: "3 osoby", tone: "pink" },
] as const;

export const posters = polls.map((poll, index) => ({
  ...poll,
  heat: Array.from({ length: 10 }, (_, tile) => (tile * 7 + index * 5) % 6),
}));
