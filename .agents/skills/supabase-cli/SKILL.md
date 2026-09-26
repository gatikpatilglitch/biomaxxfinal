---
name: supabase-cli
description: Run Supabase CLI commands, manage migrations, link remote projects, and interact with Supabase services on Windows.
---

# Supabase CLI Workflows

This workspace is integrated with the official Supabase CLI using `npx supabase`.

## Execution on Windows
Because PowerShell script execution policies may restrict `.ps1` files, always execute Supabase CLI commands using:
```bash
cmd /c npx supabase <subcommand> [flags]
```

## Common Operations

### 1. Authentication & Linking
* **Login with personal access token:**
  ```bash
  cmd /c npx supabase login
  ```
* **Link to a remote Supabase project:**
  ```bash
  cmd /c npx supabase link --project-ref <project-id>
  ```
* **List existing projects:**
  ```bash
  cmd /c npx supabase projects list
  ```

### 2. Database Migrations
* **Apply migrations to linked remote database:**
  ```bash
  cmd /c npx supabase db push
  ```
* **Pull remote database schema locally:**
  ```bash
  cmd /c npx supabase db pull
  ```
* **Generate a new migration:**
  ```bash
  cmd /c npx supabase migration new <name>
  ```

### 3. Local Development (Requires Docker)
* **Start local Supabase containers:**
  ```bash
  cmd /c npx supabase start
  ```
* **Stop local Supabase containers:**
  ```bash
  cmd /c npx supabase stop
  ```
* **Check local status and URLs:**
  ```bash
  cmd /c npx supabase status
  ```
