const express = require("express");
const router = express.Router();
const Roadmap = require("../models/Roadmap");

try {
  const fetch = require("node-fetch");
} catch (error) {
  console.error("fetch ni hua");
}

console.log("node-fetch loaded:", typeof fetch);
if (typeof fetch !== "function") {
  console.error("node-fetch did NOT load correctly!");
}

const generateRoadmap = async (data) => {
  try {
    const request = await fetch(
      "https://mention.com/wp-json/openai-proxy/v1/generate",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/json",
          priority: "u=1, i",
          "sec-ch-ua":
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          Referer: "https://mention.com/en/linkedin-post-generator/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body:
          '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"' +
          encodeURIComponent(data) +
          '"}],"temperature":0.7,"max_tokens":256,"top_p":1,"frequency_penalty":0,"presence_penalty":0}',
        method: "POST",
      }
    );

    if (!request.ok) {
      console.error("AI API Error:", request.status, request.statusText);
      return { error: `AI API Error: ${request.status} ${request.statusText}` };
    }

    const response = await request.json();
    console.log(`AI API Response: ${JSON.stringify(response, null, 4)}`);
    return response;
  } catch (error) {
    console.error("Error in generateRoadmap:", error);
    return { error: error.message };
  }
};

router.post("/", async (req, res) => {
  const { goals, skills, title } = req.body;

  if (!goals || !skills) {
    return res.status(400).json({ message: "Goals and skills are required." });
  }

  if (goals.length > 6 || skills.length > 6) {
    return res
      .status(400)
      .json({ message: "You can select up to 6 goals and 6 skills." });
  }

  try {
    console.log("Request Body:", req.body);
    const prompt = `Generate an AI roadmap based on goals: ${goals.join(
      ", "
    )} and skills: ${skills.join(", ")}.`;
    console.log("Prompt to AI API:", prompt);

    const roadmapAi = await generateRoadmap(prompt);

    if (roadmapAi.error) {
      console.error("Error from generateRoadmap:", roadmapAi.error);
      return res.status(500).json({
        message: "Failed to generate roadmap from AI.",
        error: roadmapAi.error,
      });
    }

    console.log("Roadmap AI Response:", roadmapAi);

    if (!roadmapAi.bio) {
      console.error("Unexpected AI API response:", roadmapAi);
      return res.status(500).json({
        message: "Unexpected response format from AI API.",
        error: "Invalid AI response format",
      });
    }

    const aiResponse = roadmapAi.bio;
    console.log("AI response content:", aiResponse);

    const userId = "67e6e9a846db7a0f471f9c35";

    const roadmap = new Roadmap({
      title: title || "Default Roadmap Title",
      userId: userId,
      userInput: { goals, skills },
      description: aiResponse,
    });

    console.log("Roadmap object:", roadmap);

    await roadmap.save();
    console.log("Roadmap saved successfully.");

    res.status(201).json({
      message: "Roadmap data received successfully.",
      roadmap: aiResponse,
    });
  } catch (error) {
    console.error("Error generating roadmap:", error);
    res
      .status(500)
      .json({ message: "Failed to generate roadmap.", error: error.message });
  }
});

router.get("/:roadmapId", async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.roadmapId).populate(
      "resources"
    );
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
