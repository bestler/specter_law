// Business logic for extracting paragraphs from the current Word document
// This function uses Office.js to get all paragraphs and returns them as an array of strings
/* global Word */

export async function extractParagraphs(): Promise<string[]> {
  return Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load("items/text");
    await context.sync();
    return paragraphs.items.map(p => p.text);
  });
}
