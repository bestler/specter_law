// Extracts all tracked changes from the Word document using Office.js
// Returns an array of objects with type, author, date, text, paragraphIndex, and rangeIndex
export async function extractTrackedChanges(): Promise<Array<{ key: string; type: string; author: string; date: string; text: string; paragraphIndex: number }>> {
  return Word.run(async (context) => {
    const body = context.document.body;
    const paragraphs = body.paragraphs;
    paragraphs.load("items");
    await context.sync();
    paragraphs.items.forEach(p => p.load("text"));
    await context.sync();

    const results: Array<{ key: string; type: string; author: string; date: string; text: string; paragraphIndex: number }> = [];
    let changeCounter = 0;
    for (let pIdx = 0; pIdx < paragraphs.items.length; pIdx++) {
      const para = paragraphs.items[pIdx];
      const paraTrackedChanges = para.getTrackedChanges();
      paraTrackedChanges.load("items,type,author,date");
      await context.sync();
      for (let tcIdx = 0; tcIdx < paraTrackedChanges.items.length; tcIdx++) {
        const tc = paraTrackedChanges.items[tcIdx];
        const tcRange = tc.getRange();
        tcRange.load("text");
        await context.sync();
        results.push({
          key: `${pIdx}-${tcIdx}`,
          type: tc.type,
          author: tc.author,
          date: tc.date ? tc.date.toString() : "",
          text: tcRange.text,
          paragraphIndex: pIdx
        });
        changeCounter++;
      }
    }
    return results;
  });
}
