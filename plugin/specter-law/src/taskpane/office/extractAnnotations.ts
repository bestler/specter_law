// Extracts all annotations from the Word document using Office.js
// Returns an array of objects with id, state, and critique text
export async function extractAnnotations(): Promise<Array<{ id: string; state: string; critique: string }>> {
  return Word.run(async (context) => {
    // Get all paragraphs in the document
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load("items");
    await context.sync();

    // Collect all annotation collections
    const annotationCollections = paragraphs.items.map(p => p.getAnnotations());
    annotationCollections.forEach(ac => ac.load("id,state,critiqueAnnotation"));
    await context.sync();

    const allAnnotations: Array<{ id: string; state: string; critique: string }> = [];
    for (const annotations of annotationCollections) {
      for (const annotation of annotations.items) {
        let critiqueText = "";
        if (annotation.critiqueAnnotation) {
          if (typeof annotation.critiqueAnnotation === "string") {
            critiqueText = annotation.critiqueAnnotation;
          } else if (annotation.critiqueAnnotation.critique) {
            critiqueText = String(annotation.critiqueAnnotation.critique);
          }
        }
        allAnnotations.push({
          id: annotation.id,
          state: annotation.state,
          critique: critiqueText
        });
      }
    }
    return allAnnotations;
  });
}
