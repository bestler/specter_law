// UI for document comparison
import * as React from "react";
import { useState } from "react";
import { Button, Field, tokens, makeStyles } from "@fluentui/react-components";
import { compareDocuments } from "../office/compare";
import { extractParagraphs, extractDocumentObject } from "../business/extractParagraphs";
import { sendParagraphsToApi, sendTrackedChangesToApi } from "../office/sendToApi";
import { extractTrackedChanges } from "../office/extractTrackedChanges";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
    width: "100%",
    maxWidth: '900px',
    marginLeft: "auto",
    marginRight: "auto",
  },
  inputField: {
    marginBottom: "10px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileInput: {
    width: "100%",
    maxWidth: '400px',
    margin: "0 auto 10px auto",
    padding: "8px 0",
    borderRadius: '8px',
    border: '1px solid #e0e7ff',
    background: '#f8fafc',
    fontSize: '1em',
    textAlign: 'center',
  },
  compareButton: {
    maxWidth: '250px',
    margin: "0 auto 16px auto",
    padding: "0.7em 1.5em",
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '1em',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    marginTop: "10px",
  },
});

interface DocumentCompareProps {
  onCompareResults?: (changes: any[], paragraphs: string[]) => void;
  onStartCompare?: () => void;
}

const DocumentCompare: React.FC<DocumentCompareProps> = ({ onCompareResults, onStartCompare }) => {
  const styles = useStyles();
  const [filePath, setFilePath] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [docObject, setDocObject] = useState<any>(null);
  const [trackedChanges, setTrackedChanges] = useState<Array<{ key: string; type: string; author: string; date: string; text: string; paragraphIndex: number }>>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiPayloads, setApiPayloads] = useState<any[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

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
    if (onStartCompare) onStartCompare(); // Hide UI and show spinner immediately
    setError(null);
    setLoading(true);
    try {
      if (!filePath) {
        setError("Please select a file to compare.");
        setLoading(false);
        return;
      }
      await compareDocuments(filePath);
      // After compare, extract tracked changes and paragraphs
      const [changes, paras] = await Promise.all([
        extractTrackedChanges(),
        extractParagraphs()
      ]);
      setTrackedChanges(changes);
      setParagraphs(paras);
      if (onCompareResults) onCompareResults(changes, paras);
    } catch (e) {
      setError("Failed to compare documents or extract changes. See console for details.");
      console.error(e);
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

  const handleShowDocumentObject = async () => {
    setError(null);
    setLoading(true);
    try {
      const obj = await extractDocumentObject();
      setDocObject(obj);
    } catch (e) {
      setError("Failed to extract document object. See console for details.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShowTrackedChanges = async () => {
    setError(null);
    setLoading(true);
    try {
      const changes = await extractTrackedChanges();
      setTrackedChanges(changes);
    } catch (e) {
      setError("Failed to extract tracked changes. See console for details.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTrackedChangesToApi = async () => {
    setError(null);
    setLoading(true);
    setApiResponse(null);
    setApiPayloads([]);
    setDebugLogs([]);
    try {
      const [changes, paragraphs] = await Promise.all([
        extractTrackedChanges(),
        extractParagraphs()
      ]);
      setTrackedChanges(changes);
      setParagraphs(paragraphs);
      // Prepare payloads for preview
      const grouped: { [pIdx: number]: { type: string; text: string; author: string }[] } = {};
      changes.forEach(tc => {
        if (!grouped[tc.paragraphIndex]) grouped[tc.paragraphIndex] = [];
        grouped[tc.paragraphIndex].push({
          type: tc.type,
          text: tc.text,
          author: tc.author
        });
      });
      const payloads = Object.entries(grouped).map(([pIdx, changelog]) => ({
        paragraphIndex: Number(pIdx),
        paragraph: paragraphs[Number(pIdx)] || "",
        changelog
      }));
      setApiPayloads(payloads);
      // Send to API with debug logging
      const debug: string[] = [];
      const response = await sendTrackedChangesToApi(changes, paragraphs, (msg: string) => {
        debug.push(msg);
        setDebugLogs(logs => [...logs, msg]);
      });
      // The batch API now returns { results: { [paragraphIndex]: result, ... } }
      if (response && typeof response === 'object' && response.results && typeof response.results === 'object') {
        setApiResponse(response.results);
      } else {
        setApiResponse({});
      }
      setDebugLogs(debug);
    } catch (e) {
      setError("Failed to send tracked changes to API. See console for details.");
      setDebugLogs(logs => [...logs, String(e)]);
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
          className={styles.fileInput}
        />
        {filePath && <div>Selected: {filePath}</div>}
      </Field>
      <button className={styles.compareButton} onClick={handleCompare} disabled={loading || !filePath}>
        Compare Document
      </button>
      {/* 
      <Button appearance="secondary" onClick={handleExtractAndSend} disabled={loading} style={{ marginTop: 10 }}>
        Extract & Show Paragraphs
      </Button>
      <Button appearance="secondary" onClick={handleExtractAnnotations} disabled={loading} style={{ marginTop: 10 }}>
        Extract Annotations
      </Button>
      <Button appearance="secondary" onClick={handleShowDocumentObject} disabled={loading} style={{ marginTop: 10 }}>
        Show Document Object
      </Button>
      <Button appearance="secondary" onClick={handleShowTrackedChanges} disabled={loading} style={{ marginTop: 10 }}>
        Show Tracked Changes
      </Button>
      <Button appearance="secondary" onClick={handleSendTrackedChangesToApi} disabled={loading} style={{ marginTop: 10 }}>
        Send Tracked Changes to API
      </Button>
      */}
      {apiPayloads.length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 400, textAlign: "left" }}>
          <h4>JSON Payloads to be Sent:</h4>
          {apiPayloads.map((payload, idx) => (
            <pre key={idx} style={{ fontSize: 12, whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 8, borderRadius: 4, marginBottom: 8 }}>{JSON.stringify(payload, null, 2)}</pre>
          ))}
        </div>
      )}
      {apiResponse && Object.keys(apiResponse).length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 400, textAlign: "left" }}>
          <h4>API Response (by Paragraph):</h4>
          {Object.entries(apiResponse).map(([pIdx, result]: [string, any]) => (
            <div key={pIdx} style={{ marginBottom: 16, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
              <strong>Paragraph {pIdx}:</strong>
              <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
      {docObject && (
        <div style={{ marginTop: 20, maxWidth: 400, textAlign: "left", wordBreak: "break-all" }}>
          <h4>Document Object:</h4>
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(docObject, null, 2)}</pre>
        </div>
      )}
      {debugLogs.length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 400, textAlign: "left", color: '#888' }}>
          <h4>Debug Log:</h4>
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{debugLogs.join('\n')}</pre>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DocumentCompare;
