import json
import os
import shutil
import socket
import sys
import threading
import urllib.request
import webbrowser

APP_NAME = "Profile and Task Tracker"
OLD_APP_NAME = "Student Tracker"  # just in case the old data folder is still there
PREFERRED_PORT = 5050


def data_dir():
    if sys.platform == "win32":
        base = os.environ.get("APPDATA") or os.path.expanduser("~")
    else:  # Mac
        base = os.path.expanduser("~/Library/Application Support")
    path = os.path.join(base, APP_NAME)
    old_path = os.path.join(base, OLD_APP_NAME)
    if not os.path.exists(path) and os.path.isdir(old_path):
        os.rename(old_path, path)  # keep data from the "Student Tracker" version
    os.makedirs(path, exist_ok=True)
    return path


def app_location():
    if getattr(sys, "frozen", False):
        exe = os.path.abspath(sys.executable)
        # on a Mac the executable sits inside Profile and Task Tracker.app/Contents/MacOS/
        if sys.platform == "darwin" and ".app/Contents/MacOS" in exe:
            return os.path.dirname(exe.split(".app/Contents/MacOS")[0] + ".app")
        return os.path.dirname(exe)
    return os.path.dirname(os.path.abspath(__file__))


def import_old_database(db_path):
    if os.path.exists(db_path):
        return
    here = app_location()
    for candidate in (os.path.join(here, "tracker.db"),
                      os.path.join(here, "database", "tracker.db")):
        if os.path.isfile(candidate):
            shutil.copy2(candidate, db_path)
            return


def quiet_output(folder):
    if sys.stdout is None or sys.stderr is None:
        log = open(os.path.join(folder, "tracker.log"), "a", buffering=1, encoding="utf-8")
        sys.stdout = sys.stdout or log
        sys.stderr = sys.stderr or log


# ---------------------------------------------------------------- server

def tracker_already_running(port):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/classes", timeout=1) as r:
            return isinstance(json.loads(r.read()), list)
    except Exception:
        return False


def port_is_free(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def main():
    folder = data_dir()
    quiet_output(folder)

    db_path = os.path.join(folder, "tracker.db")
    import_old_database(db_path)
    os.environ["TRACKER_DB_PATH"] = db_path

    if tracker_already_running(PREFERRED_PORT):
        webbrowser.open(f"http://127.0.0.1:{PREFERRED_PORT}")
        return

    port = PREFERRED_PORT if port_is_free(PREFERRED_PORT) else 0

    from werkzeug.serving import make_server
    from app import app  # imported after TRACKER_DB_PATH is set

    server = make_server("127.0.0.1", port, app, threaded=True)
    url = f"http://127.0.0.1:{server.server_port}"
    threading.Thread(target=server.serve_forever, daemon=True).start()
    webbrowser.open(url)

    try:
        show_window(url, folder)
    except Exception:
        try:
            threading.Event().wait()
        except KeyboardInterrupt:
            pass
    finally:
        server.shutdown()


# ---------------------------------------------------------------- small window

def show_window(url, folder):
    import tkinter as tk

    if sys.platform == "darwin" and tk.TkVersion < 8.6:
        raise RuntimeError("Tk too old for this Mac")

    root = tk.Tk()
    root.title(APP_NAME)
    root.resizable(False, False)

    frame = tk.Frame(root, padx=24, pady=20)
    frame.pack()

    tk.Label(frame, text=f"🦔  {APP_NAME} is running",
             font=("Helvetica", 15, "bold")).pack(anchor="w")
    tk.Label(frame, justify="left", fg="#555", pady=8,
             text=("It opened in your web browser.\n"
                   "Keep this window open while you use the tracker.\n"
                   "Everything stays on this computer. Nothing goes online.")
             ).pack(anchor="w")

    buttons = tk.Frame(frame, pady=6)
    buttons.pack(fill="x")
    tk.Button(buttons, text="Open Tracker", width=14,
              command=lambda: webbrowser.open(url)).pack(side="left")
    tk.Button(buttons, text="Quit", width=10,
              command=root.destroy).pack(side="right")

    tk.Label(frame, text=f"Your data is saved in:\n{folder}", justify="left",
             fg="#888", font=("Helvetica", 10), pady=10).pack(anchor="w")

    root.protocol("WM_DELETE_WINDOW", root.destroy)
    root.update_idletasks()
    x = (root.winfo_screenwidth() - root.winfo_width()) // 2
    y = (root.winfo_screenheight() - root.winfo_height()) // 3
    root.geometry(f"+{x}+{y}")
    root.lift()
    root.mainloop()


if __name__ == "__main__":
    main()
