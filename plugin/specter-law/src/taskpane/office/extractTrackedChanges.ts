// Extracts all tracked changes from the Word document using Office.js
// Returns an array of objects with type, author, date, and text
export async function extractTrackedChanges(): Promise<Array<{ key: string; type: string; author: string; date: string; text: string }>> {
  return Word.run(async (context) => {
    const body = context.document.body;
    const trackedChanges = body.getTrackedChanges();
    trackedChanges.load("items,type,author,date");
    await context.sync();

    // Load the range text for each tracked change
    const ranges = trackedChanges.items.map(tc => tc.getRange());
    ranges.forEach(r => r.load("text"));
    await context.sync();

    return trackedChanges.items.map((tc, i) => ({
      key: String(i), // Use array index as a fallback unique key
      type: tc.type,
      author: tc.author,
      date: tc.date ? tc.date.toString() : "",
      text: ranges[i].text
    }));
  });
}
