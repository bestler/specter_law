// ...existing code...

export async function insertTextToWord(text: string) {
  try {
    await Word.run(async (context) => {
      const body = context.document.body;
      body.insertParagraph(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error inserting text:", error);
  }
}

// ...existing code...
