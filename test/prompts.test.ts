import { promptMissingOptions } from '../src/prompts';
import prompts from 'prompts';

// Mock prompts
jest.mock('prompts');

describe('promptMissingOptions', () => {
  const originalExit = process.exit;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Prevent tests from actually exiting the process
    process.exit = jest.fn() as any;
    console.error = jest.fn();
    (prompts as unknown as jest.Mock).mockClear();
  });

  afterEach(() => {
    process.exit = originalExit;
    console.error = originalConsoleError;
  });

  it('should return options directly if all are provided without prompting', async () => {
    const fullOptions = {
      orgId: 'org1',
      collectionId: 'col1',
      token: 'tok1',
      format: 'cyclonedx1.4+json',
      output: 'custom.json',
    };

    (prompts as unknown as jest.Mock).mockResolvedValueOnce({});

    const result = await promptMissingOptions(fullOptions);

    expect(prompts).toHaveBeenCalledWith([]);
    expect(result).toEqual(fullOptions);
  });

  it('should prompt for missing options and merge them', async () => {
    const partialOptions = {
      orgId: 'org1',
      // missing collectionId, token, format, output
    };

    (prompts as unknown as jest.Mock).mockResolvedValueOnce({
      collectionId: 'col2',
      token: 'tok2',
      format: 'spdx2.3+json',
    });

    const result = await promptMissingOptions(partialOptions);

    expect(prompts).toHaveBeenCalledTimes(1);
    
    // Check that it asked for the 3 missing fields
    const questions = (prompts as unknown as jest.Mock).mock.calls[0][0];
    expect(questions).toHaveLength(3);
    expect(questions.map((q: any) => q.name)).toEqual(['collectionId', 'token', 'format']);

    expect(result).toEqual({
      orgId: 'org1',
      collectionId: 'col2',
      token: 'tok2',
      format: 'spdx2.3+json',
      output: 'sbom-collection-col2.json', // default output format
    });
  });

  it('should exit if required prompts are cancelled by the user', async () => {
    const emptyOptions = {};

    // Simulate user hitting Ctrl+C (prompts returns empty object)
    (prompts as unknown as jest.Mock).mockResolvedValueOnce({});

    await promptMissingOptions(emptyOptions);

    expect(console.error).toHaveBeenCalledWith('Missing required inputs. Exiting.');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should correctly default the output filename if omitted but all other options are provided', async () => {
    const optionsWithoutOutput = {
      orgId: 'org1',
      collectionId: 'col1',
      token: 'tok1',
      format: 'cyclonedx1.4+json',
      // output is missing
    };

    (prompts as unknown as jest.Mock).mockResolvedValueOnce({});

    const result = await promptMissingOptions(optionsWithoutOutput);

    expect(prompts).toHaveBeenCalledWith([]); // No prompts should be asked
    expect(result.output).toBe('sbom-collection-col1.json');
  });

  it('should validate prompt inputs correctly', async () => {
    const emptyOptions = {};
    (prompts as unknown as jest.Mock).mockResolvedValueOnce({
      orgId: 'org1',
      collectionId: 'col1',
      token: 'tok1',
      format: 'spdx2.3+json',
    });

    await promptMissingOptions(emptyOptions);
    
    const questions = (prompts as unknown as jest.Mock).mock.calls[0][0];
    
    const orgIdQuestion = questions.find((q: any) => q.name === 'orgId');
    expect(orgIdQuestion.validate('')).toBe('Organization ID is required');
    expect(orgIdQuestion.validate('  ')).toBe('Organization ID is required');
    expect(orgIdQuestion.validate('valid-org')).toBe(true);
  });
});
