# The Time Wizard

A Discord bot that tracks and analyzes the time users spend in voice channels. Get detailed statistics about voice channel usage, compare users' activity, and view server-wide leaderboards.

## Features

- 🕒 Real-time voice activity tracking
- 📈 Multiple time period views (daily, weekly, monthly, yearly, all-time)
- 🤝 User comparison functionality
- 💾 Persistent data storage using SQLite
- ⚡ Slash command support

## Commands

### Time Tracking
* `/timespent [period] [user]` - Shows time spent in voice channels
  * `period` - daily/weekly/monthly/yearly/all (default: all)
  * `user` - @user mention (default: yourself)
 
* `/compare <user1> <user2>` - Compare voice time between two users
  * `user1` - first @user mention
  * `user2` - second @user mention

* `/leaderboard [period] [page]` - Shows server leaderboard
  * `period` - daily/weekly/monthly/yearly/all (default: all)
  * `page` - Page number (default: 1)

### Activity Analysis
* `/average [user]` - Shows average daily voice time
  * `user` - @user mention (default: yourself)
  * Displays average time spent in voice per day

* `/stats [user]` - Shows detailed voice activity patterns
  * `user` - @user mention (default: yourself)
  * Displays hourly and daily activity graphs
  * Shows peak activity times and patterns

* `/serverstats` - Shows server-wide voice activity statistics
  * Displays server-wide activity patterns
  * Shows total users and average daily users
  * Includes hourly and daily activity graphs with user counts

## Prerequisites

- Node.js 16.9.0 or higher
- Discord Bot Token
- SQLite3
- replace the token field in `config.json`
