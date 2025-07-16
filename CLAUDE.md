# Project
- this project is called potato-bot
- potato-bot is a whatsapp bot
- the ideia 

# Packages
- the main package of this project is baileys, use this docs as reference: (https://baileys.wiki/docs/intro, https://www.npmjs.com/package/baileys)

# Developer Idea
the ideia here is to develop in a way that makes it easy to create new bot commands
using typescript

# The Golden Rule  
when unsure about implementation details, ALWAYS ask the developer.  

# Bash commands
- yarn build: build the project
- yarn start:dev: run the project
- yarn dashboard:dev: run the dashboard in development mode
- yarn dashboard:build: build the dashboard for production

# Dashboard Features
- Shows phone numbers of users who send commands
- Differentiates between private chats and group chats
- Displays bot responses in expandable dropdown cards
- Shows reaction context (what message was reacted to)
- Real-time updates every 5 seconds
- Changed "Groups" to "Chats" to reflect both group and private chat support
- Shows descriptive chat names including sender names for private chats
- Fetches actual group names from WhatsApp using Baileys groupMetadata API
- Implements caching for group metadata to improve performance
- Bot responses display in WhatsApp-like message bubbles with timestamps and read receipts
- Animated "typing..." indicator for pending responses
- Captures bot responses for both regular commands and reaction-based commands (like Steam game selection)
- Shows WhatsApp-style bot responses for reaction interactions
- Displays images in bot responses (like Steam game header images) within WhatsApp-style message bubbles
- Handles image loading errors gracefully

# Code
- use typescript
- don't bypass typescript with 'any' types

# Workflow
- Be sure to typecheck when you’re done making a series of code changes

# Guidelines
- Use `AIDEV-NOTE:`, `AIDEV-TODO:`, or `AIDEV-QUESTION:` (all-caps prefix) for comments aimed at AI and developers.  
- Use above comments rules to write questions for developer if you need to
- **Important:** Before scanning files, always first try to **locate existing anchors** `AIDEV-*` in relevant subdirectories. 

# Architeture and tecnologies
- For front-end use Vue3 composition API and Tailwind for CSS
- For js and Vu3 files, use Typescript
- For HTTP requests use Axios