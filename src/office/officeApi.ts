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

/**
 * Compares the current Word document with another document at the given file path.
 * Uses default options for the comparison.
 * @param filePath Absolute path (local or online) to the document to compare with.
 */
export async function compareDocumentWith(filePath: string) {
  try {
    await Word.run(async (context) => {
      const options: Word.DocumentCompareOptions = {
        compareTarget: Word.CompareTarget.compareTargetCurrent,
        detectFormatChanges: true,
        // All other options left as default
      };
      context.document.compare(filePath, options);
      await context.sync();
      // eslint-disable-next-line no-console
      console.log("Differences shown in the current document.");
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error comparing documents:", error);
  }
}

// ...existing code...
