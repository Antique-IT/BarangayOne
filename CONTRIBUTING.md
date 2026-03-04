# Contributing to BarangayOne

Thank you for your interest in contributing to BarangayOne.

## Code of Conduct

By participating in this project, you agree to follow our code of conduct in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Ways to Contribute

- Report bugs
- Suggest features or UX improvements
- Improve documentation
- Submit fixes and enhancements via pull requests

## Before You Start

1. Check open issues and pull requests to avoid duplicate work.
2. Create a focused branch for your change.
3. Keep changes small and scoped to one concern.

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install and Run

```bash
pnpm install
pnpm prisma db push
pnpm run seed
pnpm run dev
```

### Quality Checks

Run these before opening a PR:

```bash
pnpm run lint
pnpm run build
```

## Branch and Commit Guidance

- Branch naming: `feature/<short-name>`, `fix/<short-name>`, `docs/<short-name>`
- Write clear commit messages in imperative mood (e.g., `Fix resident filtering in dashboard`).
- If your change affects user-facing behavior, include screenshots or GIFs where relevant.

## Pull Request Checklist

Please ensure your PR:

- Clearly explains the problem and solution
- Links related issue(s)
- Includes testing notes (what you tested and how)
- Updates docs for any behavior/configuration changes
- Passes lint and build checks

## Coding Standards

- Use TypeScript and keep strict typing where possible.
- Follow existing patterns in `app/`, `components/`, `services/`, and `lib/`.
- Keep API handlers and services aligned with current role and tenant-guard patterns.
- Prefer small, reusable components.
- Avoid unrelated refactors in the same PR.

## Database Changes (Prisma)

When schema updates are needed:

1. Update `prisma/schema.prisma`
2. Run `pnpm prisma db push`
3. Re-run `pnpm prisma generate` if needed (usually handled by postinstall)
4. Update seeds when required and verify locally
5. Mention data/migration impact in the PR description

## Security Issues

Please do **not** open public issues for security vulnerabilities.
Report them privately as described in [SUPPORT.md](SUPPORT.md).

## Questions

For usage questions and general help, see [SUPPORT.md](SUPPORT.md).
