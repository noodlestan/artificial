# Guide: Art MD Website

The `apps-art-md-web` demos Art MD features and hosts its documentation. It's an Astro-based static website deployed to production on AWS S3 with CloudFront.

## Recommended Reading

Agents SHOULD scan these files for definitions and resource locations when faced with uncertainty or ambiguity that may result from missing resources.

- `_guide.md` — this file: package overview, layout, and operating instructions.
- `README.md` — package readme.

## Package Layout

```
public/               — Public assets
src/
- assets/             — Importable assets.
- components/
- layouts/
- pages/
```

## Records Management

Records are co-located with the resources they describe in `_records/` directories:

- **Package:** `_records/package.art`
- **Deployment:** `_records/static-web-deployment.art`

## Knowledge References

This package does not maintain a dedicated architecture reference.

## Workflows

| Workflow / Path                                                       | Purpose                                          |
| --------------------------------------------------------------------- | ------------------------------------------------ |
| **Deploying** `$DOMAINS/deployments/workflows/deploying/workflow.art` | Organizes deployment of artefacts in operations. |

## Operating Instructions

### Operating Instructions: Setting Up

**Instructions:**

Run from the repository root (monorepo):

```bash
npm ci # to install dependencies.
```

### Operating Instructions: Verifying Step

**Instructions:**

Run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues
npm run build # to produce a full build
```

### Operating Instructions: Deploying Artefacts

**Instructions:**

Execute the **Deploying:** instructions of Deployment Command: Static Web AWS CLI `$DOMAINS/packages/_records/deployment-commands/static-web-aws-cli.art` with:

- deployment record: `_records/deployment-infrastracture.art`.
- environments: `_records/production-environment.art`, `_records/staging-environment.art`.
