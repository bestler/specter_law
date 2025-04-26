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

  // Prepare combined request
  const apiUrl = "https://specter-law.onrender.com/analyze_changes_batch";
  //const apiUrl = "http://127.0.0.1:8000/analyze_changes_batch";
  const batchPayload = Object.entries(grouped).map(([pIdx, changelog]) => {
    let paragraph = paragraphs[Number(pIdx)] || "";
    paragraph = sanitizeText(paragraph);
    const sanitizedChangelog = changelog.map(entry => ({
      ...entry,
      text: sanitizeText(entry.text),
      author: sanitizeText(entry.author),
      type: sanitizeText(entry.type)
    }));
    return {
      paragraphIndex: Number(pIdx),
      paragraph,
      changelog: sanitizedChangelog
    };
  });
  if (debugLog) debugLog("Sending batch payload to API: " + JSON.stringify(batchPayload));
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ items: batchPayload }),
    });
    if (debugLog) debugLog("API response status: " + response.status);
    const responseText = await response.text();
    if (debugLog) debugLog("API response body: " + responseText);
    if (!response.ok) {
      if (debugLog) debugLog(`Failed to send tracked changes batch`);
      throw new Error(`Failed to send tracked changes batch: "${responseText}"`);
    }
    return JSON.parse(responseText);
  } catch (err) {
    if (debugLog) debugLog("Fetch error: " + String(err));
    throw err;
  }
}
