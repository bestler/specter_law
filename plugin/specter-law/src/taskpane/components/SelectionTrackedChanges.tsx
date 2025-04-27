// UI for showing current selection and tracked changes for the selected paragraph
import * as React from "react";
import { Spinner, Field, Button } from "@fluentui/react-components";
import { sendTrackedChangesToApi } from "../office/sendToApi";

interface TrackedChange {
  key: string;
  type: string;
  author: string;
  date: string;
  text: string;
  paragraphIndex: number;
}

interface SelectionTrackedChangesProps {
  selection: string;
  selectedParagraphIndex: number | null;
  trackedChanges: TrackedChange[];
  loading: boolean;
  paragraphs: string[];
}

const SelectionTrackedChanges: React.FC<SelectionTrackedChangesProps> = ({
  selection,
  selectedParagraphIndex,
  trackedChanges,
  loading,
  paragraphs,
}) => {
  const [sending, setSending] = React.useState(false);
  const [apiResponse, setApiResponse] = React.useState<any>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [lastPayload, setLastPayload] = React.useState<any>(null);

  const changes = selectedParagraphIndex !== null
    ? trackedChanges.filter(tc => tc.paragraphIndex === selectedParagraphIndex)
    : [];
  const selectedParagraph = selectedParagraphIndex !== null ? paragraphs[selectedParagraphIndex] : "";

  const handleSendToApi = async () => {
    setSending(true);
    setApiResponse(null);
    setApiError(null);
    try {
      // Always send the full selected paragraph as the 'paragraph' field
      const payloadParagraph = selection || selectedParagraph;
      const payload = {
        paragraph: payloadParagraph,
        changelog: changes
      };
      setLastPayload(payload);
      const response = await sendTrackedChangesToApi(changes, [payloadParagraph]);
      setApiResponse(response);
    } catch (e: any) {
      setApiError(e.message || String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: 24, maxWidth: 400 }}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80 }}>
          <Spinner size="medium" label="Loading tracked changes..." />
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <Field label="Current Selection:">
            <div style={{ background: "#f5f5f5", padding: 8, borderRadius: 4, minHeight: 32 }}>{selection || "(No selection)"}</div>
          </Field>
          <Field label="Tracked Changes for Selected Paragraph:">
            {changes.length > 0 ? (
              <ol>
                {changes.map(tc => (
                  <li key={tc.key} style={{ marginBottom: 8, whiteSpace: "pre-wrap" }}>
                    <strong>Type:</strong> {tc.type}<br />
                    <strong>Author:</strong> {tc.author}<br />
                    <strong>Date:</strong> {tc.date}<br />
                    <strong>Text:</strong> {tc.text}
                  </li>
                ))}
              </ol>
            ) : (
              <div>No tracked changes for this paragraph.</div>
            )}
          </Field>
          <Button
            appearance="primary"
            onClick={handleSendToApi}
            disabled={sending || !(selection || selectedParagraph) || changes.length === 0}
            style={{ marginTop: 16 }}
          >
            {sending ? "Sending..." : "Send to API"}
          </Button>
          {lastPayload && (
            <div style={{ marginTop: 16 }}>
              <Field label="JSON Sent to API:">
                <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 8, borderRadius: 4 }}>{JSON.stringify(lastPayload, null, 2)}</pre>
              </Field>
            </div>
          )}
          {apiResponse && (
            <div style={{ marginTop: 16 }}>
              <Field label="API Response:">
                <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 8, borderRadius: 4 }}>{JSON.stringify(apiResponse, null, 2)}</pre>
              </Field>
            </div>
          )}
          {apiError && (
            <div style={{ marginTop: 16, color: "red" }}>{apiError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectionTrackedChanges;
