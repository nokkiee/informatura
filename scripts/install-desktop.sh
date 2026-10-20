#!/usr/bin/env bash
# Adds Informatura to your application menu when running from source.
# No root needed:  scripts/install-desktop.sh            install
#                  scripts/install-desktop.sh --remove   uninstall
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA="${XDG_DATA_HOME:-$HOME/.local/share}"
DESKTOP="$DATA/applications/informatura.desktop"
ICON_BASE="$DATA/icons/hicolor"

if [[ "${1:-}" == "--remove" ]]; then
  rm -f "$DESKTOP"
  for s in 16 24 32 48 64 128 256 512; do rm -f "$ICON_BASE/${s}x${s}/apps/informatura.png"; done
  command -v update-desktop-database >/dev/null && update-desktop-database "$DATA/applications" || true
  echo "Removed the Informatura launcher."
  exit 0
fi

# The app used to be called MaturaLab; drop its old launcher.
rm -f "$DATA/applications/maturalab.desktop"
for s in 16 24 32 48 64 128 256 512; do rm -f "$ICON_BASE/${s}x${s}/apps/maturalab.png"; done

ELECTRON="$APP_DIR/node_modules/.bin/electron"
[[ -x "$ELECTRON" ]] || { echo "Run 'npm install' in $APP_DIR first." >&2; exit 1; }

mkdir -p "$DATA/applications"
for s in 16 24 32 48 64 128 256 512; do
  mkdir -p "$ICON_BASE/${s}x${s}/apps"
  cp "$APP_DIR/build/icons/${s}x${s}.png" "$ICON_BASE/${s}x${s}/apps/informatura.png"
done

cat > "$DESKTOP" <<DESKTOP_ENTRY
[Desktop Entry]
Type=Application
Name=Informatura
GenericName=Matura z informatyki
Comment=Zadania z matur z informatyki (poziom rozszerzony): kod, SQL, arkusz, teoria
# --no-sandbox: when started by the desktop shell, Chromium falls back to the SUID sandbox helper, which a
# source checkout cannot have set up (it needs root). The .deb package configures the sandbox properly instead.
Exec="$ELECTRON" --no-sandbox "$APP_DIR"
Path=$APP_DIR
Icon=informatura
Terminal=false
Categories=Education;
Keywords=matura;informatyka;python;cpp;java;sql;excel;
StartupWMClass=informatura
DESKTOP_ENTRY

command -v update-desktop-database >/dev/null && update-desktop-database "$DATA/applications" || true
command -v gtk-update-icon-cache >/dev/null && gtk-update-icon-cache -q -t "$ICON_BASE" || true
echo "Installed: $DESKTOP"
echo "Informatura now appears in your application menu."
