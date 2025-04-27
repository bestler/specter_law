import React from "react";

interface ClauseAnalysis {
  clauseIdentifier: string;
  originalClauseText: string;
  analysis: {
    clauseCategory: string;
    summary: string;
    risksDisclosingParty: string;
    risksReceivingParty: string;
    improvementsDisclosingParty: string;
    improvementsReceivingParty: string;
    suggestedWording: string;
    comments_on_changes: string;
  };
}

interface ClauseAnalysisResultProps {
  result: ClauseAnalysis;
  onReplaceWithSuggestion?: (suggested: string) => void;
}

const boxStyle: React.CSSProperties = {
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "1.2em 1.5em",
  marginBottom: "1.2em",
  wordBreak: "break-word",
};

const highlightStyle: React.CSSProperties = {
  ...boxStyle,
  background: "linear-gradient(90deg, #e0e7ff 0%, #f0f4ff 100%)",
  border: "1.5px solid #6366f1",
  color: "#22223b",
  fontWeight: 600,
  fontSize: "1.08em",
  marginBottom: "2em",
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  color: "#6366f1",
  marginBottom: "0.3em",
  fontSize: "0.98em",
};

const responsiveStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "1.5em 0.5em",
  boxSizing: "border-box",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.2em",
  width: "100%",
};

// Responsive: single column on small screens
const mediaQuery = `@media (max-width: 700px)`;
const responsiveGridStyle: React.CSSProperties = {
  ...gridStyle,
};
// This will be injected as a style tag for true responsiveness
const responsiveCss = `
.specter-law-clause-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2em; width: 100%; }
${mediaQuery} { .specter-law-clause-grid { grid-template-columns: 1fr !important; } }
`;

const headlineStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1.35em",
  color: "#3730a3",
  marginBottom: "0.5em",
  borderBottom: "2px solid #e0e7ff",
  paddingBottom: "0.3em",
  marginTop: "0.5em",
  paddingLeft: "0.2em",
  paddingRight: "0.2em",
};

const originalClauseStyle: React.CSSProperties = {
  borderRadius: "12px",
  background: "#f8fafc",
  fontFamily: "monospace, 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', monospace",
  fontSize: "0.95em",
  color: "#64748b",
  padding: "0.7em 1em",
  marginBottom: "1.5em",
  marginTop: "0.5em",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const gridItemStyle: React.CSSProperties = {
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  padding: "1.2em 1.5em",
  marginBottom: "1.2em",
  wordBreak: "break-word",
  minHeight: "80px",
};

export const ClauseAnalysisResult: React.FC<ClauseAnalysisResultProps> = ({ result, onReplaceWithSuggestion }) => {
  const { originalClauseText, analysis } = result;
  return (
    <div style={{ ...responsiveStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Responsive grid CSS injection */}
      <style>{responsiveCss}</style>
      <div style={{ ...headlineStyle, textAlign: 'center', width: '100%' }}>{analysis.clauseCategory}</div>
      <div style={{ ...highlightStyle, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={labelStyle}>Suggested Wording</div>
        <div style={{ width: '100%', marginBottom: 16 }}>{analysis.suggestedWording}</div>
        {onReplaceWithSuggestion && (
          <button
            style={{
              marginTop: 8,
              padding: '0.7em 1.5em',
              borderRadius: 8,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1em',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
            onClick={() => onReplaceWithSuggestion(analysis.suggestedWording)}
          >
            Replace selected paragraph with suggestion
          </button>
        )}
      </div>
      <div style={{ ...originalClauseStyle, width: '100%', textAlign: 'center' }}>
        <div style={{ ...labelStyle, color: '#64748b' }}>Original Clause</div>
        <div>{originalClauseText}</div>
      </div>
      <div className="specter-law-clause-grid" style={{ width: '100%' }}>
        <div style={gridItemStyle}>
          <div style={labelStyle}>Summary</div>
          <div>{analysis.summary}</div>
        </div>
        <div style={gridItemStyle}>
          <div style={labelStyle}>Risks (Disclosing Party)</div>
          <div>{analysis.risksDisclosingParty}</div>
        </div>
        <div style={gridItemStyle}>
          <div style={labelStyle}>Risks (Receiving Party)</div>
          <div>{analysis.risksReceivingParty}</div>
        </div>
        <div style={gridItemStyle}>
          <div style={labelStyle}>Improvements (Disclosing Party)</div>
          <div>{analysis.improvementsDisclosingParty}</div>
        </div>
        <div style={gridItemStyle}>
          <div style={labelStyle}>Improvements (Receiving Party)</div>
          <div>{analysis.improvementsReceivingParty}</div>
        </div>
        <div style={gridItemStyle}>
          <div style={labelStyle}>Comments on Changes</div>
          <div>{analysis.comments_on_changes}</div>
        </div>
      </div>
    </div>
  );
};

export default ClauseAnalysisResult;
