import { OpenAI } from "openai";

export const dynamic = "force-dynamic";

const topics = [
  "Cats",
  "Dogs",
  "Robot Rebellion",
  "Telepathic Toasters",
  "TechnoTurtle",
];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: Request, res: Response) {
  let topic: string;
  try {
    const res = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt:
        "Generate a random and humorous meme topic that can be visually represented easily. The topic can be a single word or a short phrase. Consider something that has a potential for creating amusing images using AI tools. Surprise me with a creative and lighthearted suggestion!",
      max_tokens: 50,
    });
    topic = res.choices[0].text;
  } catch (err) {
    console.log(err);
    topic = topics[Math.floor(Math.random() * topics.length)];
  }

  return Response.json({ topic });
}
