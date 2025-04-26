// UI for document comparison
import * as React from "react";
import { useState } from "react";
import { Button, Field, tokens, makeStyles } from "@fluentui/react-components";
import { compareDocuments } from "../office/compare";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
  },
  inputField: {
    marginBottom: "10px",
    minWidth: "300px",
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    marginTop: "10px",
  },
});

const DocumentCompare: React.FC = () => {
  const styles = useStyles();
  const [filePath, setFilePath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handler for file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      // On web, browsers do not provide the full file path for security reasons.
      // We'll use the file name for display, but this will not work for Office.js compare API directly.
      setFilePath(file.name);
    } else {
      setFilePath("");
    }
  };

  const handleCompare = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!filePath) {
        setError("Please select a file to compare.");
        setLoading(false);
        return;
      }
      await compareDocuments(filePath); // This will only work if filePath is a valid path accessible to Office.js
    } catch (e) {
      setError("Failed to compare documents. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Field label="Choose a file to compare against:" className={styles.inputField}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={loading}
        />
        {filePath && <div>Selected: {filePath}</div>}
      </Field>
      <Button appearance="primary" onClick={handleCompare} disabled={loading || !filePath}>
        Compare Document
      </Button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DocumentCompare;
