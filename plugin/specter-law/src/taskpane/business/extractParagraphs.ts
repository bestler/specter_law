// Business logic for extracting paragraphs from the current Word document
// This function uses Office.js to get all paragraphs and returns them as an array of strings
/* global Word */

export async function extractParagraphs(): Promise<string[]> {
  return Word.run(async (context) => {
    const body = context.document.body;
    const paragraphs = body.paragraphs;
    paragraphs.load("items");
    await context.sync();
    paragraphs.items.forEach(p => p.load("text"));
    await context.sync();
    return paragraphs.items.map(p => p.text);
  });
}

export async function extractDocumentObject(): Promise<any> {
  return Word.run(async (context) => {
    // Attempt to serialize the context.document object
    // Note: Only loaded properties will be available
    const doc = context.document;
    doc.body.load();
    doc.properties.load();
    await context.sync();
    // Return a shallow serialization of the document object
    return {
      properties: doc.properties,
      body: {
        text: doc.body.text
      }
    };
  });
}
