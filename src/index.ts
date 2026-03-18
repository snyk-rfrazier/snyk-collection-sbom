#!/usr/bin/env node

import { Command, Option } from 'commander';
import { promptMissingOptions, CliOptions } from './prompts';
import { fetchCollectionSbom } from './api';
import { promises as fs } from 'fs';

async function main() {
  const program = new Command();

  program
    .name('snyk-collection-sbom')
    .description('Generate an SBOM document for a Snyk Project Collection')
    .version('1.0.0')
    .option('-o, --org-id <id>', 'Snyk Organization ID')
    .option('-c, --collection-id <id>', 'Snyk Collection ID')
    .addOption(new Option('-t, --token <token>', 'Snyk API Token').env('SNYK_TOKEN'))
    .option('-f, --format <format>', 'SBOM format (e.g., cyclonedx1.4+json, spdx2.3+json)')
    .option('--output <path>', 'Output file path (defaults to sbom-collection-{collection-id}.json)');

  program.parse(process.argv);

  const options: CliOptions = program.opts();

  if (program.getOptionValueSource('token') === 'env') {
    console.log('ℹ Using Snyk API Token from SNYK_TOKEN environment variable.');
  }

  try {
    // 1. Prompt for any missing required fields
    const config = await promptMissingOptions(options);

    console.log(`\nFetching SBOM for collection ${config.collectionId}...`);

    // 2. Fetch the SBOM from the Snyk API
    const sbomData = await fetchCollectionSbom(
      config.orgId,
      config.collectionId,
      config.token,
      config.format
    );

    // 3. Write the SBOM to the specified output file
    await fs.writeFile(config.output, sbomData, 'utf-8');
    
    console.log(`\n✅ Successfully generated SBOM!`);
    console.log(`Saved to: ${config.output}`);
  } catch (error: any) {
    console.error(`\n❌ Failed to generate SBOM: ${error.message}`);
    process.exit(1);
  }
}

main();
