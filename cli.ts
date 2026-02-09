#!/usr/bin/env ts-node
import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '/root/.openclaw/.env' });

interface VercelApiError {
  error?: {
    code?: string;
    message?: string;
  };
}

class VercelCLI {
  private api: AxiosInstance;
  private token: string;
  private teamId?: string;

  constructor() {
    this.token = process.env.VERCEL_TOKEN || '';
    this.teamId = process.env.VERCEL_TEAM_ID;

    if (!this.token) {
      this.error('VERCEL_TOKEN not found in environment variables');
      process.exit(1);
    }

    this.api = axios.create({
      baseURL: 'https://api.vercel.com',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      ...(this.teamId && { params: { teamId: this.teamId } }),
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          const errorData = error.response.data as VercelApiError;
          if (errorData.error?.message) {
            this.error(`API Error: ${errorData.error.message}`);
          } else {
            this.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
          }
        } else {
          this.error(`Request failed: ${error.message}`);
        }
        process.exit(1);
      }
    );
  }

  private error(message: string): void {
    console.error(message);
  }

  private output(data: any): void {
    console.log(JSON.stringify(data, null, 2));
  }

  // Projects
  async listProjects(): Promise<void> {
    const response = await this.api.get('/v10/projects');
    this.output(response.data);
  }

  async getProject(nameOrId: string): Promise<void> {
    const response = await this.api.get(`/v9/projects/${encodeURIComponent(nameOrId)}`);
    this.output(response.data);
  }

  async createProject(name: string, framework?: string, gitRepo?: string): Promise<void> {
    const data: any = { name };
    if (framework) data.framework = framework;
    if (gitRepo) {
      const [owner, repo] = gitRepo.split('/');
      data.gitRepository = {
        type: 'github',
        repo: `${owner}/${repo}`,
      };
    }
    const response = await this.api.post('/v10/projects', data);
    this.output(response.data);
  }

  async deleteProject(nameOrId: string): Promise<void> {
    const response = await this.api.delete(`/v9/projects/${encodeURIComponent(nameOrId)}`);
    this.output(response.data);
  }

  async linkProject(nameOrId: string, repo: string): Promise<void> {
    const [owner, repoName] = repo.split('/');
    const data = {
      gitRepository: {
        type: 'github',
        repo: `${owner}/${repoName}`,
      },
    };
    const response = await this.api.patch(`/v9/projects/${encodeURIComponent(nameOrId)}`, data);
    this.output(response.data);
  }

  // Deployments
  async listDeployments(projectName?: string, limit = 10): Promise<void> {
    const params: any = { limit };
    if (projectName) params.projectName = projectName;
    const response = await this.api.get('/v6/deployments', { params });
    this.output(response.data);
  }

  async getDeployment(idOrUrl: string): Promise<void> {
    // Extract deployment ID from URL if needed
    const deploymentId = idOrUrl.includes('.') ? idOrUrl.split('.')[0].split('//')[1] : idOrUrl;
    const response = await this.api.get(`/v13/deployments/${deploymentId}`);
    this.output(response.data);
  }

  async deploy(project: string, ref = 'main', prod = false): Promise<void> {
    const data: any = {
      name: project,
      target: prod ? 'production' : 'preview',
      gitSource: {
        type: 'github',
        ref,
      },
    };
    const response = await this.api.post('/v13/deployments', data);
    this.output(response.data);
  }

  async redeploy(deploymentId: string): Promise<void> {
    const response = await this.api.post(`/v13/deployments/${deploymentId}/redeploy`);
    this.output(response.data);
  }

  async promoteDeployment(deploymentId: string): Promise<void> {
    const response = await this.api.patch(`/v13/deployments/${deploymentId}`, {
      target: 'production',
    });
    this.output(response.data);
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    const response = await this.api.patch(`/v13/deployments/${deploymentId}`, {
      state: 'CANCELED',
    });
    this.output(response.data);
  }

  async deleteDeployment(deploymentId: string): Promise<void> {
    const response = await this.api.delete(`/v13/deployments/${deploymentId}`);
    this.output(response.data);
  }

  async getDeploymentLogs(deploymentId: string, follow = false): Promise<void> {
    const response = await this.api.get(`/v13/deployments/${deploymentId}/events`);
    this.output(response.data);
    
    // Note: Real following would require WebSocket or polling implementation
    if (follow) {
      this.error('Note: --follow functionality requires WebSocket implementation for real-time logs');
    }
  }

  // Domains
  async listDomains(projectName?: string): Promise<void> {
    const params: any = {};
    if (projectName) params.projectName = projectName;
    const response = await this.api.get('/v5/domains', { params });
    this.output(response.data);
  }

  async addDomain(project: string, domain: string): Promise<void> {
    // First get project ID
    const projectResponse = await this.api.get(`/v9/projects/${encodeURIComponent(project)}`);
    const projectId = projectResponse.data.id;
    
    const response = await this.api.post(`/v10/projects/${projectId}/domains`, {
      name: domain,
    });
    this.output(response.data);
  }

  async removeDomain(project: string, domain: string): Promise<void> {
    const projectResponse = await this.api.get(`/v9/projects/${encodeURIComponent(project)}`);
    const projectId = projectResponse.data.id;
    
    const response = await this.api.delete(`/v10/projects/${projectId}/domains/${domain}`);
    this.output(response.data);
  }

  async verifyDomain(domain: string): Promise<void> {
    const response = await this.api.post(`/v5/domains/${domain}/verify`);
    this.output(response.data);
  }

  async checkDomain(domain: string): Promise<void> {
    const response = await this.api.get(`/v5/domains/${domain}`);
    this.output(response.data);
  }

  // Environment Variables
  async listEnvVars(project: string, env?: string): Promise<void> {
    const projectResponse = await this.api.get(`/v9/projects/${encodeURIComponent(project)}`);
    const projectId = projectResponse.data.id;
    
    const params: any = {};
    if (env) params.target = env;
    const response = await this.api.get(`/v10/projects/${projectId}/env`, { params });
    this.output(response.data);
  }

  async addEnvVar(project: string, key: string, value: string, env = 'production,preview,development'): Promise<void> {
    const projectResponse = await this.api.get(`/v9/projects/${encodeURIComponent(project)}`);
    const projectId = projectResponse.data.id;
    
    const targets = env.split(',');
    const response = await this.api.post(`/v10/projects/${projectId}/env`, {
      key,
      value,
      target: targets,
    });
    this.output(response.data);
  }

  async removeEnvVar(project: string, key: string, env = 'production'): Promise<void> {
    const projectResponse = await this.api.get(`/v9/projects/${encodeURIComponent(project)}`);
    const projectId = projectResponse.data.id;
    
    // Find the env var by key
    const envVars = await this.api.get(`/v10/projects/${projectId}/env`);
    const envVar = envVars.data.envs.find((e: any) => e.key === key);
    
    if (!envVar) {
      this.error(`Environment variable '${key}' not found`);
      return;
    }
    
    const response = await this.api.delete(`/v10/projects/${projectId}/env/${envVar.id}`);
    this.output(response.data);
  }

  async pullEnvVars(project: string, file = '.env.local'): Promise<void> {
    const projectResponse = await this.api.get(`/v9/projects/${encodeURIComponent(project)}`);
    const projectId = projectResponse.data.id;
    
    const response = await this.api.get(`/v10/projects/${projectId}/env`);
    const envVars = response.data.envs;
    
    const envContent = envVars
      .map((env: any) => `${env.key}=${env.value}`)
      .join('\n');
      
    fs.writeFileSync(file, envContent);
    this.output({ message: `Environment variables written to ${file}`, count: envVars.length });
  }

  // DNS
  async listDnsRecords(domain: string): Promise<void> {
    const response = await this.api.get(`/v4/domains/${domain}/records`);
    this.output(response.data);
  }

  async addDnsRecord(domain: string, type: string, name: string, value: string, ttl = 3600): Promise<void> {
    const response = await this.api.post(`/v2/domains/${domain}/records`, {
      type,
      name,
      value,
      ttl,
    });
    this.output(response.data);
  }

  async removeDnsRecord(recordId: string): Promise<void> {
    // Note: This endpoint would need domain context, but API structure suggests direct record deletion
    const response = await this.api.delete(`/v2/domains/records/${recordId}`);
    this.output(response.data);
  }

  // Teams
  async listTeams(): Promise<void> {
    const response = await this.api.get('/v2/teams');
    this.output(response.data);
  }

  async getTeam(id: string): Promise<void> {
    const response = await this.api.get(`/v2/teams/${id}`);
    this.output(response.data);
  }

  async getUser(): Promise<void> {
    const response = await this.api.get('/v2/user');
    this.output(response.data);
  }

  // Secrets (Legacy)
  async listSecrets(): Promise<void> {
    const response = await this.api.get('/v3/secrets');
    this.output(response.data);
  }

  async addSecret(name: string, value: string): Promise<void> {
    const response = await this.api.post('/v3/secrets', { name, value });
    this.output(response.data);
  }

  async removeSecret(name: string): Promise<void> {
    const response = await this.api.delete(`/v3/secrets/${name}`);
    this.output(response.data);
  }

  // Certificates
  async listCerts(domain?: string): Promise<void> {
    const params: any = {};
    if (domain) params.domain = domain;
    const response = await this.api.get('/v5/certs', { params });
    this.output(response.data);
  }

  async getCert(id: string): Promise<void> {
    const response = await this.api.get(`/v5/certs/${id}`);
    this.output(response.data);
  }

  // Misc
  async getUsage(): Promise<void> {
    const response = await this.api.get('/v1/billing/usage');
    this.output(response.data);
  }

  async listAliases(projectName?: string): Promise<void> {
    const params: any = {};
    if (projectName) params.projectName = projectName;
    const response = await this.api.get('/v4/aliases', { params });
    this.output(response.data);
  }

  // Command parser and router
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        // Projects
        case 'projects':
          await this.listProjects();
          break;
        case 'project':
          if (!args[1]) throw new Error('Project name or ID required');
          await this.getProject(args[1]);
          break;
        case 'project-create':
          if (!args[1]) throw new Error('Project name required');
          const framework = this.getFlag('--framework', args);
          const gitRepo = this.getFlag('--git-repo', args);
          await this.createProject(args[1], framework, gitRepo);
          break;
        case 'project-delete':
          if (!args[1]) throw new Error('Project name or ID required');
          await this.deleteProject(args[1]);
          break;
        case 'project-link':
          if (!args[1]) throw new Error('Project name or ID required');
          const repo = this.getFlag('--repo', args);
          if (!repo) throw new Error('--repo flag required');
          await this.linkProject(args[1], repo);
          break;

        // Deployments
        case 'deployments':
          const project = this.getFlag('--project', args);
          const limit = parseInt(this.getFlag('--limit', args) || '10');
          await this.listDeployments(project, limit);
          break;
        case 'deployment':
          if (!args[1]) throw new Error('Deployment ID or URL required');
          await this.getDeployment(args[1]);
          break;
        case 'deploy':
          if (!args[1]) throw new Error('Project name required');
          const ref = this.getFlag('--ref', args) || 'main';
          const prod = args.includes('--prod');
          await this.deploy(args[1], ref, prod);
          break;
        case 'redeploy':
          if (!args[1]) throw new Error('Deployment ID required');
          await this.redeploy(args[1]);
          break;
        case 'promote':
          if (!args[1]) throw new Error('Deployment ID required');
          await this.promoteDeployment(args[1]);
          break;
        case 'cancel':
          if (!args[1]) throw new Error('Deployment ID required');
          await this.cancelDeployment(args[1]);
          break;
        case 'delete-deployment':
          if (!args[1]) throw new Error('Deployment ID required');
          await this.deleteDeployment(args[1]);
          break;
        case 'logs':
          if (!args[1]) throw new Error('Deployment ID required');
          const follow = args.includes('--follow');
          await this.getDeploymentLogs(args[1], follow);
          break;

        // Domains
        case 'domains':
          const domainProject = this.getFlag('--project', args);
          await this.listDomains(domainProject);
          break;
        case 'domain-add':
          if (!args[1] || !args[2]) throw new Error('Project and domain required');
          await this.addDomain(args[1], args[2]);
          break;
        case 'domain-remove':
          if (!args[1] || !args[2]) throw new Error('Project and domain required');
          await this.removeDomain(args[1], args[2]);
          break;
        case 'domain-verify':
          if (!args[1]) throw new Error('Domain required');
          await this.verifyDomain(args[1]);
          break;
        case 'domain-check':
          if (!args[1]) throw new Error('Domain required');
          await this.checkDomain(args[1]);
          break;

        // Environment Variables
        case 'env-list':
          if (!args[1]) throw new Error('Project name required');
          const envTarget = this.getFlag('--env', args);
          await this.listEnvVars(args[1], envTarget);
          break;
        case 'env-add':
          if (!args[1] || !args[2] || !args[3]) throw new Error('Project, key, and value required');
          const envTargets = this.getFlag('--env', args) || 'production,preview,development';
          await this.addEnvVar(args[1], args[2], args[3], envTargets);
          break;
        case 'env-remove':
          if (!args[1] || !args[2]) throw new Error('Project and key required');
          const removeEnv = this.getFlag('--env', args) || 'production';
          await this.removeEnvVar(args[1], args[2], removeEnv);
          break;
        case 'env-pull':
          if (!args[1]) throw new Error('Project name required');
          const file = this.getFlag('--file', args) || '.env.local';
          await this.pullEnvVars(args[1], file);
          break;

        // DNS
        case 'dns-list':
          if (!args[1]) throw new Error('Domain required');
          await this.listDnsRecords(args[1]);
          break;
        case 'dns-add':
          if (!args[1]) throw new Error('Domain required');
          const dnsType = this.getFlag('--type', args);
          const dnsName = this.getFlag('--name', args);
          const dnsValue = this.getFlag('--value', args);
          const ttl = parseInt(this.getFlag('--ttl', args) || '3600');
          if (!dnsType || !dnsName || !dnsValue) {
            throw new Error('--type, --name, and --value flags required');
          }
          await this.addDnsRecord(args[1], dnsType, dnsName, dnsValue, ttl);
          break;
        case 'dns-remove':
          if (!args[1]) throw new Error('Record ID required');
          await this.removeDnsRecord(args[1]);
          break;

        // Teams
        case 'teams':
          await this.listTeams();
          break;
        case 'team':
          if (!args[1]) throw new Error('Team ID required');
          await this.getTeam(args[1]);
          break;
        case 'user':
          await this.getUser();
          break;

        // Secrets
        case 'secrets':
          await this.listSecrets();
          break;
        case 'secret-add':
          if (!args[1] || !args[2]) throw new Error('Secret name and value required');
          await this.addSecret(args[1], args[2]);
          break;
        case 'secret-remove':
          if (!args[1]) throw new Error('Secret name required');
          await this.removeSecret(args[1]);
          break;

        // Certs
        case 'certs':
          const certDomain = this.getFlag('--domain', args);
          await this.listCerts(certDomain);
          break;
        case 'cert':
          if (!args[1]) throw new Error('Certificate ID required');
          await this.getCert(args[1]);
          break;

        // Misc
        case 'usage':
          await this.getUsage();
          break;
        case 'aliases':
          const aliasProject = this.getFlag('--project', args);
          await this.listAliases(aliasProject);
          break;

        default:
          this.error(`Unknown command: ${command}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Error: ${error.message}`);
      } else {
        this.error(`Unknown error: ${error}`);
      }
      process.exit(1);
    }
  }

  private getFlag(flag: string, args: string[]): string | undefined {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
  }

  private showHelp(): void {
    const help = `
Vercel CLI Plugin - Comprehensive Vercel API wrapper

USAGE:
  npx ts-node cli.ts <command> [args] [flags]

PROJECTS:
  projects                                  List all projects
  project <name-or-id>                     Get project details
  project-create <name> [--framework f] [--git-repo owner/repo]
  project-delete <name-or-id>              Delete project
  project-link <name-or-id> --repo owner/repo

DEPLOYMENTS:
  deployments [--project name] [--limit 10]  List deployments
  deployment <id-or-url>                    Get deployment details
  deploy <project> [--ref main] [--prod]   Trigger deployment
  redeploy <deployment-id>                  Redeploy existing
  promote <deployment-id>                   Promote to production
  cancel <deployment-id>                    Cancel running deployment
  delete-deployment <deployment-id>         Delete deployment
  logs <deployment-id> [--follow]          Get deployment logs

DOMAINS:
  domains [--project name]                  List domains
  domain-add <project> <domain>            Add domain to project
  domain-remove <project> <domain>         Remove domain
  domain-verify <domain>                   Verify domain
  domain-check <domain>                    Check domain status

ENVIRONMENT:
  env-list <project> [--env prod|prev|dev] List env vars
  env-add <project> <key> <value> [--env production,preview,development]
  env-remove <project> <key> [--env production]
  env-pull <project> [--file .env.local]   Pull env vars to file

DNS:
  dns-list <domain>                        List DNS records
  dns-add <domain> --type A --name @ --value 1.2.3.4 [--ttl 3600]
  dns-remove <record-id>                   Remove DNS record

TEAMS:
  teams                                    List teams
  team <id>                                Team details
  user                                     Current user info

SECRETS:
  secrets                                  List secrets
  secret-add <name> <value>                Create secret
  secret-remove <name>                     Delete secret

CERTIFICATES:
  certs [--domain domain]                  List certificates
  cert <id>                                Certificate details

MISC:
  usage                                    Current usage/billing info
  aliases [--project name]                 List aliases

ENVIRONMENT VARIABLES:
  VERCEL_TOKEN       - Required: Your Vercel API token
  VERCEL_TEAM_ID     - Optional: Team ID for team-scoped operations
`;
    this.error(help);
  }
}

// Run the CLI
if (require.main === module) {
  const cli = new VercelCLI();
  cli.run().catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

export default VercelCLI;