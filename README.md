# The Time Wizard

A Discord bot that tracks and analyzes the time users spend in voice channels. Get detailed statistics about voice channel usage, compare users' activity, and view server-wide leaderboards.

## Features

- 🕒 Real-time voice activity tracking
- 📈 Multiple time period views (daily, weekly, monthly, all-time)
- 🤝 User comparison functionality
- 💾 Persistent data storage using SQLite
- ⚡ Slash command support

## Commands

- `/timespent [period] [user]` - Check time spent in voice channels
  - View your own or another user's voice time
  - Optional periods: daily, weekly, monthly, all-time

- `/leaderboard [period]` - Display server-wide voice time rankings
  - View top users by voice activity
  - Optional periods: daily, weekly, monthly, all-time

- `/compare <user1> <user2>` - Compare voice time between two users
  - Shows detailed comparison with time differences

## Prerequisites

- Node.js 16.9.0 or higher
- Discord Bot Token
- SQLite3
- replace the token field in `config.json`
