# Contributing to JSGames

Thanks for your interest in contributing! Here's how to do it right.

## The Golden Rule: Small & Targeted

**Keep your PRs small and focused.** One feature, one fix, one game per PR.

Large "kitchen sink" PRs will be closed without review. This isn't personal — big PRs are:
- Hard to review properly
- More likely to have hidden issues
- Slower to merge
- A nightmare to revert if something breaks

If you have multiple things to contribute, open multiple PRs.

## Adding a Game

1. Fork the repo
2. Create a branch: `git checkout -b add-my-game`
3. Add your game folder under the appropriate category
4. Include a proper `package.json` with:
   - `name`, `version`, `description`
   - `main` pointing to your entry file
   - `gameLauncher` config (see existing games for examples)
5. Test it works with jsgamelauncher locally
6. Open a PR with a brief description and screenshot/gif if applicable

## Game Requirements

- Must work with [jsgamelauncher](https://github.com/nicef/jsgamelauncher)
- No external runtime dependencies (everything bundled)
- Reasonable file size (keep assets optimized)
- Include attribution if using third-party assets
- Don't break existing games

## Code Style

- Keep it simple and readable
- Match the style of surrounding code
- No unnecessary dependencies

## What We're Looking For

✅ New games that work well with the launcher  
✅ Bug fixes for existing games  
✅ Performance improvements  
✅ Documentation improvements  

## What We're NOT Looking For

❌ Massive refactors  
❌ "Improvements" that change how everything works  
❌ PRs that touch 50 files  
❌ AI-generated slop dumps  

## Questions?

Open an issue first if you're unsure whether your contribution fits.
