/**
 * ONM Energy — Automatic Discord Bot Listener
 *
 * This script runs in the background and listens to your Discord server.
 * Whenever messages are posted in monitored channels, it automatically:
 * 1. Collects discussion context.
 * 2. Runs the AI analysis engine.
 * 3. Categorizes alert level (🟢 Normal, 🟡 Attention Needed, 🔴 Critical).
 * 4. Saves the recap directly into your VP Dashboard database!
 *
 * Instructions:
 * 1. Set DISCORD_BOT_TOKEN="your_bot_token" in .env
 * 2. Run: node scripts/discord-bot.mjs
 */

import { Client, GatewayIntentBits } from 'discord.js'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const DASHBOARD_API = process.env.NEXTAUTH_URL || 'https://onm-dashboard.vercel.app'

if (!BOT_TOKEN) {
  console.log('ℹ️  DISCORD_BOT_TOKEN not set in environment. Set token to launch automatic Discord listener.')
} else {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.on('ready', () => {
    console.log(`🤖 ONM Discord Bot logged in as ${client.user?.tag}!`)
    console.log('📡 Listening to all server text channels for automatic thread recaps…')
  })

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return

    // Trigger on explicit command or keyword trigger
    if (message.content.startsWith('!recap') || message.content.includes('@VP-Alert')) {
      try {
        console.log(`⚡ Auto-analyzing thread from #${message.channel.name}…`)
        const channelName = `#${message.channel.name}`
        const threadTitle = message.cleanContent.replace('!recap', '').trim() || `Discussion in ${channelName}`

        // Fetch last 10 messages for context
        const fetched = await message.channel.messages.fetch({ limit: 10 })
        const rawMessages = fetched.map((m) => `[${m.createdAt.toLocaleTimeString()}] @${m.author.username}: ${m.cleanContent}`).reverse().join('\n')

        const res = await fetch(`${DASHBOARD_API}/api/discord-recap/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadTitle,
            channelName,
            rawMessages,
            threadUrl: message.url,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          await message.reply(`✅ **AI Executive Briefing Generated!**\nAlert Level: **${data.alertLevel}**\nView on VP Dashboard: ${DASHBOARD_API}/discord-recap`)
        }
      } catch (err) {
        console.error('Error analyzing message:', err)
      }
    }
  })

  client.login(BOT_TOKEN)
}
