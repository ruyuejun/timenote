# Electron Vite Svelte

A modern desktop application template built with [Electron](https://www.electronjs.org/), [Svelte](https://svelte.dev/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/).

The template includes a practical development workflow with code quality checks, formatting, conventional commits, Git hooks, automatic updates, and packaging support.

## Features

- Electron 43
- Svelte 5
- TypeScript
- Shadcn
- Tailwind CSS and Sass
- Electron Builder packaging configuration
- Electron Updater integration
- Vite-powered development and production builds
- Vitest and Playwright setup
- Oxlint and Oxfmt for linting and formatting
- Commitizen and Commitlint for consistent commit messages
- Lefthook Git hooks
- AVIF image conversion utility

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer
- Git
- Python 3.12 or newer

Check your installed versions:

```bash
node --version
pnpm --version
git --version
python -V
```

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd electron-vite-svelte
pnpm install
pnpm run dev # pnpm run dev:h5 will start the web server without electron
```

The `prepare` script installs the configured Lefthook Git hooks automatically after installation.

If the network connection is poor, you can directly download the zip archive of electron and replace the install.js file in node_modules/electron：

```js
// downloadArtifact.then(extractFile) ->
extractFile('/Users/mac/Downloads/electron-v43.4.0-darwin-arm64.zip')

// then run
pnpm store prune
pnpm i
```

## Development

Start the Vite development server:

```bash
pnpm dev
```

The development environment is configured through `.env.development`. Update the values in that file when your local API or WebSocket services use different addresses.

## Build

Build the application for production:

```bash
pnpm build
```

Preview the generated Vite output:

```bash
pnpm preview
```

The production build output is generated in the `dist` directory. Electron packaging output is configured to use the `release` directory.

If you cann't download the dmgbuild-bundle, you can set mirror like this：

```txt
# Mac
export ELECTRON_BUILDER_BINARIES_MIRROR="https://cdn.npmmirror.com/binaries/electron-builder-binaries"

# Windows (CMD)
set ELECTRON_BUILDER_BINARIES_MIRROR="https://cdn.npmmirror.com/binaries/electron-builder-binaries"

# Windows (PowerShell)
$env:ELECTRON_BUILDER_BINARIES_MIRROR="https://cdn.npmmirror.com/binaries/electron-builder-binaries"
```

## Project Structure

```text
.
├── electron
│   ├── main       # Electron main process
│   └── preload    # Secure renderer bridge
├── img2avif       # Image conversion utility
├── src
│   ├── assets     # Static assets (images, fonts, etc.)
│   ├── components # Application-specific components
│   │   ├── editor # Editor-related components
│   │   ├── layout # Layout components (header, sidebar, etc.)
│   │   └── ui     # Application UI components
│   ├── lib        # Reusable library code
│   │   ├── clsx   # Class name utility
│   │   ├── components
│   │   │   └── ui # Shadcn UI components (badge, button, card, modal, etc.)
│   │   └── editor # Editor utilities
│   ├── mock       # Mock data for development
│   ├── plugins    # Vite/application plugins
│   ├── routes     # Application routes
│   ├── stores     # Svelte stores for state management
│   ├── types      # TypeScript type definitions
│   ├── utils      # Utility functions
│   ├── app.css    # Global styles
│   ├── app.html   # Main app template
│   └── main.ts    # Renderer entry point
├── .env.development
├── .env.production
├── lefthook.yml
├── package.json
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

- **`src/components/`**: Contains application-specific components that are tied to your app's business logic and features (editor, layout, UI widgets).
- **`src/lib/`**: Houses reusable library code that can be shared across projects:
  - **`lib/components/ui/`**: Shadcn-based UI primitives (badge, button, card, modal) that follow a consistent design system.
  - **`lib/clsx/`** and **`lib/editor/`**: Utility modules for class names and editor functionality.

## Code Quality and Git Hooks

This template uses Lefthook to automate repository checks:

- `pre-commit` runs lint checks for staged files.
- `commit-msg` validates commit messages with Commitlint.
- `pre-push` runs a production build when frontend-related files have changed.

Commit messages should follow the configured Conventional Commits format:

```text
<type>(<scope>): <subject>
```

Use the interactive commit prompt when possible:

```bash
pnpm commit
```

You can also validate the code manually before committing:

```bash
pnpm lint
pnpm format:check
pnpm build
```

## Testing

Vitest and Playwright are included in the development dependencies. Add unit tests and end-to-end tests according to the needs of your application, then run them with the corresponding test runner commands.

## Image Conversion

The repository includes a small utility for converting images to AVIF format. Run it with:

```bash
pnpm img2avif
```

Review the utility configuration before using it in a production asset pipeline.
