#! /bin/sh

function release_ports() {
  npx kill-port 4000 8080 9099 5001 8085 >/dev/null
}

trap release_ports TERM INT HUP

release_ports
firebase emulators:start  --import=./.emulatordb --export-on-exit=./.emulatordb