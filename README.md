## JS Games

These are sample web games made with JavaScript meant for use with the [jsgamelauncher](https://github.com/monteslu/jsgamelauncher). They are meant to be used as a reference for making your own games and can be a starting point for your own projects.

You can run these games locally. Each one is a bit different but the general idea is that you might want to "build" the game and then run it or maybe you can just run it. For example, the "simple-vite" game will run after `npm install` and `npm run dev` as you would expect with a Vite project. But there is no requirement to use Vite.

## Conventions

If a game starts with "sample" or "simple" it is meant to be a starting point for your own project. If it ends in "-ai" that means we used an AI to make the game by starting out with one of those sample projects and then chatting with an AI to make it into a finished game.

## Installing on [Knulli](https://knulli.org/) or [Batocera](https://batocera.org/)

These are meant to be used with the [jsgamelauncher](https://github.com/monteslu/jsgamelauncher). Install that first using the curl command and then use a similar curl command to install these games.

NOTE! You need to run the 'Update Gamelists' Knulli/Batocera option to get the game to show up.<br>
NOTE! This script assumes your roms are stored in /userdata/roms on the root device.<br>
NOTE! We need to do more testing on a device we a secondary SD card to get this to work in those situations.<br>
NOTE! This script will also delete and replace any existing games in /userdata/roms/jsgames that have matching names.<br>

- Make sure wifi is turned on for your Knulli device or you are otherwise connected to the internet on a Batocera device
- `ssh root@<myDevice>` (default password: linux, default device name : KNULLI or BATOCERA, use IP from device or <myDevice>.local if name fails)
- `curl -o- https://raw.githubusercontent.com/monteslu/jsgames/main/installers/install-batocera-knulli.sh | bash`

## Installing on [ROCKNIX](https://rocknix.org/)

These are meant to be used with the [jsgamelauncher](https://github.com/monteslu/jsgamelauncher). Install that first using the curl command and then use a similar curl command to install these games.

NOTE! You need to run the 'Update Gamelists' Emulation Station option to get the game to show up.<br>
NOTE! This script assumes your roms are stored in /roms on the root device.<br>
NOTE! We need to do more testing on a device we a secondary SD card to get this to work in those situations.<br>
NOTE! This script will also delete and replace any existing games in /roms/jsgames that have matching names.<br>

- Make sure wifi is turned on for your device or you are otherwise connected to the internet
- `ssh root@<myDevice>` (default password: rocknix, default device name is the chipset, for example H700 or SD856 . . look it up on the network screen) or use IP from device or <myDevice>.local if name fails)
- `curl -o- https://raw.githubusercontent.com/monteslu/jsgames/main/installers/install-rocknix.sh | bash`

## Installing on [muOS](https://muos.dev/)

Coming soon! According to [joyrider3774](https://www.reddit.com/user/joyrider3774/) on this [thread](https://www.reddit.com/r/ANBERNIC/comments/1hsyv9n/comment/m5e2zsy/?context=3) all we need to do is install the GNU versions of ls and tar so that the curl command for installing nvm works.
