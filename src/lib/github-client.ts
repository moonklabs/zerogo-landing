export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface GitHubFileResult {
  path: string;
  sha?: string;
  success: boolean;
}

export async function getFileSha(
  config: GitHubConfig,
  path: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  
  const response = await fetch(`${url}?ref=${config.branch}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const data = await response.json() as { sha?: string };
  return data.sha || null;
}

export async function upsertFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string
): Promise<GitHubFileResult> {
  const encodedContent = Buffer.from(content).toString('base64');
  const sha = await getFileSha(config, path);
  
  const body: Record<string, unknown> = {
    message,
    content: encodedContent,
    branch: config.branch,
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub upsert failed: ${error}`);
  }
  
  return { path, sha, success: true };
}

export async function deleteFile(
  config: GitHubConfig,
  path: string,
  message: string
): Promise<GitHubFileResult> {
  const sha = await getFileSha(config, path);
  if (!sha) {
    return { path, success: false };
  }
  
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sha,
      branch: config.branch,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`GitHub delete failed: ${response.status}`);
  }
  
  return { path, sha, success: true };
}
