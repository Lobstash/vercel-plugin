# Vercel CLI Plugin - Setup Guide

This guide will walk you through setting up the Vercel CLI plugin from scratch.

## Prerequisites

- Node.js 18 or later installed on your system
- A Vercel account (free or paid)
- Git (for project linking features)
- Basic command line knowledge

## Step 1: Create a Vercel Account

If you don't already have a Vercel account:

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" 
3. Choose to sign up with GitHub, GitLab, Bitbucket, or email
4. Complete the account verification process

## Step 2: Generate an API Token

The CLI requires a Vercel API token to authenticate with Vercel's services.

### Method 1: Vercel Dashboard (Recommended)
1. Log into your Vercel dashboard at [vercel.com](https://vercel.com/dashboard)
2. Click on your avatar in the top-right corner
3. Select "Settings" from the dropdown menu
4. Navigate to the "Tokens" tab in the left sidebar
5. Click "Create Token"
6. Give your token a descriptive name (e.g., "OpenClaw CLI Token")
7. Select the appropriate expiration (consider "No Expiration" for development)
8. Choose the scope:
   - **Personal Account**: Select your personal account
   - **Team Account**: Select the team if you're working with a team
9. Click "Create Token"
10. **Important**: Copy the token immediately - it won't be shown again!

### Method 2: Vercel CLI (Alternative)
If you have the official Vercel CLI installed:
```bash
vercel login
vercel auth
```

## Step 3: Configure Environment Variables

1. Navigate to your OpenClaw workspace:
   ```bash
   cd /root/.openclaw
   ```

2. Create or edit the `.env` file:
   ```bash
   nano .env
   ```

3. Add your Vercel token:
   ```env
   # Required: Your Vercel API token
   VERCEL_TOKEN=your_token_here

   # Optional: Team ID for team-scoped operations
   VERCEL_TEAM_ID=your_team_id_here
   ```

4. Save and close the file (Ctrl+X, then Y, then Enter in nano)

### Finding Your Team ID (Optional)
If you're working with a Vercel team:

1. Go to your team dashboard: `https://vercel.com/teams/your-team-name`
2. The team ID is in the URL, or you can find it in team settings
3. Alternatively, after setting up the basic token, run:
   ```bash
   ./vercel.sh teams
   ```

## Step 4: Install Dependencies

Navigate to the plugin directory and install the required packages:

```bash
cd /root/.openclaw/workspace/skills/vercel
npm install
```

This will install:
- `axios` - HTTP client for API requests
- `dotenv` - Environment variable loader
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution environment
- `@types/node` - Node.js type definitions

## Step 5: Test the Installation

Test that everything is working correctly:

```bash
# Test user authentication
./vercel.sh user

# List your projects (if any)
./vercel.sh projects

# View available commands
./vercel.sh
```

If the setup is successful, you should see JSON output with your user information.

## Step 6: First Usage

Try some basic commands to familiarize yourself:

```bash
# Get your user info
./vercel.sh user

# List all your projects
./vercel.sh projects

# If you have projects, get details for one
./vercel.sh project your-project-name

# Check your current usage
./vercel.sh usage
```

## Troubleshooting

### Common Issues

#### "VERCEL_TOKEN not found in environment variables"
- Ensure you've added `VERCEL_TOKEN` to `/root/.openclaw/.env`
- Verify the token is on a single line with no extra spaces
- Make sure you copied the entire token

#### "npx: command not found"
- Install Node.js from [nodejs.org](https://nodejs.org) 
- Verify installation: `node --version && npm --version`

#### "Authentication failed" or "401 Unauthorized"
- Your token may be expired or invalid
- Generate a new token following Step 2
- Ensure you copied the token correctly (no extra characters)

#### "ts-node: command not found"
- Run `npm install` in the plugin directory
- If still failing, install globally: `npm install -g ts-node typescript`

#### Permission denied on "./vercel.sh"
- Ensure the script is executable: `chmod +x ./vercel.sh`

### Token Security Best Practices

1. **Never commit tokens to Git repositories**
2. **Use specific scopes** - only grant necessary permissions
3. **Set expiration dates** for production tokens
4. **Rotate tokens regularly** for security
5. **Revoke unused tokens** from your Vercel dashboard

### Team Setup

If you're working with a team:

1. Ask your team admin to invite you to the team
2. Generate a token while logged into the team context
3. Set `VERCEL_TEAM_ID` in your environment variables
4. All CLI operations will be scoped to the team

## Usage Examples

Once set up, you can perform various operations:

```bash
# Project management
./vercel.sh project-create my-new-app --framework nextjs
./vercel.sh project-link my-app --repo username/repository

# Deployment
./vercel.sh deploy my-app --ref main --prod
./vercel.sh deployments --project my-app --limit 5

# Domain management
./vercel.sh domain-add my-app mydomain.com
./vercel.sh domain-verify mydomain.com

# Environment variables
./vercel.sh env-add my-app DATABASE_URL "postgresql://..." --env production
./vercel.sh env-list my-app --env production
```

## Getting Help

- Run any command without arguments to see available options
- Check the `SKILL.md` file for detailed usage examples
- Refer to the `README.md` for feature overview
- Visit [vercel.com/docs](https://vercel.com/docs) for official API documentation

## Next Steps

1. Explore the available commands by running `./vercel.sh` without arguments
2. Read through `SKILL.md` for AI agent usage patterns  
3. Check out `README.md` for the complete feature list
4. Start managing your Vercel projects from the command line!

---

You're now ready to use the Vercel CLI plugin! If you encounter any issues, refer to the troubleshooting section or check that your token has the necessary permissions.