# Complete repository AGENTS.md guidance

## Objective

Improve the repository-level `AGENTS.md` so coding agents can work safely and consistently in this TiddlyWiki static blog repository.

## Scope

- Document verified build, development, formatting, and test commands.
- Include commands for running one test file and one named Node test.
- Describe JavaScript, TiddlyWiki, CSS, Markdown, and tiddler conventions observed in the repository.
- Explain generated output, snapshot update workflow, and relevant CI behavior.
- Record the absence of Cursor and Copilot instruction files after checking the repository.
- Preserve the existing collection-specific guidance and correct any stale or unsupported claims.

## Acceptance criteria

- `AGENTS.md` is approximately 150 lines and is concise enough for agent context windows.
- Commands match `package.json`, scripts, README, and CI configuration.
- Style guidance is grounded in existing source rather than invented tooling.
- Single-test examples use Node's built-in test runner correctly.
- The file warns agents not to edit generated output manually.
- No Cursor or Copilot rules are omitted if they are later added.
- Existing unrelated working-tree changes are not overwritten.

## Validation

- Count the resulting `AGENTS.md` lines.
- Review the diff for accuracy and accidental changes.
- Do not create a commit unless explicitly requested.
