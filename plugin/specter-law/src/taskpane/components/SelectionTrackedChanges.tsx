// UI for showing current selection and tracked changes for the selected paragraph
import * as React from "react";
import { Spinner, Field } from "@fluentui/react-components";

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
}

const SelectionTrackedChanges: React.FC<SelectionTrackedChangesProps> = ({
  selection,
  selectedParagraphIndex,
  trackedChanges,
  loading,
}) => {
  const changes = selectedParagraphIndex !== null
    ? trackedChanges.filter(tc => tc.paragraphIndex === selectedParagraphIndex)
    : [];

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
        </div>
      )}
    </div>
  );
};

export default SelectionTrackedChanges;
