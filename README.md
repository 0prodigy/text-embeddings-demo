# Text Embeddings Demo

This is demo app for using text embeddings to find similar sentences. The app uses the Universal Sentence Encoder from TensorFlow Hub to generate embeddings for the input text and then uses the embeddings to find the most similar sentences in the dataset. The app is built using langchai, supabase and huggingface/inference API.

## Prerequisites

- Node.js
- Yarn
- Supabase account
- Huggingface API key (optional, if you want to use private embedding models by default it uses sentence-transformers/distilbert-base-nli-mean-tokens model to generate embeddings.)
- Docker (optional, if you want to run the app in a container)

## How to set up the app

- Create a new supabase project
- Create a new table in the supabase project with the following schema:

```sql

-- Enable the pgvector extension to work with embedding vectors
create extension vector;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding vector
);

-- Create a function to search for documents
create function match_documents (
  query_embedding vector,
  match_count int default null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

- Create a new .env file in the root of the project and add the following environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How to run the app

1. Clone the repository
2. Install the dependencies
3. Run the app

```bash
git clone
cd text-embeddings-demo
yarn install
yarn run dev
```

## How to run the app in a container

1. Clone the repository
2. Build the docker image
3. Run the docker container

```bash
git clone
cd text-embeddings-demo
docker build -t text-embeddings-demo .
docker run -p 3000:3000 --env NEXT_PUBLIC_SUPABASE_URL=your-supabase-url --env NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key text-embeddings-demo
```
