import A2A from 'a2a';
import { Properties } from './properties';
import { GithubGQLClient } from '.';

type DomainListQuery = {
  repository: {
    file?: {
      text: string;
    };
  };
};

// [domain, repository]
export type DomainListItem = [string, string];

export async function getDomainsList(): Promise<DomainListItem[]> {
  let raw = '';

  const [error, response] = await A2A<DomainListQuery>(
    GithubGQLClient({
      query: `
          query DomainsList($owner: String!, $repository: String!, $file: String!) {
            repository(owner: $owner, name: $repository) {
              file: object(expression: $file) {
                ... on Blob {
                  text
                }
              }
            }
          }
        `,
      owner: 'invertase',
      repository: 'docs.page',
      file: 'master:domains.txt',
    }),
  );

  if (error) {
    console.error('Unable to fetch domains list', error);
  }

  if (error || !response.repository?.file?.text) {
    raw = '';
  } else {
    raw = response.repository.file.text;
  }

  return raw.split('\n').map<DomainListItem>(str => str.split(' ') as DomainListItem);
}

type PullRequestQuery = {
  repository: {
    pullRequest: {
      owner: {
        login: string;
      };
      repository: {
        name: string;
      };
      ref: {
        name: string;
      };
    };
  };
};

export type PullRequestMetadata = {
  owner: string;
  repository: string;
  ref: string;
};

export async function getPullRequestMetadata(
  owner: string,
  repository: string,
  pullRequest: number,
): Promise<PullRequestMetadata | null> {
  const [error, response] = await A2A<PullRequestQuery>(
    GithubGQLClient({
      query: `
        query RepositoryConfig($owner: String!, $repository: String!, $pullRequest: Int!) {
          repository(owner: $owner, name: $repository) {
            pullRequest(number: $pullRequest) {
              owner: headRepositoryOwner {
                login
              }
              repository: headRepository {
                name
              }
              ref: headRef {
                name
              }
            }
          }
        }
      `,
      owner: owner,
      repository: repository,
      pullRequest: pullRequest,
    }),
  );

  if (error || !response) {
    return null;
  }

  return {
    owner: response.repository.pullRequest.owner.login,
    repository: response.repository.pullRequest.repository.name,
    ref: response.repository.pullRequest.ref.name,
  };
}

type PageContentsQuery = {
  repository: {
    baseBranch: {
      name: string;
    };
    isFork: boolean;
    config?: {
      text: string;
    };
    md?: {
      text: string;
    };
    mdx?: {
      text: string;
    };
    html?: {
      text: string;
    };
  };
};

type Contents = {
  isFork: boolean;
  baseBranch: string;
  config?: string;
  md?: string;
  mdx?: string;
};

export async function getGitHubContents(properties: Properties): Promise<Contents | null> {
  const [error, response] = await A2A<PageContentsQuery>(
    GithubGQLClient({
      query: `
      query RepositoryConfig($owner: String!, $repository: String!, $config: String!, $md: String!, $mdx: String!) {
        repository(owner: $owner, name: $repository) {
          baseBranch: defaultBranchRef {
            name
          }
          isFork
          config: object(expression: $config) {
            ... on Blob {
              text
            }
          }
          md: object(expression: $md) {
            ... on Blob {
              text
            }
          }
          mdx: object(expression: $mdx) {
            ... on Blob {
              text
            }
          }
        }
      }
    `,
      owner: properties.owner,
      repository: properties.repository,
      config: `${properties.ref}:docs.json`,
      md: `${properties.ref}:docs/${properties.path}.md`,
      mdx: `${properties.ref}:docs/${properties.path}.mdx`,
    }),
  );

  if (error) {
    console.error(error);
    return null;
  }

  return {
    isFork: response.repository.isFork,
    baseBranch: response.repository.baseBranch.name,
    config: response.repository.config?.text,
    md: response.repository.md?.text,
    mdx: response.repository.mdx?.text,
  };
}
