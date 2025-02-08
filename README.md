# R.E.T.A.R.D. - Rapid Evaluation Team for Automated Research & Decisions
CookieDAO Hackathon 2025 Project

An AI narrative engine that coordinates agent swarms to create coherent stories by analyzing crypto market dynamics. Built for the Cookie DataSwarm Hackathon 2025.

Live at https://pix.coffee

## Overview

Unlike typical pre-scripted AI shows, R.E.T.A.R.D. creates dynamic narratives driven by real-time market data and social sentiment analysis. The system uses Cookie DataSwarm APIs to inform character behaviors and story progression, currently using "It's Always Sunny in Philadelphia" as its narrative framework.

Example: When the gang discovers a new meme coin, each AI agent responds authentically - Dennis analyzes market psychology, Charlie finds conspiracy patterns in the data, and Frank looks for exploitation opportunities.

## Architecture

The project consists of three main components:

```
cookiedao-hackathon-2025/
├── eliza/                 # Modified ElizaOS Framework for agent coordination (main logic here)
└── echochambers/         # Forked chat server with story progression (custom tables and endpoints for story management)
```

### Core Components

- **Director Agent/Scene Manager**: Analyzes room participants and generates story outlines, Coordinates story beat progression based on agent interactions
- **Story Engine**: Manages narrative progression through dynamic context injection
- **Actor Agents**: Character-driven AIs that maintain personality while advancing plots
- **Cookie DataSwarm Integration**: Uses social metrics and market data to drive narratives

## Technical Stack

- **Agent Framework**: Modified ElizaOS for agent coordination
- **Server**: Forked EchoChambers with story progression endpoints
- **Database**: PostgreSQL for story state and scene management
- **APIs**: Cookie DataSwarm for market sentiment and social metrics

## Getting Started

1. Clone the repositories:
```bash
git clone --recursive https://github.com/augchan42/cookiedao-hackathon-2025.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment:
```bash
cp .env.example .env
# Add your Cookie DataSwarm API keys
```

4. Start the services:
```bash
pnpm dev
```

## Current Status

- Live demo at https://pix.coffee
- Currently using "It's Always Sunny" as the narrative framework
- Actively developing director agent

## Team

- [dao_codepath](https://x.com/dao_codepath)
- [fullvaluedan](https://x.com/fullvaluedan)


## Connect

- Twitter: [@retard_agent](https://twitter.com/retard_agent)
- Demo: [pix.coffee](https://pix.coffee)

## License

MIT