import * as React from "react";

interface CompareDocumentProps {
  onCompare: (filePath: string) => void;
}

export const CompareDocument: React.FC<CompareDocumentProps> = ({ onCompare }) => {
  const [filePath, setFilePath] = React.useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // For security, browsers only provide a fake path or the file name, not the full local path.
      // Office.js Word API requires an absolute path or online URL, so this is a limitation in browser add-ins.
      // Here, we just use the file name for demonstration.
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
        (Note: Due to browser security, only the file name is available. For full path, use a trusted location or online file.)
      </div>
    </div>
  );
};
