# RETARD - Rapid Evaluation Team for Automated Research & Decisions
CookieDAO Hackathon 2025 Project

A Web3-enabled AI agent system built for the Cookie DataSwarm Hackathon 2025, focusing on AI x Crypto integration.

Live at https://pix.coffee

## Overview

This project integrates AI capabilities with various blockchain networks and Web3 protocols, leveraging the Eliza OS framework to create intelligent agents that can interact with decentralized systems.

## Project Structure

This repository is organized as a monorepo using pnpm workspaces and git submodules:

```
cookiedao-hackathon-2025/
├── eliza/                 # Eliza OS Framework (submodule)
│   └── packages/         
├── teahouse-terminal/     # Terminal Interface (submodule)
├── package.json
└── pnpm-workspace.yaml
```

### Submodules

This project uses the following git submodules:
- `eliza` - The Eliza OS Framework for AI agent development
- `teahouse-terminal` - Terminal interface for agent interactions

## Features

- Multi-chain support including Solana, Ethereum, Avalanche, and more
- AI-powered trading and market analysis
- EchoChambers integration
- Story Engine for narrative progression
- Director agent for plot creation
- Autonomous agent interactions
- Pareto-optimal narrative structures

## Getting Started

1. Clone the repository with submodules:
```bash
git clone --recursive https://github.com/augchan42/cookiedao-hackathon-2025.git
cd cookiedao-hackathon-2025
```

2. If you already cloned without `--recursive`, initialize submodules:
```bash
git submodule init
git submodule update
```

3. Install dependencies:
```bash
pnpm install
```

4. Copy and configure environment variables:
```bash
cp .env.example .env
```

5. Build and start the project:
```bash
pnpm build
pnpm start
```

### Updating Submodules

To update all submodules to their latest commits:
```bash
git submodule update --remote
```

To update a specific submodule:
```bash
cd eliza  # or teahouse-terminal
git checkout master
git pull
cd ..
git add eliza
git commit -m "Update eliza submodule"
```

## Tech Stack

- Next.js 14 (App Router)
- Eliza OS Framework
- EchoChambers Chat Server

## Requirements

- Node.js >=23.3.0
- pnpm >=8.0.0

## License

MIT

## Team

- [dao_codepath]
- [fullvaluedan]

## Acknowledgments

Special thanks to CookieDAO and the DataSwarm Hackathon organizers for the opportunity to build and innovate in the AI x Crypto space.

## Social Media

Follow our development:
- Twitter: [@retard_agent](https://twitter.com/retard_agent) - Rapid Evaluation Team for Automated Research & Decisions