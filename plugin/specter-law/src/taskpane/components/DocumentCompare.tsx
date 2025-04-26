// UI for document comparison
import * as React from "react";
import { useState } from "react";
import { Button, Field, tokens, makeStyles } from "@fluentui/react-components";
import { compareDocuments } from "../office/compare";
import { extractParagraphs } from "../business/extractParagraphs";
import { sendParagraphsToApi } from "../office/sendToApi";

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
  const [paragraphs, setParagraphs] = useState<string[]>([]);

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

  const handleExtractAndSend = async () => {
    setError(null);
    setLoading(true);
    try {
      const paragraphs = await extractParagraphs();
      setParagraphs(paragraphs); // Show paragraphs in the side pane
      // Optionally send to API here
      // const apiResponse = await sendParagraphsToApi(paragraphs);
      // console.log("API response:", apiResponse);
    } catch (e) {
      setError("Failed to extract paragraphs. See console for details.");
      console.error(e);
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
      <Button appearance="secondary" onClick={handleExtractAndSend} disabled={loading} style={{ marginTop: 10 }}>
        Extract & Show Paragraphs
      </Button>
      {paragraphs.length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 400, textAlign: "left" }}>
          <h4>Extracted Paragraphs:</h4>
          <ol>
            {paragraphs.map((p, i) => (
              <li key={i} style={{ marginBottom: 8, whiteSpace: "pre-wrap" }}>{p}</li>
            ))}
          </ol>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DocumentCompare;
