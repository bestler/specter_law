import * as React from "react";

// Entry point for the React UI (Taskpane)

export default function App() {
  const handleInsert = async () => {
    // Dynamically import the Office.js API logic
    const { insertTextToWord } = await import("../office/officeApi");
    insertTextToWord("Hello from your Word Add-in!");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Word Add-in Test</h2>
      <button onClick={handleInsert}>Insert Test Word</button>
    </div>
  );
}
