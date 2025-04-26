// Office.js interaction logic for sending paragraphs to an API
// This is a boilerplate function for posting extracted paragraphs to a backend

export async function sendParagraphsToApi(paragraphs: string[]): Promise<any> {
  // Replace with your API endpoint
  const apiUrl = "https://your-api-endpoint.com/analyze";
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paragraphs }),
  });
  if (!response.ok) {
    throw new Error("Failed to send paragraphs to API");
  }
  return response.json();
}

function sanitizeText(text: string): string {
  // Remove control characters only; do not escape quotes or backslashes
  return text.replace(/[\u0000-\u001F\u007F]/g, " ");
}

export async function sendTrackedChangesToApi(
  trackedChanges: Array<{ key: string; type: string; author: string; date: string; text: string; paragraphIndex: number }>,
  paragraphs: string[],
  debugLog?: (msg: string) => void
): Promise<any[]> {
  // Group tracked changes by paragraphIndex
  const grouped: { [pIdx: number]: { type: string; text: string; author: string }[] } = {};
  trackedChanges.forEach(tc => {
    if (!grouped[tc.paragraphIndex]) grouped[tc.paragraphIndex] = [];
    grouped[tc.paragraphIndex].push({
      type: tc.type,
      text: tc.text,
      author: tc.author
    });
  });

  // Prepare and send requests
  const apiUrl = "https://10.181.238.8:8000/analyze_changes";
  //onst apiUrl = "http://127.0.0.1:8000/analyze_changes";
  const results: any[] = [];
  for (const [pIdx, changelog] of Object.entries(grouped)) {
    let paragraph = paragraphs[Number(pIdx)] || "";
    paragraph = sanitizeText(paragraph);
    const sanitizedChangelog = changelog.map(entry => ({
      ...entry,
      text: sanitizeText(entry.text),
      author: sanitizeText(entry.author),
      type: sanitizeText(entry.type)
    }));
    const payload = {
      paragraph,
      changelog: sanitizedChangelog
    };
    if (debugLog) debugLog("Sending payload to API: " + JSON.stringify(payload));
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });
      if (debugLog) debugLog("API response status: " + response.status);
      const responseText = await response.text();
      if (debugLog) debugLog("API response body: " + responseText);
      if (!response.ok) {
        if (debugLog) debugLog(`Failed to send tracked changes for paragraph ${pIdx}`);
        throw new Error(`Failed to send tracked changes for paragraph ${pIdx}: "${responseText}"`);
      }
      results.push(JSON.parse(responseText));
    } catch (err) {
      if (debugLog) debugLog("Fetch error: " + String(err));
      throw err;
    }
  }
  return results;
}
