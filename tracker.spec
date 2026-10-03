import sys

APP_NAME = "Profile and Task Tracker"

a = Analysis(
    ["launcher.py"],
    pathex=[],
    
    datas=[
        ("templates", "templates"),
        ("static", "static"),
        ("database/schema.sql", "database"),
    ],
    hiddenimports=["app"],
    excludes=["pytest", "numpy", "pandas", "matplotlib"],
    noarchive=False,
)
pyz = PYZ(a.pure)

if sys.platform == "darwin":
    exe = EXE(
        pyz, a.scripts, [],
        exclude_binaries=True,
        name=APP_NAME,
        console=False,
        upx=False,
    )
    coll = COLLECT(exe, a.binaries, a.datas, name=APP_NAME, upx=False)
    app = BUNDLE(
        coll,
        name=f"{APP_NAME}.app",
        bundle_identifier="dev.laconnie.profileandtasktracker",
        info_plist={"NSHighResolutionCapable": True},
    )
else:
    exe = EXE(
        pyz, a.scripts, a.binaries, a.datas, [],
        name=APP_NAME,
        console=False,   # no black command window
        upx=False,       # UPX makes antivirus tools more suspicious
    )
