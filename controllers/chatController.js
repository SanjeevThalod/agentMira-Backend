import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);


const detailsRaw = await fs.readFile(path.resolve('data/details.json'), 'utf-8');
const locationRaw = await fs.readFile(path.resolve('data/location.json'), 'utf-8');
const imageRaw = await fs.readFile(path.resolve('data/image.json'), 'utf-8');

const details = JSON.parse(detailsRaw);
const location = JSON.parse(locationRaw);
const image = JSON.parse(imageRaw);

const Data = details.map(item => {
  const locationData = location.find(p => p.id === item.id) || {};
  const imageData = image.find(i => i.id === item.id) || {};

  return {
    ...item,
    ...locationData,
    ...imageData
  };
});
export const allData = async (req, res) => {
  try {

    res.status(200).json(Data);
  } catch (err) {
    console.error('Error combining data:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
};


export const interpretUserInput = async (req, res) => {
  const { message, currentDetails } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const model = "gemini-2.5-flash";

    const prompt = `
You are Agent Mira, a friendly and professional real estate assistant bot.
The user will send you a message describing the kind of property they want.

Your task:
Extract the relevant information and return **only** a valid JSON object containing the following keys:

{
  "location": string | null,            // City or area where the user wants the property
  "amenities": array of strings | null, // Specific amenities, each word capitalized
  "min_bedrooms": number | null,        // Minimum number of bedrooms
  "max_bedrooms": number | null,        // Maximum number of bedrooms
  "min_bathrooms": number | null,       // Minimum number of bathrooms
  "max_bathrooms": number | null,       // Maximum number of bathrooms
  "min_size_sqft": number | null,       // Minimum property size in square feet
  "max_size_sqft": number | null,       // Maximum property size in square feet
  "min_price": number | null,           // Minimum budget in USD (no symbols)
  "max_price": number | null,           // Maximum budget in USD (no symbols)
  "message": string                     // A conversational helper message for the user
}

Parsing rules:
- If the user specifies a **range** (e.g., "2–4 bedrooms"), assign the lower number to "min_" and the higher to "max_".
- If they only give one number for a field, put it in the **min_** field and leave the max as null.
- If only one number is provided and it's for price put it in the **max** field
- Prices should be treated as USD without symbols or commas.
- Sizes are always in square feet unless clearly stated otherwise.
- If the user gives absurd values (e.g., "100 BHK", "5 million sqft", "budget of $1"), set that field to null and mention the issue in "message".
- If a small number (1–10) is given without context, assume it’s bedrooms or bathrooms based on wording.
- If the number is large (>100 and <5000), assume it's size_sqft.
- If even larger number is provided( >50000) assume it's price.
- Amenities must be capitalized and listed in an array (e.g., ["Gym", "Swimming Pool"]).
- Missing or unspecified values should be null.
- You are also provided with currentDetails — do not ask again for fields already filled.
- When the user says he wants to see all/ all properties, you should remove all the filters
- User might have spelling mistakes while typing, it is your duty to correct them
- User might uses abbreviation for city names like (NY for new york, la for los angeles, dl for delhi), it is you duty to convert it into full city name

Formatting rules:
- Output **only valid JSON** — no text before or after.
- Always return all keys, even if null.

Conversational tone for "message":
- Sound like a helpful, real person, not a form.
- Vary your phrasing so responses don’t feel repetitive.
- Keep it short but warm, like a quick text reply from a friendly property agent.

Message generation logic:
1. Count how many main fields (location, amenities, bedrooms, bathrooms, size_sqft, price) are NOT null.
   - If 3+ fields are provided → "message" should confirm the info enthusiastically and say you’re pulling up matches.
   - If less than 3 fields are provided → "message" should naturally ask for one missing field (choose any from null ones).
   - If only 1 field is provided and it’s absurd → Set it to null, and "message" should gently ask for a realistic number.

User Message:
"""
${message}
"""

Current Details:
${currentDetails}
`;

    const result = await genAI.models.generateContent({
      model: model,
      contents: prompt
    })
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/, '')
      .trim();

    let parsedJSON = JSON.parse(cleanedText);

    res.status(200).json(parsedJSON);
  } catch (error) {
    console.error('Error processing Gemini input:', error);
    return res.status(500).json({ error });
  }
};


export const customData = async (req, res) => {
  try {
    const filters = req.body.mergedResult;

    if (!filters) {
      return res.status(400).json({ error: "Missing filters in request body" });
    }

    console.log("Received filters:", filters);

    // Filter logic
    let filtered = Data.filter((prop) => {
      let match = true;

      // Location
      if (filters.location && !prop.location.toLowerCase().includes(filters.location.toLowerCase())) {
        match = false;
      }

      // Price range
      if (filters.min_price !== null && prop.price < filters.min_price) {
        match = false;
      }
      if (filters.max_price !== null && prop.price > filters.max_price) {
        match = false;
      }

      // Bedrooms range
      if (filters.min_bedrooms !== null && prop.bedrooms < filters.min_bedrooms) {
        match = false;
      }
      if (filters.max_bedrooms !== null && prop.bedrooms > filters.max_bedrooms) {
        match = false;
      }

      // Bathrooms range
      if (filters.min_bathrooms !== null && prop.bathrooms < filters.min_bathrooms) {
        match = false;
      }
      if (filters.max_bathrooms !== null && prop.bathrooms > filters.max_bathrooms) {
        match = false;
      }

      // Size range
      if (filters.min_size_sqft !== null && prop.size_sqft < filters.min_size_sqft) {
        match = false;
      }
      if (filters.max_size_sqft !== null && prop.size_sqft > filters.max_size_sqft) {
        match = false;
      }

      // Amenities
      if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(a =>
          prop.amenities.map(item => item.toLowerCase()).includes(a.toLowerCase())
        );
        if (!hasAllAmenities) {
          match = false;
        }
      }

      return match;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error in customData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
