import prompts from 'prompts';

export interface CliOptions {
  orgId?: string;
  collectionId?: string;
  token?: string;
  format?: string;
  output?: string;
}

export interface PromptedOptions {
  orgId: string;
  collectionId: string;
  token: string;
  format: string;
  output: string;
}

export async function promptMissingOptions(options: CliOptions): Promise<PromptedOptions> {
  const questions: prompts.PromptObject[] = [];

  if (!options.orgId) {
    questions.push({
      type: 'text',
      name: 'orgId',
      message: 'Enter your Snyk Organization ID:',
      validate: (value: string) => (value.trim() ? true : 'Organization ID is required'),
    });
  }

  if (!options.collectionId) {
    questions.push({
      type: 'text',
      name: 'collectionId',
      message: 'Enter your Snyk Collection ID:',
      validate: (value: string) => (value.trim() ? true : 'Collection ID is required'),
    });
  }

  if (!options.token) {
    questions.push({
      type: 'password',
      name: 'token',
      message: 'Enter your Snyk API Token:',
      validate: (value: string) => (value.trim() ? true : 'API Token is required'),
    });
  }

  if (!options.format) {
    questions.push({
      type: 'select',
      name: 'format',
      message: 'Select the SBOM format:',
      choices: [
        { title: 'CycloneDX v1.4 (JSON)', value: 'cyclonedx1.4+json' },
        { title: 'CycloneDX v1.5 (JSON)', value: 'cyclonedx1.5+json' },
        { title: 'CycloneDX v1.6 (JSON)', value: 'cyclonedx1.6+json' },
        { title: 'SPDX v2.3 (JSON)', value: 'spdx2.3+json' },
      ],
    });
  }

  const response = await prompts(questions);

  // If the user cancelled the prompt (e.g. Ctrl+C), exit gracefully
  if (
    (!options.orgId && !response.orgId) ||
    (!options.collectionId && !response.collectionId) ||
    (!options.token && !response.token) ||
    (!options.format && !response.format)
  ) {
    console.error('Missing required inputs. Exiting.');
    process.exit(1);
  }

  const collectionId = options.collectionId || response.collectionId;
  const defaultOutput = `sbom-collection-${collectionId}.json`;

  return {
    orgId: options.orgId || response.orgId,
    collectionId: collectionId,
    token: options.token || response.token,
    format: options.format || response.format,
    output: options.output || defaultOutput,
  };
}
