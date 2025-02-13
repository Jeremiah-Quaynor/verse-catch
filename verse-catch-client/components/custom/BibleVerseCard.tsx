import React from "react";

interface BibleVerseCardProps {
  verse: string;
  reference: string;
  bibleVersion?: string;
}
function BibleVerseCard({
  verse ="",
  reference = "",
  bibleVersion = "",
}: BibleVerseCardProps) {
  return (
    <div className="space-y-2 ">
      <p className="text-lg font-semibold">
        {reference} {"("}
        {bibleVersion}
        {")"}
      </p>
      <p className="text-sm font-light">{verse}</p>
    </div>
  );
}

export default BibleVerseCard;
