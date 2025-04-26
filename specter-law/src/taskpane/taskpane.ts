/* global Word console */

export async function insertText(text: string) {
  // Write text to the document.
  try {
    await Word.run(async (context) => {
      let body = context.document.body;
      body.insertParagraph(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
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
      const options = {
        compareTarget: Word.CompareTarget.compareTargetCurrent,
        detectFormatChanges: true,
      };
      context.document.compare(filePath, options);
      await context.sync();
      console.log("Differences shown in the current document.");
    });
  } catch (error) {
    console.log("Error comparing documents: " + error);
  }
}
