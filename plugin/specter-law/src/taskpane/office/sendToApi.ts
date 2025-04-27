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
): Promise<{ results: { [paragraphIndex: number]: any } }> {
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

  // Build batch payload: one entry per paragraph with tracked changes
  const batchPayload: Array<{ paragraphIndex: number; paragraph: string; changelog: { type: string; text: string; author: string }[] }> = [];
  for (const [pIdx, changelog] of Object.entries(grouped)) {
    const idx = Number(pIdx);
    if (!changelog.length) continue;
    const paragraph = sanitizeText(paragraphs[idx] || "");
    const sanitizedChangelog = changelog.map(entry => ({
      ...entry,
      text: sanitizeText(entry.text),
      author: sanitizeText(entry.author),
      type: sanitizeText(entry.type)
    }));
    batchPayload.push({
      paragraphIndex: idx,
      paragraph,
      changelog: sanitizedChangelog
    });
  }
  if (debugLog) debugLog("Sending batch payload to API: " + JSON.stringify(batchPayload));
  try {
    const apiUrl = "https://specter-law.onrender.com/analyze_changes_batch";
    //const apiUrl = "http://127.0.0.1:8000/analyze_changes_batch";
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
    // The backend now returns { results: { [paragraphIndex]: result, ... } }
    return JSON.parse(responseText);
  } catch (err) {
    if (debugLog) debugLog("Fetch error: " + String(err));
    throw err;
  }
}

// Send a single paragraph and its tracked changes to the non-batch endpoint
export async function sendSingleTrackedChangesToApi(
  paragraph: string,
  changelog: Array<{ key: string; type: string; author: string; date: string; text: string; paragraphIndex: number }>,
  debugLog?: (msg: string) => void
): Promise<any> {
  const payload = {
    paragraph,
    changelog
  };
  if (debugLog) debugLog("Sending payload to API: " + JSON.stringify(payload));
  const apiUrl = "https://specter-law.onrender.com/analyze_changes";
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
    if (debugLog) debugLog(`Failed to send tracked changes`);
    throw new Error(`Failed to send tracked changes: "${responseText}"`);
  }
  return JSON.parse(responseText);
}
