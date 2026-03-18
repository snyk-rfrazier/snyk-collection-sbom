# Snyk Collection SBOM Generator

A simple, user-friendly TypeScript CLI tool to generate Software Bill of Materials (SBOM) documents for Snyk Project Collections using the Snyk REST API.

## Features

- **Interactive Prompts:** Gracefully asks for any missing required information (Org ID, Collection ID, API Token, Format).
- **CLI Flags:** Fully automatable via command-line arguments for use in CI/CD pipelines.
- **Multiple Formats:** Supports CycloneDX (v1.4, v1.5, v1.6) and SPDX (v2.3).
- **Secure Token Handling:** Masks API token input during interactive prompts and supports the `SNYK_TOKEN` environment variable.

## Prerequisites

- **Node.js:** v18 or higher (uses native `fetch`)
- **Snyk API Token:** A valid Snyk API token with permissions to read the target organization and collection.

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/snyk-rfrazier/snyk-collection-sbom.git
   cd snyk-collection-sbom
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Usage

You can run the tool in development mode using `ts-node` via `npm start`, or build it and run the compiled JavaScript.

### Interactive Mode

The easiest way to use the tool is to simply start it. If you don't provide the required flags, it will interactively prompt you for them:

```bash
npm start
```

### CLI Flags Mode

For automation or quick execution, you can pass all configurations via CLI flags. Note the `--` before the flags when using `npm start`:

```bash
npm start -- \
  --org-id "your-org-id" \
  --collection-id "your-collection-id" \
  --format "cyclonedx1.4+json" \
  --output "my-custom-sbom.json"
```

### Environment Variables

You can set your Snyk API token as an environment variable to avoid entering it every time:

```bash
export SNYK_TOKEN="your-snyk-api-token"
npm start
```

### Global Installation (Optional)

If you want to install this tool globally on your machine so you can run it from anywhere without `npm start`:

```bash
npm run build
npm install -g .
```

Then you can run it directly:

```bash
snyk-collection-sbom --org-id "your-org-id" --collection-id "your-collection-id"
```

## Command Line Options

| Flag | Alias | Description | Default |
| :--- | :--- | :--- | :--- |
| `--org-id` | `-o` | Snyk Organization ID | *Prompted if missing* |
| `--collection-id` | `-c` | Snyk Collection ID | *Prompted if missing* |
| `--token` | `-t` | Snyk API Token | `$SNYK_TOKEN` or *Prompted* |
| `--format` | `-f` | SBOM format | *Prompted if missing* |
| `--output` | | Output file path | `sbom-collection-{id}.json` |

## Supported SBOM Formats

When prompted, you can select from the following formats. If using the `--format` flag, use the exact string value:

- `cyclonedx1.4+json` (CycloneDX v1.4)
- `cyclonedx1.5+json` (CycloneDX v1.5)
- `cyclonedx1.6+json` (CycloneDX v1.6)
- `spdx2.3+json` (SPDX v2.3)

## Development & Testing

To build the project into standard JavaScript:

```bash
npm run build
```

To run the unit tests (powered by Jest):

```bash
npm test
```

To run the compiled production build:

```bash
npm run start:prod
```
