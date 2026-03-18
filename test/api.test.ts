import { fetchCollectionSbom } from '../src/api';

describe('fetchCollectionSbom', () => {
  const mockOrgId = 'test-org-id';
  const mockCollectionId = 'test-collection-id';
  const mockToken = 'test-token';
  const mockFormat = 'cyclonedx1.4+json';
  
  beforeEach(() => {
    // Clear mock before each test
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch SBOM successfully', async () => {
    const mockSbomData = '{"bomFormat":"CycloneDX"}';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce(mockSbomData),
    });

    const result = await fetchCollectionSbom(mockOrgId, mockCollectionId, mockToken, mockFormat);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.snyk.io/rest/orgs/${mockOrgId}/collections/${mockCollectionId}/sbom?version=2024-10-14~experimental&format=${encodeURIComponent(mockFormat)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `token ${mockToken}`,
          'Accept': 'application/vnd.api+json',
        },
      }
    );
    expect(result).toBe(mockSbomData);
  });

  it('should throw an error if the API request fails', async () => {
    const mockErrorText = 'Not Found';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValueOnce(mockErrorText),
    });

    await expect(
      fetchCollectionSbom(mockOrgId, mockCollectionId, mockToken, mockFormat)
    ).rejects.toThrow(`API Error (404): ${mockErrorText}`);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network connection failed');
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    await expect(
      fetchCollectionSbom(mockOrgId, mockCollectionId, mockToken, mockFormat)
    ).rejects.toThrow('Network connection failed');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
