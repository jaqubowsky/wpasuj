type LogLine = { level: "info" | "error"; message: string } & Record<string, string | number | boolean | undefined>;

export function writeLogLine(line: LogLine) {
  const write = line.level === "error" ? console.error : console.log;

  write(JSON.stringify(line));
}
