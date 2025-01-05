## JS Games

These are sample web games made with JavaScript meant for use with the [jsgamelauncher](https://github.com/monteslu/jsgamelauncher). They are meant to be used as a reference for making your own games and can be a starting point for your own projects.

You can run these games locally. Each one is a bit different but the general idea is that you might want to "build" the game and then run it or maybe you can just run it. For example, the "simple-vite" game will run after `npm install` and `npm run dev` as you would expect with a Vite project. But there is no requirement to use Vite.

## Conventions

If a game starts with "sample" it is meant to be a starting point for your own project. If it ends in "-ai" that means we used an AI to make the game by starting out with one of those sample projects and then chatting with an AI to make it into a finished game.

## Installing on Knulli

These are meant to be used with the [jsgamelauncher](https://github.com/monteslu/jsgamelauncher). Install that first using the curl command and then use a similar curl command to install these games.

NOTE! You need to run the 'Update Gamelists' Knulli option to get the game to show up.<br>
NOTE! This script assumes your roms are stored in /userdata/roms on the root device.<br>
NOTE! We need to do more testing on a device we a secondary SD card to get this to work in those situations.<br>
NOTE! This script will also delete and replace any existing games in /userdata/roms/jsgames that have matching names.<br>

- Make sure wifi is turned on for your knulli device
- `ssh root@<myKnullidevice>` (default password: linux, default device name : KNULLI, use IP from device if name fails)
- `curl -o- https://raw.githubusercontent.com/monteslu/jsgames/main/install-knulli.sh | bash`

## Installing on Batocera

Coming soon!
