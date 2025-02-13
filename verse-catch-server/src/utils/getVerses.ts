import fs from "fs";
import path from "path";
import { parseReference } from "./parseReference";


function getVerses(reference: string): string {
  const biblePath = path.join(__dirname, "../bibles/NIV_bible.json");
  const bibleData = JSON.parse(fs.readFileSync(biblePath, "utf-8"));

  const { book, chapter, verses } = parseReference(reference);

  if (!bibleData[book] || !bibleData[book][chapter]) {
    throw new Error("Invalid reference");
  }

  const chapterData = bibleData[book][chapter];
  const result = verses.map((verse) => chapterData[verse]).join(" ");

  return result;
}

export { getVerses };
