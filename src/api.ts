export async function fetchCollectionSbom(
  orgId: string,
  collectionId: string,
  token: string,
  format: string
): Promise<string> {
  const url = `https://api.snyk.io/rest/orgs/${orgId}/collections/${collectionId}/sbom?version=2024-10-14~experimental&format=${encodeURIComponent(format)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  // The SBOM endpoint returns the raw SBOM document (e.g., JSON)
  return await response.text();
}
