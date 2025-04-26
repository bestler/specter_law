import * as React from "react";
import { CompareDocument } from "./CompareDocument";

// Entry point for the React UI (Taskpane)

export default function App() {
  const handleInsert = async () => {
    // Dynamically import the Office.js API logic
    const { insertTextToWord } = await import("../office/officeApi");
    insertTextToWord("Hello from your Word Add-in!");
  };

  const handleCompare = async (filePath: string) => {
    const { compareDocumentWith } = await import("../office/officeApi");
    compareDocumentWith(filePath);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Word Add-in Test</h2>
      <button onClick={handleInsert}>Insert Test Word</button>
      <CompareDocument onCompare={handleCompare} />
    </div>
  );
}
