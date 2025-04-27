import * as React from "react";
import Header from "./Header";
import DocumentCompare from "./DocumentCompare";
import SelectionTrackedChanges from "./SelectionTrackedChanges";
import HeroList, { HeroListItem } from "./HeroList";
import { makeStyles } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular, Sparkle24Regular, DocumentText24Regular, TextGrammarArrowLeft24Regular } from "@fluentui/react-icons";
import { insertText } from "../taskpane";
import { extractTrackedChanges } from "../office/extractTrackedChanges";
import { extractParagraphs } from "../business/extractParagraphs";
import { Text } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    // No custom styles for now due to GriffelStyle typing issues
  },
});

const App: React.FC = () => {
  const styles = useStyles();
  const [trackedChanges, setTrackedChanges] = React.useState<any[]>([]);
  const [paragraphs, setParagraphs] = React.useState<string[]>([]);
  const [selection, setSelection] = React.useState("");
  const [selectedParagraphIndex, setSelectedParagraphIndex] = React.useState<number | null>(null);
  const [loadingTrackedChanges, setLoadingTrackedChanges] = React.useState(false);
  const [showCompareSection, setShowCompareSection] = React.useState(true);

  // Shorter, non-overlapping title
  const shortTitle = "Specter Law AI";
  const heroItems: HeroListItem[] = [
    {
      icon: <DocumentText24Regular />,
      primaryText: "Compare your contract with a reference document and see tracked changes."
    },
    {
      icon: <TextGrammarArrowLeft24Regular />,
      primaryText: "Select a clause to analyze and get instant feedback."
    },
    {
      icon: <Sparkle24Regular />,
      primaryText: "Let AI suggest improvements and highlight risks for both parties."
    }
  ];

  // Listen for selection changes
  React.useEffect(() => {
    const handler = async () => {
      await Office.onReady();
      await Word.run(async (context) => {
        const sel = context.document.getSelection();
        sel.load("text,paragraphs");
        await context.sync();
        setSelection(sel.text);
        // Find which paragraph is selected
        if (sel.paragraphs.items && sel.paragraphs.items.length > 0) {
          const para = sel.paragraphs.items[0];
          para.load("text");
          await context.sync();
          // Find index in paragraphs array
          const idx = paragraphs.findIndex((p) => p === para.text);
          setSelectedParagraphIndex(idx !== -1 ? idx : null);
        } else {
          setSelectedParagraphIndex(null);
        }
      });
    };
    Office.context.document.addHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      handler
    );
    handler();
    return () => {
      Office.context.document.removeHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        { handler }
      );
    };
  }, [paragraphs]);

  // Wrap handleCompareResults to also hide the compare section
  const handleCompareResults = async (changes: any[], paras: string[]) => {
    setShowCompareSection(false);
    setLoadingTrackedChanges(true);
    setTrackedChanges([]);
    setParagraphs([]);
    // Simulate async loading for spinner UX (remove if not needed)
    await new Promise((resolve) => setTimeout(resolve, 200));
    setTrackedChanges(changes);
    setParagraphs(paras);
    setLoadingTrackedChanges(false);
  };

  return (
    <div className={styles.root} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Header logo="assets/logo-filled.png" title={shortTitle} message="Specter Law" />
      <HeroList message="How does Specter Law AI help you?" items={heroItems} />
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 32 }}>
      </div>
      {showCompareSection && (
        <DocumentCompare onCompareResults={handleCompareResults} />
      )}
      <SelectionTrackedChanges
        selection={selection}
        selectedParagraphIndex={selectedParagraphIndex}
        trackedChanges={trackedChanges}
        loading={loadingTrackedChanges}
        paragraphs={paragraphs}
        analyzeButtonIcon={<Sparkle24Regular />}
        analyzeButtonLabel="Analyze"
      />
    </div>
  );
};

export default App;
