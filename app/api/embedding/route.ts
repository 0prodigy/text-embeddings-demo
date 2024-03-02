import puppeteer from "puppeteer";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

const embeddings = new HuggingFaceInferenceEmbeddings({});

export async function POST(req: Request) {
  const data = await req.formData();
  const website = data.get("website");
  const query = data.get("query");
  if (!website || website.toString() === "" || website === null) {
    return new Response("Please provide a website", { status: 400 });
  }
  if (!query || query.toString() === "" || query === null) {
    return new Response("Please provide a query", { status: 400 });
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(website.toString());
  const text = await page.evaluate(() => {
    const allText = Array.from(document.querySelectorAll("p")).map(
      (p) => p.textContent
    );
    const headerText = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5")
    ).map((h) => h.textContent);
    allText.push(...headerText);
    return allText.join("\n");
  });

  await browser.close();
  const embedding = await convertAndSaveEmbedding(
    website.toString(),
    text,
    query.toString()
  );
  return Response.json({ data: embedding });
}

async function convertAndSaveEmbedding(
  website: string,
  texts: string,
  query: string
) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    texts
      .split("\n")
      .filter((text) => text.length > 100)
      .map((text, i) => ({
        pageContent: text,
        metadata: { website, para: i },
      })),
    embeddings,
    {
      client,
      tableName: "documents",
      queryName: "match_documents",
    }
  );
  const result = await vectorStore.similaritySearch(query, 3, {
    website: website,
  });
  return result;
}
