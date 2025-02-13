interface VerseReference {
  book: string;
  chapter: string;
  verses: string[];
}

function parseReference(reference: string): VerseReference {
  const [book, chapterAndVerses] = reference.split(" ");
  const [chapter, verses] = chapterAndVerses.split(":");
  const verseList = verses.split("-");
  return {
    book,
    chapter,
    verses: verseList,
  };
}
export { parseReference };
