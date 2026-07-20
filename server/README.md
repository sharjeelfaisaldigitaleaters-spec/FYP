# Memory Keeper Backend Server (FastAPI)

Welcome to the backend server for **Memory Keeper** (Echoes of Tomorrow). This is an async-native Python application powered by FastAPI, utilizing Supabase (PostgreSQL + pgvector), Groq (Llama 3.3), and ElevenLabs for real-time empathetic Roman Urdu voice conversations.

---

## 🛠️ Prerequisites & System Dependencies

### 1. Python 3.10+
Make sure you have Python 3.10 or higher installed.

### 2. Audio Processing (faster-whisper)
`faster-whisper` depends on NVIDIA libraries (for GPU) or standard CPU acceleration tools.
* **On Windows**: If running on CPU, you may need `cuBLAS` and `cuDNN` DLLs in your PATH if running GPU acceleration. For standard CPU usage, the library works out-of-the-box in `int8` mode.

---

## 🚀 Setup Instructions

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

---

## 🗄️ Supabase Database Schema Setup

To use the semantic search engine (RAG), you must enable the `pgvector` extension in your Supabase database and create the required schemas. Run the following SQL inside the **Supabase SQL Editor**:

```sql
-- 1. Enable the pgvector extension to support embeddings
create extension if not exists vector;

-- 2. Create Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  phone text,
  avatar text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Consents table
create table public.consents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  email text not null,
  signature_name text not null,
  relation_to_deceased text not null,
  relationship_proof_url text,
  signed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_verified boolean default false not null
);

-- 4. Create Personas table
create table public.personas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  relation text not null,
  voice_id text,
  survey_data jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Memories table with vector support (384 dimensions for all-MiniLM-L6-v2)
create table public.memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  type text not null, -- 'audio', 'image', 'video', 'text'
  file_path text,
  content text,
  size text not null,
  status text default 'uploaded'::text not null,
  embedding vector(384),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Stories table
create table public.stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  excerpt text not null,
  category text not null,
  date text not null,
  duration text not null,
  has_audio boolean default false not null,
  is_favorite boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Family Members table
create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text not null,
  avatar text,
  role text not null, -- 'owner', 'editor', 'viewer'
  status text default 'pending'::text not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create User Settings table
create table public.user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  new_story boolean default true not null,
  family_activity boolean default true not null,
  ai_processing boolean default true not null,
  weekly_digest boolean default false not null
);

-- 9. Create Chat Sessions & Messages log
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  persona_id uuid references public.personas on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions on delete cascade not null,
  type text not null, -- 'user', 'ai'
  content text not null,
  audio_path text,
  embedding vector(384),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create pgvector match function for similarity search
create or replace function match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
returns table (
  id uuid,
  title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    memories.id,
    memories.title,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where memories.user_id = filter_user_id
    and 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
$$;
```

---

## 🏃 Running the Server

Start the development server with hot-reloading:
```bash
uvicorn app.main:app --reload --port 8000
```
The server will start on [http://localhost:8000/](http://localhost:8000/).
* You can access the interactive API docs at [http://localhost:8000/docs](http://localhost:8000/docs).
