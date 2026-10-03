# Profile and Task Tracking System

## Summary
This website application was designed with a specific educational non-profit organization in mind. It was implemented for certain sites to improve the program's workflow and direct reporting capability, allowing afterschool program teachers to record reports and improving classroom management.

This website application was designed with **student data privacy**!
Therefore it is an **anonymous tracker** which requires teachers to assign student to each profile card(**animal name**) and **manually linking real names after exporting to excel**.

**No terminal and no Python needed.** Teachers get a single file. When they double click it, the tracker runs right on their own computer, and all their data stays offline on that computer.

------------------------------

### Get the app

On a Mac, double-click the downloaded `.zip` to unzip it, then drag **Profile and Task Tracker** into your **Applications** folder.

### Open it
Double-click **Profile and Task Tracker**. The tracker opens in your web browser, along with a small window that says "Profile and Task Tracker is running."

- **Keep that small window open** while you use the tracker. You can minimize it.
- Closed the browser tab by accident? Click **Open Tracker** in the small window.
- Done for the day? Click **Quit**.

### Data Privacy
- The tracker only works on this computer, and your data stays on this computer. Nothing is sent online.
- The tracker can't be reached from other computers, even on the same Wi-Fi.
- Students are shown only by animal names, never real names.

--------------------------------------

**Mac**
1. Install Python from https://www.python.org/downloads/ (the Python built into macOS can't be used; the script tells you if that's the problem).
2. Open Terminal, type `cd ` (with a space), drag this folder in, press Enter.
3. Run `bash build_mac.sh`.
4. Give teachers `dist/Profile-and-Task-Tracker-Mac-<chip>.zip`.

**Windows**
1. Install Python from https://www.python.org/downloads/. On the first installer screen, tick **"Add python.exe to PATH"**.
2. Double-click `build_windows.bat`.
3. Give teachers `dist\Profile and Task Tracker.exe`.

Please feel free to reach out to me with any questions you may have. Here is my email: laconnie.dev@gmail.com
