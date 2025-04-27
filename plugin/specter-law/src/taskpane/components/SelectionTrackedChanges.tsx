// UI for showing current selection and tracked changes for the selected paragraph
import * as React from "react";
import { Spinner, Field, Button } from "@fluentui/react-components";
import { sendTrackedChangesToApi, sendSingleTrackedChangesToApi } from "../office/sendToApi";
import ClauseAnalysisResult from "./ClauseAnalysisResult";
import { insertText } from "../taskpane";

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
  analyzeButtonIcon?: React.ReactNode;
  analyzeButtonLabel?: string;
}

const SelectionTrackedChanges: React.FC<SelectionTrackedChangesProps> = ({
  selection,
  selectedParagraphIndex,
  trackedChanges,
  loading,
  paragraphs,
  analyzeButtonIcon,
  analyzeButtonLabel = "Analyze",
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
      // Use the original paragraphIndex values for changelog
      const payloadParagraph = selection || selectedParagraph;
      const payload = {
        paragraph: payloadParagraph,
        changelog: changes
      };
      setLastPayload(payload);
      // Use the new single endpoint
      const response = await sendSingleTrackedChangesToApi(payloadParagraph, changes);
      setApiResponse(response);
    } catch (e: any) {
      setApiError(e.message || String(e));
    } finally {
      setSending(false);
    }
  };

  // Replace selected paragraph with suggestion
  const handleReplaceWithSuggestion = async (suggested: string) => {
    try {
      await Office.onReady();
      await Word.run(async (context) => {
        const sel = context.document.getSelection();
        sel.insertText(suggested, Word.InsertLocation.replace);
        await context.sync();
      });
    } catch (e) {
      setApiError("Failed to replace paragraph: " + (e as any).message);
    }
  };

  return (
    <div style={{ marginTop: 24, maxWidth: 900, width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80, width: '100%' }}>
          <Spinner size="medium" label="Loading tracked changes..." />
        </div>
      ) : (
        <div style={{ marginTop: 16, width: '100%' }}>
          <div style={{ maxWidth: 520, margin: '0 auto 32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 12px 0' }}>
            <div style={{ fontWeight: 500, color: '#6366f1', marginBottom: 8, fontSize: '1.08em', textAlign: 'center', letterSpacing: 0.2, padding: '0.2em 0.5em' }}>Current Selection</div>
            <div style={{ background: "#f5f5f5", padding: '1.2em 1.5em', borderRadius: 14, minHeight: 32, width: '100%', textAlign: 'center', fontSize: '1.08em', color: '#22223b', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>{selection || "(No selection)"}</div>
          </div>
          {/*
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
          */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 32px auto', maxWidth: 220 }}>
            <Button
              appearance="primary"
              onClick={handleSendToApi}
              disabled={sending || !(selection || selectedParagraph) || changes.length === 0}
              style={{
                marginTop: 0,
                width: '100%',
                borderRadius: 12,
                alignSelf: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1.08em',
                padding: '0.7em 0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}
              icon={analyzeButtonIcon ? <span>{analyzeButtonIcon}</span> : undefined}
            >
              {analyzeButtonLabel}
            </Button>
          </div>
          {/* {lastPayload && (
            <div style={{ marginTop: 16 }}>
              <Field label="JSON Sent to API:">
                <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 8, borderRadius: 4 }}>{JSON.stringify(lastPayload, null, 2)}</pre>
              </Field>
            </div>
          )} */}
          {apiResponse && apiResponse.clauseIdentifier && apiResponse.analysis && (
            <div style={{ marginTop: 24, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ClauseAnalysisResult result={apiResponse} onReplaceWithSuggestion={handleReplaceWithSuggestion} />
            </div>
          )}
          {apiError && (
            <div style={{ marginTop: 16, color: "red", textAlign: 'center' }}>{apiError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectionTrackedChanges;
