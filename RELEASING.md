# Releasing

This project publishes to two places, and both must be updated for a release to
reach users:

- **npm** — `@scardis/omnifocus-mcp`, which is what `npx` and `npm install` fetch.
- **The MCP registry** — `io.github.steveardis/omnifocus`, which is how the
  server is discovered by MCP clients. It is driven by `server.json`.

Updating only npm leaves the registry pointing at the previous version.

## Before your first release

You need three things set up:

1. **An npm account with publish access to the `@scardis` scope.** Check with
   `npm whoami`.
2. **Two-factor authentication in `auth-and-writes` mode.** Confirm with
   `npm profile get`. npm rejects a publish without it, and `auth-only` is not
   enough. See [Two-factor authentication](#two-factor-authentication) below,
   because the setup path is narrower than npm's own docs suggest.
3. **The `mcp-publisher` CLI**, for the MCP registry:
   `brew install mcp-publisher`.

## Steps

### 1. Bump the version in both files

`package.json` has one version field. `server.json` has **two** — a top-level
`version` and a `version` inside `packages[0]`. Both must match `package.json`,
or the registry advertises a version that does not exist on npm.

### 2. Commit and push

Push before publishing, so the released commit exists on GitHub.

### 3. Publish to npm

Run this in your own terminal, not through an agent or a wrapper that captures
output:

```
npm publish
```

The second factor hands off to your browser, and the one-time URL it prints is
scrubbed from captured output, so a wrapped session stalls with no way to
complete the login.

`prepublishOnly` runs `npm run build` first, so the tarball is always built from
current sources.

### 4. Tag and create a GitHub release

```
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."
```

Tag the commit that npm published, which is the one from step 2.

### 5. Publish to the MCP registry

```
mcp-publisher login github
mcp-publisher publish
```

The login is a GitHub device-code flow and opens a browser, so run it in your
own terminal for the same reason as `npm publish`. Credentials are stored in
`~/.config/mcp-publisher/` and persist across releases, but they expire — expect
to log in again if it has been a while. A stale token surfaces as
`Error: not authenticated`.

### 6. Verify what actually shipped

Do not trust the local build. Check the published artifact:

```
npm pack @scardis/omnifocus-mcp@X.Y.Z
tar tzf scardis-omnifocus-mcp-X.Y.Z.tgz | grep -c 'dist/snippets/.*\.js'   # expect 27
tar xzf scardis-omnifocus-mcp-X.Y.Z.tgz && head -1 package/dist/server.js  # expect #!/usr/bin/env node
```

Both checks matter, and each corresponds to a version that shipped broken.

The shebang matters because `package.json` declares `dist/server.js` as the
`bin` entry, so `npx` executes it directly rather than through `node`. Without
`#!/usr/bin/env node` as the first line of `src/server.ts`, the shell runs it as
a shell script and every import fails with `import: command not found`. Versions
up to and including 0.2.0 shipped without it, so the `npx` install path in the
README did not work at all.

The snippet count matters. `tsc` compiles only TypeScript, so the plain `.js`
files in `src/snippets/` reach `dist/` solely through the `copy:snippets` step
in `npm run build`. Version 0.1.2 shipped with none of them and every tool call
failed with `snippet could not be loaded`. `scripts/copy-snippets.ts` now fails
the build if a snippet in the loader's allowlist has no source file, but
verifying the published tarball is the check that cannot be fooled.

Confirm both registries agree:

```
npm view @scardis/omnifocus-mcp version
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.steveardis/omnifocus" | grep -o '"version":"[^"]*"' | tail -2
```

npm can take a few minutes to propagate after a successful publish, so an
immediate check can show the previous version even when nothing is wrong.

## Two-factor authentication

npm requires 2FA to publish. Since 2026 it **no longer accepts new
authenticator-app (TOTP) enrollments** — `npm profile enable-2fa auth-and-writes`
fails with a 404 telling you to use a security key instead.

Enrol a security key at <https://www.npmjs.com/settings/YOUR_USERNAME/tfa>. On a
Mac, Touch ID registers as a passkey and works. Save the recovery codes: with
TOTP unavailable, they are the only fallback if you lose the key.

Because the second factor is a security key rather than a code, `npm publish`
does not accept `--otp`. It opens a browser instead.

This also means publishing cannot run unattended in CI without a granular access
token that bypasses 2FA, and npm has announced it is restricting that token
type. Plan on releases being a manual step.
