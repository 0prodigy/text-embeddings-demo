"use client";
import { FormEvent, useState } from "react";

export default function Home() {
  const [results, setResults] = useState<
    { pageContent: string; metadata: { para: string; website: string } }[]
  >([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErr(null);
    setResults([]);
    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/embedding", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data.data);
    } catch (error: any) {
      setErr(error.message);
    }
    setLoading(false);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* create a minimal header with title */}
      <header className="flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-4">Link to embedding</h1>
        <p>
          Enter your website link and ask query we convert your data in
          embedding and return your top 3 similar search
        </p>
      </header>
      {/* create a minimal form with single input with label and placeholder enter your website link */}
      <form className="flex flex-col items-center" onSubmit={onSubmit}>
        {err && <p className="text-red-500">{err}</p>}
        <label htmlFor="website" className="text-2xl font-bold mb-4">
          Enter your website link
        </label>
        <input
          type="text"
          id="website"
          name="website"
          placeholder="https://example.com"
          className="p-4 border border-gray-300 rounded-md mb-4 dark:bg-gray-800 dark:text-white"
        />
        <label htmlFor="query" className="text-2xl font-bold mb-4">
          Ask query
        </label>
        <input
          type="text"
          id="query"
          name="query"
          placeholder="what are all the configuration"
          className="p-4 border border-gray-300 rounded-md mb-4 dark:bg-gray-800 dark:text-white"
        />
        <button type="submit" className="bg-blue-500 text-white p-4 rounded-md">
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
      {/* add result section */}
      <section className="flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4">Result</h2>
        <p>Result will be shown here</p>
        <ul>
          {results.map((r) => (
            <li key={r.metadata.para}>
              <p>{r.pageContent}</p>
              <div>
                <p>source</p>
                <sub>{r.metadata.website}</sub>
                <sub> paragraph {r.metadata.para}</sub>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
