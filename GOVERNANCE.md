# Governance

This document describes how BarangayOne is maintained and how decisions are made.

## Project Roles

### Maintainers

Maintainers are responsible for:

- Reviewing and merging pull requests
- Managing releases and repository settings
- Triaging issues and discussions
- Enforcing the Code of Conduct
- Making final decisions when consensus is not reached

### Contributors

Contributors are anyone who helps improve the project through code, docs, testing, bug reports, design, or feedback.

## Decision-Making

We prefer consensus through open discussion in issues and pull requests.

When consensus cannot be reached in a reasonable timeframe, maintainers make the final decision based on:

- Project goals and roadmap fit
- Security, privacy, and reliability impact
- Maintenance cost and long-term support burden
- User and community benefit

## Pull Request Review Policy

- At least one maintainer review is required before merge.
- Changes affecting authentication, authorization, tenant isolation, database schema, or document generation may require additional review.
- Maintainers may request tests, docs, or decomposition into smaller PRs.

## Release and Change Policy

- Releases are managed by maintainers.
- Significant user-visible changes should be documented in release notes.
- Breaking changes should include migration guidance when possible.

## Security and Sensitive Areas

Because this project handles resident and barangay service data, maintainers prioritize:

- Access control and RBAC correctness
- Tenant isolation
- Data integrity and auditability
- Safe handling of personally identifiable information (PII)

Security disclosures should follow [SUPPORT.md](SUPPORT.md).

## Becoming a Maintainer

Contributors may be invited to become maintainers based on sustained, high-quality contributions, constructive collaboration, and demonstrated alignment with project standards.

## Governance Updates

Maintainers may update this document as the project evolves.
Substantial governance changes should be communicated in an issue or release note.
