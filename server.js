import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.json({ ok: true, message: "cover-letter-api is running" });
});

app.post("/generate", async (req, res) => {
  try {
    const { jobDescription, resume, tone = "confident and natural" } = req.body;

    if (!jobDescription || !resume) {
      return res.status(400).json({ error: "Missing jobDescription or resume" });
    }

    const prompt = `
You are a professional career coach and hiring manager.

Write a highly tailored, concise, persuasive cover letter based on the inputs.

Rules:
- Match the job description tone (${tone})
- Sound human, not robotic
- Avoid generic phrases like "I am excited to apply" or "I am writing to express my interest"
- Do NOT repeat the resume verbatim
- Focus on value, impact, and fit
- Keep it under 300 words
- No fluff

Job Description:
${jobDescription}

Candidate Resume:
${resume}

Output ONLY the finished cover letter. No headings. No bullets.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
