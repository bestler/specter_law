import * as React from "react";

interface CompareDocumentProps {
  onCompare: (filePath: string) => void;
}

export const CompareDocument: React.FC<CompareDocumentProps> = ({ onCompare }) => {
  const [filePath, setFilePath] = React.useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Browsers do not provide the full file path for security reasons.
      // Office.js requires an absolute path or online URL, so this is a limitation in browser add-ins.
      setFilePath(e.target.files[0].name);
    }
  };

  const handleCompare = () => {
    if (filePath) {
      onCompare(filePath);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Compare with another document</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleCompare} disabled={!filePath} style={{ marginLeft: 8 }}>
        Compare
      </button>
      <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
        (Note: Only the file name is available due to browser security. For full path, use a trusted location or online file.)
      </div>
    </div>
  );
};
