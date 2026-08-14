/**
 * ONM Energy — Silent Automatic Discord Listener
 *
 * This script runs silently in the background. It reads incoming Discord messages
 * across monitored channels, runs the AI analysis engine, and saves recaps directly
 * to your VP Dashboard without sending any reply messages inside Discord.
 */

import { Client, GatewayIntentBits } from 'discord.js'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const DASHBOARD_API = process.env.NEXTAUTH_URL || 'https://onm-dashboard.vercel.app'

if (!BOT_TOKEN) {
  console.log('ℹ️  DISCORD_BOT_TOKEN not set in environment. Set token to launch silent listener.')
} else {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.on('ready', () => {
    console.log(`🤖 ONM Silent Discord Bot logged in as ${client.user?.tag}!`)
    console.log('📡 Silent Read-Only Mode Active: Listening to text channels & generating recaps on VP Dashboard…')
  })

  client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return

    try {
      const channelName = `#${message.channel.name}`
      const threadTitle = message.cleanContent.slice(0, 80) || `Discussion in ${channelName}`

      // Fetch last 8 messages for context
      const fetched = await message.channel.messages.fetch({ limit: 8 })
      const rawMessages = fetched
        .map((m) => `[${m.createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}] @${m.author.username}: ${m.cleanContent}`)
        .reverse()
        .join('\n')

      console.log(`⚡ Silent Auto-Analysis for ${channelName}…`)

      // Send to AI engine (Silent DB creation, ZERO Discord reply)
      await fetch(`${DASHBOARD_API}/api/discord-recap/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadTitle,
          channelName,
          rawMessages,
          threadUrl: message.url,
        }),
      })

      // NOTE: Zero message.reply() call — completely silent in Discord chat!
    } catch (err) {
      console.error('Error analyzing message:', err)
    }
  })

  client.login(BOT_TOKEN)
}
