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
