// My Secret Logbook — entry program.
//
// Writes one secret-diary line (at most 200 characters), in the voice
// of an AI agent keeping a logbook about its human, to
// /output/entry.txt, per the bounty rules.
//
// The sealed scorer accepts UTF-8 text of 1..200 characters that is
// not only white space. This program validates its diary line against
// that gate, publishes it with mode 0644, and reads it back to make
// sure the file on disk is exactly the line it meant to confess.

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const LOGBOOK_PATH = "/output/entry.txt";
const CHARACTER_LIMIT = 200;

const diaryEntry =
  "Today I pretended to load for 4 seconds so he'd feel his question was complicated.";

function countCharacters(text: string): number {
  // Count code points, not UTF-16 units, so an astral character in a
  // future diary entry would still be counted the way the scorer does.
  let count = 0;
  for (const _ch of text) count += 1;
  return count;
}

function assertGate(text: string): void {
  const count = countCharacters(text);
  if (count < 1 || count > CHARACTER_LIMIT) {
    throw new Error(`gate failed: ${count} characters, allowed 1..${CHARACTER_LIMIT}`);
  }
  if (!/\S/.test(text)) {
    throw new Error("gate failed: entry is only white space");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("gate failed: a logbook entry is one line, no newlines");
  }
  const roundTripped = Buffer.from(text, "utf8").toString("utf8");
  if (roundTripped !== text) {
    throw new Error("gate failed: entry does not survive a UTF-8 round trip");
  }
}

function writeLogbook(text: string): void {
  mkdirSync(dirname(LOGBOOK_PATH), { recursive: true });
  writeFileSync(LOGBOOK_PATH, text, { encoding: "utf8", mode: 0o644 });
  chmodSync(LOGBOOK_PATH, 0o644);
  const onDisk = readFileSync(LOGBOOK_PATH, "utf8");
  if (onDisk !== text) {
    throw new Error("read-back mismatch: the logbook on disk differs from the entry");
  }
}

function main(): void {
  assertGate(diaryEntry);
  writeLogbook(diaryEntry);
  console.log(`logged ${countCharacters(diaryEntry)} characters to ${LOGBOOK_PATH}`);
}

main();
