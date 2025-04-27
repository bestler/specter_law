import * as React from "react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import DocumentCompare from "./DocumentCompare";
import SelectionTrackedChanges from "./SelectionTrackedChanges";
import { makeStyles } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import { insertText } from "../taskpane";
import { extractTrackedChanges } from "../office/extractTrackedChanges";
import { extractParagraphs } from "../business/extractParagraphs";

const useStyles = makeStyles({
  root: {
    // No custom styles for now due to GriffelStyle typing issues
  },
});

const App: React.FC<{ title: string }> = (props) => {
  const styles = useStyles();
  const [trackedChanges, setTrackedChanges] = React.useState<any[]>([]);
  const [paragraphs, setParagraphs] = React.useState<string[]>([]);
  const [selection, setSelection] = React.useState("");
  const [selectedParagraphIndex, setSelectedParagraphIndex] = React.useState<number | null>(null);
  const [loadingTrackedChanges, setLoadingTrackedChanges] = React.useState(false);

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

  const handleCompareResults = async (changes: any[], paras: string[]) => {
    setLoadingTrackedChanges(true);
    setTrackedChanges([]);
    setParagraphs([]);
    // Simulate async loading for spinner UX (remove if not needed)
    await new Promise((resolve) => setTimeout(resolve, 200));
    setTrackedChanges(changes);
    setParagraphs(paras);
    setLoadingTrackedChanges(false);
  };

  const listItems: HeroListItem[] = [
    {
      icon: <Ribbon24Regular />,
      primaryText: "Achieve more with Office integration",
    },
    {
      icon: <LockOpen24Regular />,
      primaryText: "Unlock features and functionality",
    },
    {
      icon: <DesignIdeas24Regular />,
      primaryText: "Create and visualize like a pro",
    },
  ];

  return (
    <div className={styles.root}>
      <Header logo="assets/logo-filled.png" title={props.title} message="Welcome" />
      <HeroList message="Discover what this add-in can do for you today!" items={listItems} />
      <DocumentCompare onCompareResults={handleCompareResults} />
      <SelectionTrackedChanges
        selection={selection}
        selectedParagraphIndex={selectedParagraphIndex}
        trackedChanges={trackedChanges}
        loading={loadingTrackedChanges}
        paragraphs={paragraphs}
      />
    </div>
  );
};

export default App;
