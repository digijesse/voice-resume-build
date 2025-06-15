
# PersonAI - AI-Powered Personal Assistant Platform

PersonAI is a web application that allows users to create AI-powered conversational agents based on their personal profiles and professional backgrounds. Users can create personalized AI assistants using ElevenLabs for voice synthesis and make them publicly available for others to interact with.

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library
- **React Router DOM** - Client-side routing
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Edge Functions (Deno runtime)
- **ElevenLabs API** - AI voice synthesis for conversational agents

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `class-variance-authority` - CSS class variants
- `tailwind-merge` - Tailwind class merging utility

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── NavBar.tsx       # Navigation component
│   └── ...
├── pages/               # Route components
│   ├── Index.tsx        # Landing page
│   ├── AuthPage.tsx     # Authentication (sign in/up)
│   ├── PublicPersonas.tsx # Browse public AI personas
│   ├── AccountPage.tsx  # User account management
│   └── CreatePersona.tsx # Create new persona (legacy)
├── hooks/               # Custom React hooks
│   ├── useAuthState.tsx # Authentication state management
│   └── ...
├── integrations/        # External service integrations
│   └── supabase/
│       ├── client.ts    # Supabase client configuration
│       └── types.ts     # Auto-generated TypeScript types
└── lib/                 # Utility functions
    └── utils.ts         # Helper functions

supabase/
├── functions/           # Edge Functions
│   ├── confirm-user/    # User confirmation bypass
│   ├── create-agent/    # ElevenLabs agent creation
│   └── _shared/         # Shared utilities
├── migrations/          # Database schema migrations
└── config.toml          # Supabase configuration
```

## 🗄️ Database Schema

### Tables Overview

The application uses PostgreSQL through Supabase with the following main tables:

#### `profiles`
Stores comprehensive user profile information and links to AI agents.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  elevenlabs_api_key TEXT NOT NULL,
  bio TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  random_persona_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Key Fields:**
- `id` - Links to Supabase auth.users table
- `elevenlabs_api_key` - User's ElevenLabs API key for voice synthesis
- `bio` - User's professional background and description
- `agent_id` - ElevenLabs agent identifier for voice conversations
- `is_public` - Controls visibility in public personas directory
- `random_persona_name` - Generated persona name for display
- `avatar_url` - Profile picture (generated via DiceBear API)

#### `public_personas`
Stores publicly visible persona information for the directory.

```sql
CREATE TABLE public.public_personas (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  random_persona_name TEXT NOT NULL,
  avatar_url TEXT,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

**Purpose:**
- Separate table for public visibility (performance optimization)
- Only populated when users choose to make their persona public
- Used for the public persona directory browsing experience

### Row Level Security (RLS)

**Current State:** RLS is **disabled** on both tables to simplify development and avoid authentication complications during the initial phase.

```sql
-- RLS is currently disabled
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_personas DISABLE ROW LEVEL SECURITY;
```

**Production Consideration:** In a production environment, you would typically enable RLS with policies like:
- Users can only view/edit their own profiles
- Public personas are readable by everyone
- Only authenticated users can create personas

## 🔐 Authentication System

### Supabase Auth Configuration

The authentication system is configured to bypass email confirmation for development simplicity:

```toml
# supabase/config.toml
[auth]
enable_signup = true
enable_confirmations = false
enable_recoveries = true
email_confirm_required = false
password_min_length = 1
email_autoconfirm = true
enable_email_signup = true
```

### Authentication Flow

1. **Sign Up Process:**
   - User provides email, password, name, ElevenLabs API key, and bio
   - Account is created in Supabase Auth
   - User is immediately confirmed via the `confirm-user` edge function
   - ElevenLabs agent is created via the `create-agent` edge function
   - Profile data is stored in both `profiles` and `public_personas` tables
   - User is automatically signed in

2. **Sign In Process:**
   - Standard email/password authentication
   - Redirects to home page on success

3. **Auth State Management:**
   - Custom `useAuthState` hook manages user state
   - Persists across browser sessions via localStorage

## 🔧 Supabase Integration

### Client Configuration

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://grlawnzcsrumnyzcziqw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJ..."; // Anon key

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

### Edge Functions

#### `confirm-user`
**Purpose:** Bypasses email confirmation by using service role to immediately confirm new users.

**Location:** `supabase/functions/confirm-user/index.ts`

**Usage:** Called automatically during signup to prevent email sending and confirmation delays.

#### `create-agent`
**Purpose:** Creates ElevenLabs conversational agents using user's API key and bio.

**Location:** `supabase/functions/create-agent/index.ts`

**Usage:** Called during signup to create the AI voice agent that represents the user.

### Environment Variables/Secrets

The following secrets are configured in Supabase:
- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin API key for edge functions
- `SUPABASE_DB_URL` - Database connection URL

## 🎭 Persona System

### Persona Creation Flow

1. **User Registration:**
   - User provides personal information and ElevenLabs API key
   - Bio describes their professional background and expertise
   - Random persona name is generated (e.g., "John Engineer Lion")

2. **AI Agent Creation:**
   - ElevenLabs agent is created using the user's bio as training data
   - Agent ID is stored in the user's profile
   - Voice synthesis is configured for conversational interactions

3. **Avatar Generation:**
   - Profile pictures are generated using DiceBear API
   - Unique avatar based on user ID ensures consistency

4. **Public Visibility:**
   - Users can choose to make their persona public
   - Public personas appear in the browsable directory
   - Others can click to start voice conversations

### Persona Interaction

- **Public Directory:** Browse all public personas at `/personas`
- **Voice Chat:** Click any persona to open ElevenLabs chat interface
- **Personal Management:** View and manage your own persona at `/account`

## 🚦 Getting Started

### Prerequisites
- Node.js & npm installed
- Supabase account and project
- ElevenLabs account and API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd personai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
- Supabase configuration is embedded in the code
- No additional environment variables needed for basic operation

4. **Run the development server**
```bash
npm run dev
```

5. **Access the application**
- Open http://localhost:5173 in your browser
- Sign up with any email (confirmation is bypassed)
- Provide an ElevenLabs API key to create your persona

## 📱 Key Features

### For Users
- **Quick Registration:** No email confirmation required
- **AI Persona Creation:** Automatic ElevenLabs agent generation
- **Voice Conversations:** Talk to AI personas using voice synthesis
- **Public Directory:** Discover and interact with other personas
- **Privacy Controls:** Choose between public and private personas

### For Developers
- **Type Safety:** Full TypeScript coverage with auto-generated Supabase types
- **Modern Stack:** React 18, Vite, Tailwind CSS, shadcn/ui
- **Real-time Data:** Supabase real-time subscriptions ready
- **Edge Functions:** Server-side logic with Deno runtime
- **Authentication:** Complete auth system with bypassed email verification

## 🔄 Data Flow

1. **User Signup** → `AuthPage.tsx` → `confirm-user` function → `create-agent` function → Database
2. **Public Browsing** → `PublicPersonas.tsx` → Supabase query → ElevenLabs chat
3. **Account Management** → `AccountPage.tsx` → User profile data → Persona settings
4. **Voice Interaction** → ElevenLabs external chat interface → AI conversation

## 🚀 Deployment

The application is designed to be deployed on Lovable's platform with automatic Supabase integration. All edge functions and database migrations are automatically deployed with the application code.

## 📝 Development Notes

- **Authentication:** Currently configured to bypass email confirmation for development ease
- **Security:** RLS is disabled; should be enabled for production
- **API Integration:** ElevenLabs API calls are handled server-side via edge functions
- **Type Safety:** Database types are auto-generated from Supabase schema
- **State Management:** Uses React Query for server state and React hooks for client state

---

*This project represents a complete full-stack application showcasing modern web development practices with React, TypeScript, Supabase, and AI integration.*
