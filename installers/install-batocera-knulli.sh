#!/usr/bin/env bash

{ # this ensures the entire script is downloaded #
# this will exit the script if any error is encountered . . . 
# . . . it usually also exits the ssh connection so not using this for now
# set -e

# Not sure why nvm has all these functions but I don't mind them
my_has() {
  type "$1" > /dev/null 2>&1
}

my_distro_check() {
  if grep -q "knulli" /etc/issue; then
    return 0  # True
  elif grep -q "READY" /etc/issue; then
    return 0  # True
  else 
    return 1  # False
  fi
}

my_echo() {
  command printf %s\\n "$*" 2>/dev/null
}

#
# Unsets the various functions defined
# during the execution of the install script
#
my_reset() {
  unset -f my_has my_echo my_distro_check my_grep
}

my_echo "=> STARTING SAMPLE GAME INSTALL SCRIPT"

if [ -z "${BASH_VERSION}" ] || [ -n "${ZSH_VERSION}" ]; then
  my_echo >&2 'Error: the install instructions explicitly say to pipe the install script to `bash`; please follow them'
  exit 1
fi

my_grep() {
  GREP_OPTIONS='' command grep "$@"
}

# check to see if I'm running on a knulli device
if my_distro_check; then
  my_echo "=> This is a compatible device, /etc/issue says so"
else
  my_echo "=> This NOT is a compatible device, EXITING!!"
  exit 1
fi

my_warning() {
    my_echo "=> NOTE! You need to run the 'Update Gamelists' Knulli/Batocera option to get the game to show up. "
    my_echo "=> NOTE! This script assumes your roms are stored in /userdata/roms on the root device. "
    my_echo "=> NOTE! We need to do more testing on a device we a secondary SD card to get this to work in those situations. "
    my_echo "=> NOTE! This script will also delete and replace any existing games in /userdata/roms/jsgames that have matching names. "
}


my_warning

cd ~
my_echo "=> Cleaning up old files"
if [ -d "$HOME/newmygames.zip" ]; then
  my_echo "=> File ~/newmygames.zip exists. Deleting..."
  rm -rf ~/newmygames.zip
fi

if [ -d "$HOME/jsgames-main" ]; then
  my_echo "=> File ~/jsgames-main exists. Deleting..."
  rm -rf ~/jsgames-main
fi

my_echo "=> Downloading jsgames"
curl -o newmygames.zip -L https://github.com/monteslu/jsgames/archive/refs/heads/main.zip
unzip newmygames.zip



if my_distro_check; then
  my_echo "=> This is a compatible device so I'm copying the sample games"

  if [ -d "/userdata/roms/jsgames" ]; then
    my_echo "=> Folder /userdata/roms/jsgames exists, no need to create it."
  else 
    my_echo "=> Folder /userdata/roms/jsgames does not exist! That could be a problem."
    mkdir /userdata/roms/jsgames
  fi

  cd ~/jsgames-main
  for dir in *; do
    if [ -d "/userdata/roms/jsgames/$dir" ]; then
        echo "Deleting existing $dir game from /userdata/roms/jsgames"
        rm -rf /userdata/roms/jsgames/$dir
    else
        echo "Copying $dir game to /userdata/roms/jsgames"
    fi

  done
  cd ~
  mv jsgames-main/* /userdata/roms/jsgames/
  rm -r jsgames-main

  my_echo "=> INSTALL SUCCESSFUL!"
  cd ~
else
  my_echo "=> my_distro_check says this is NOT is a compatible device, so I'm not moving files around!"
  my_echo "=> INSTALL NOT SUCCESSFUL!"
fi

my_warning
my_reset

} # this ensures the entire script is downloaded #


