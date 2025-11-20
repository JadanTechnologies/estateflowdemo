
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSmartReport = async (data: any, title: string) => {
  if (!API_KEY) {
    return `**Error: Gemini API key is not set.**
Please set your API key to use this feature. This is a placeholder report.
- Total Items: ${data.length}
- This is a sample summary.
`;
  }
  
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are an expert real estate analyst. Based on the following JSON data for a property management system, generate a comprehensive summary report titled "${title}".

    The report should:
    1.  Start with a brief, insightful overview of the data.
    2.  Provide key analytics and trends. For example, for payments, analyze payment methods, statuses, and totals for rent. For properties, analyze occupancy rates by department.
    3.  Include a "Grand Totals" section for all relevant numeric fields (e.g., total rent, total amount paid, total maintenance cost).
    4.  Format the entire output as clean, readable Markdown. Use headings, bullet points, and bold text to structure the report.
    5.  The entire report, including headings and analysis, MUST be written in English.
    6.  Do not include the raw JSON data in your response.

    JSON Data:
    \`\`\`json
    ${JSON.stringify(data, null, 2)}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating smart report:", error);
    return `**Error generating report.**
An error occurred while communicating with the Gemini API. Please check the console for details.
This is a placeholder report based on the available data.
- Total Data Analyzed: ${data.length}
- Placeholder analysis: The data appears structured correctly, but the AI analysis failed.
`;
  }
};