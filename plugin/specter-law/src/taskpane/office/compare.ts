// Office.js interaction logic for Word document comparison
/* global Word */

export async function compareDocuments(filePath: string, documentCompareOptions?: Word.DocumentCompareOptions): Promise<void> {
  try {
    await Word.run(async (context) => {
      // Set change tracking mode to track all changes before comparing
      context.document.changeTrackingMode = Word.ChangeTrackingMode.trackAll;
      await context.sync();
      context.document.compare(filePath, documentCompareOptions);
      await context.sync();
    });
  } catch (error) {
    // You may want to surface this error to the UI in the future
    console.error("Error comparing documents:", error);
    throw error;
  }
}
