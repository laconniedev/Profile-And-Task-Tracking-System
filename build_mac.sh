# Builds "dist/Profile and Task Tracker.app" and a zip of it to hand out.
# Run on a Mac:  bash build_mac.sh
set -e
cd "$(dirname "$0")"

PY=""
for candidate in python3.14 python3.13 python3.12 python3.11 python3.10 python3; do
  if command -v "$candidate" >/dev/null 2>&1 && \
     "$candidate" -c "import sys, tkinter; sys.exit(0 if tkinter.TkVersion >= 8.6 else 1)" >/dev/null 2>&1; then
    PY="$candidate"
    break
  fi
done

if [ -z "$PY" ]; then
  echo
  echo "STOP: This Mac needs a newer Python to build the app."
  echo "  1. Go to https://www.python.org/downloads/ and click the yellow Download button."
  echo "  2. Open the downloaded file and click through the installer."
  echo "  3. Run  bash build_mac.sh  again."
  exit 1
fi
echo "Building with $($PY --version) at $(command -v $PY)"

# start clean so nothing from an earlier build is reused.
rm -rf build-venv build dist
"$PY" -m venv build-venv
source build-venv/bin/activate
pip install -r requirements.txt pyinstaller
pyinstaller tracker.spec --noconfirm
cd dist
ditto -c -k --keepParent "Profile and Task Tracker.app" "Profile-and-Task-Tracker-Mac-$(uname -m).zip"
echo
echo "Done! Give teachers: dist/Profile-and-Task-Tracker-Mac-$(uname -m).zip"
