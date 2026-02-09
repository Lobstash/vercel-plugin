# Vercel CLI Plugin - AI Usage Guide

This is a comprehensive Vercel CLI tool that provides access to the full Vercel REST API for deployment management, project administration, and infrastructure control.

## Quick Start

```bash
# Check if token is configured and CLI works
./vercel.sh user

# List all projects
./vercel.sh projects

# Get project details
./vercel.sh project my-project-name

# Deploy a project
./vercel.sh deploy my-project --ref main --prod
```

## Authentication

The plugin reads `VERCEL_TOKEN` from `/root/.openclaw/.env`. If not configured, all commands will fail with an authentication error.

## Command Categories

### Projects
- **List projects**: `./vercel.sh projects`
- **Project details**: `./vercel.sh project <name-or-id>`
- **Create project**: `./vercel.sh project-create myapp --framework nextjs --git-repo user/repo`
- **Delete project**: `./vercel.sh project-delete myapp`
- **Link git repo**: `./vercel.sh project-link myapp --repo user/repo`

### Deployments
- **List deployments**: `./vercel.sh deployments --project myapp --limit 20`
- **Deployment details**: `./vercel.sh deployment <deployment-id>`
- **Trigger deployment**: `./vercel.sh deploy myapp --ref main --prod`
- **Redeploy**: `./vercel.sh redeploy <deployment-id>`
- **Promote to production**: `./vercel.sh promote <deployment-id>`
- **Cancel deployment**: `./vercel.sh cancel <deployment-id>`
- **Delete deployment**: `./vercel.sh delete-deployment <deployment-id>`
- **View logs**: `./vercel.sh logs <deployment-id>`

### Domains & DNS
- **List domains**: `./vercel.sh domains --project myapp`
- **Add domain**: `./vercel.sh domain-add myapp example.com`
- **Remove domain**: `./vercel.sh domain-remove myapp example.com`
- **Verify domain**: `./vercel.sh domain-verify example.com`
- **Check domain**: `./vercel.sh domain-check example.com`
- **DNS records**: `./vercel.sh dns-list example.com`
- **Add DNS record**: `./vercel.sh dns-add example.com --type A --name @ --value 1.2.3.4 --ttl 3600`
- **Remove DNS record**: `./vercel.sh dns-remove <record-id>`

### Environment Variables
- **List env vars**: `./vercel.sh env-list myapp --env production`
- **Add env var**: `./vercel.sh env-add myapp API_KEY secretvalue --env production,preview`
- **Remove env var**: `./vercel.sh env-remove myapp API_KEY --env production`
- **Pull to file**: `./vercel.sh env-pull myapp --file .env.local`

### Teams & User Info
- **Current user**: `./vercel.sh user`
- **List teams**: `./vercel.sh teams`
- **Team details**: `./vercel.sh team <team-id>`

### Certificates & Secrets
- **List certificates**: `./vercel.sh certs --domain example.com`
- **Certificate details**: `./vercel.sh cert <cert-id>`
- **List secrets**: `./vercel.sh secrets` (legacy feature)
- **Add secret**: `./vercel.sh secret-add MY_SECRET value`
- **Remove secret**: `./vercel.sh secret-remove MY_SECRET`

### Miscellaneous
- **Usage/billing**: `./vercel.sh usage`
- **List aliases**: `./vercel.sh aliases --project myapp`

## Output Format

All commands return JSON output to stdout and errors to stderr. This makes it easy to parse responses programmatically:

```javascript
// Example response structure
{
  "projects": [...],
  "pagination": { ... }
}
```

## Common AI Workflows

### Deploy and Monitor
```bash
# Deploy a project
./vercel.sh deploy myapp --ref main --prod

# Monitor deployment status
./vercel.sh deployments --project myapp --limit 1

# Check logs if needed
./vercel.sh logs <deployment-id>
```

### Environment Management
```bash
# Check current env vars
./vercel.sh env-list myapp --env production

# Add new environment variables
./vercel.sh env-add myapp DATABASE_URL "postgresql://..." --env production

# Pull all env vars for local development
./vercel.sh env-pull myapp --file .env.local
```

### Domain Configuration
```bash
# Add a custom domain
./vercel.sh domain-add myapp mydomain.com

# Verify domain ownership
./vercel.sh domain-verify mydomain.com

# Set up DNS records
./vercel.sh dns-add mydomain.com --type CNAME --name www --value myapp.vercel.app
```

## Error Handling

The CLI provides detailed error messages and exits with appropriate codes:
- Authentication errors include hints about token configuration
- API errors show the exact message from Vercel
- Missing parameters are clearly indicated

## Tips for AI Agents

1. **Always check authentication first** with `./vercel.sh user`
2. **Use project names or IDs consistently** - names are more readable but IDs are more reliable
3. **Check deployment status before taking actions** on deployments
4. **Environment variables are per-target** (production/preview/development)
5. **Domain operations require project context** except for DNS management
6. **Use JSON parsing** to extract specific information from responses
7. **Handle rate limits gracefully** - Vercel has API rate limits per team/user

## Team Usage

If you're working with a team account, set `VERCEL_TEAM_ID` in the environment to scope all operations to that team. Without it, operations will be scoped to your personal account.