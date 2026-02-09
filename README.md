# Vercel CLI Plugin

A comprehensive TypeScript CLI tool that provides complete access to the Vercel REST API. This plugin enables full deployment management, project administration, and infrastructure control through a unified command-line interface.

## Features

### 🚀 Project Management
- List all projects with pagination
- Get detailed project information
- Create new projects with framework detection
- Delete projects with confirmation
- Link Git repositories to existing projects
- Support for both project names and IDs

### 📦 Deployment Control
- List deployments with filtering and pagination
- Get detailed deployment information including build status
- Trigger new deployments from Git repositories
- Redeploy existing deployments
- Promote preview deployments to production
- Cancel running deployments
- Delete old deployments
- Access deployment build logs

### 🌐 Domain & DNS Management
- List all domains across projects
- Add custom domains to projects
- Remove domains from projects
- Verify domain ownership
- Check domain configuration status
- Manage DNS records (A, AAAA, CNAME, MX, TXT)
- TTL configuration for DNS records

### ⚙️ Environment Variables
- List environment variables by target (production/preview/development)
- Add environment variables with multi-target support
- Remove environment variables
- Pull all environment variables to local files
- Environment variable inheritance and overrides

### 👥 Team & User Management
- Get current user information
- List all teams you're a member of
- Get detailed team information
- Team-scoped operations with VERCEL_TEAM_ID

### 🔐 Security Features
- Legacy secrets management (list, add, remove)
- SSL certificate management
- Certificate status and expiration tracking
- Automatic HTTPS certificate provisioning

### 📊 Monitoring & Analytics
- Usage and billing information
- Deployment statistics
- Performance metrics
- Resource consumption tracking

### 🔗 Alias Management
- List deployment aliases
- Project-specific alias filtering
- Alias history and management

## Architecture

- **TypeScript Core**: Fully typed CLI with comprehensive error handling
- **Shell Wrapper**: Convenient shell script for easy invocation
- **JSON Output**: All responses in structured JSON format
- **Error Separation**: Errors go to stderr, data to stdout
- **Axios Integration**: Robust HTTP client with interceptors
- **Environment Loading**: Automatic `.env` file processing

## API Coverage

This plugin provides access to the following Vercel API endpoints:

### Projects API (v9/v10)
- `GET /v10/projects` - List projects
- `GET /v9/projects/{id}` - Get project details
- `POST /v10/projects` - Create project
- `DELETE /v9/projects/{id}` - Delete project
- `PATCH /v9/projects/{id}` - Update project

### Deployments API (v6/v13)
- `GET /v6/deployments` - List deployments
- `GET /v13/deployments/{id}` - Get deployment details
- `POST /v13/deployments` - Create deployment
- `PATCH /v13/deployments/{id}` - Update deployment
- `DELETE /v13/deployments/{id}` - Delete deployment
- `GET /v13/deployments/{id}/events` - Get deployment logs

### Domains API (v5/v10)
- `GET /v5/domains` - List domains
- `GET /v5/domains/{domain}` - Get domain details
- `POST /v10/projects/{id}/domains` - Add domain to project
- `DELETE /v10/projects/{id}/domains/{domain}` - Remove domain

### DNS API (v2/v4)
- `GET /v4/domains/{domain}/records` - List DNS records
- `POST /v2/domains/{domain}/records` - Add DNS record
- `DELETE /v2/domains/records/{id}` - Delete DNS record

### Environment Variables API (v10)
- `GET /v10/projects/{id}/env` - List environment variables
- `POST /v10/projects/{id}/env` - Add environment variable
- `DELETE /v10/projects/{id}/env/{id}` - Remove environment variable

### Teams API (v2)
- `GET /v2/teams` - List teams
- `GET /v2/teams/{id}` - Get team details
- `GET /v2/user` - Get current user

### Additional APIs
- **Secrets API (v3)**: Legacy secrets management
- **Certificates API (v5)**: SSL certificate management
- **Billing API (v1)**: Usage and billing information
- **Aliases API (v4)**: Deployment alias management

## Installation

```bash
cd /root/.openclaw/workspace/skills/vercel
npm install
```

## Usage

```bash
# Direct TypeScript execution
npx ts-node cli.ts <command> [args] [flags]

# Using shell wrapper (recommended)
./vercel.sh <command> [args] [flags]
```

## Examples

```bash
# Get current user info
./vercel.sh user

# List all projects
./vercel.sh projects

# Create a Next.js project
./vercel.sh project-create my-nextjs-app --framework nextjs

# Deploy to production
./vercel.sh deploy my-app --ref main --prod

# Add environment variable
./vercel.sh env-add my-app API_KEY "secret123" --env production,preview

# Add custom domain
./vercel.sh domain-add my-app mydomain.com

# Configure DNS
./vercel.sh dns-add mydomain.com --type A --name @ --value 1.2.3.4
```

## Requirements

- Node.js 18+ with npm/npx
- Valid Vercel account and API token
- TypeScript and ts-node (installed as dependencies)

## Development

```bash
# Install dependencies
npm install

# Run TypeScript compiler
npm run build

# Test the CLI
npx ts-node cli.ts user
```

## License

MIT License - Feel free to use, modify, and distribute as needed.