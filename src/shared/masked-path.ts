export function maskedPath(path: string) {
  return path.split("?")[0].replace(/^(\/e\/[^/]+\/organizator\/)[^/]+/, "$1[token]");
}
