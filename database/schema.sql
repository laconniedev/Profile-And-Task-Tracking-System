PRAGMA foreign_keys = ON; /* enable foreign key constraints */

/* classes -> students -> daily_records -> reports */

CREATE TABLE IF NOT EXISTS classes (
    id            INTEGER PRIMARY KEY autoincrement,
    name          TEXT NOT NULL,
    student_count INTEGER NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
    id          INTEGER PRIMARY KEY autoincrement,
    class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    animal_name TEXT NOT NULL,
    seat_order  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_records (
    id                  INTEGER PRIMARY KEY autoincrement,
    student_id          INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    record_date         TEXT NOT NULL,  
    assigned_homework   INTEGER NOT NULL DEFAULT 0,   
    completed_homework  INTEGER NOT NULL DEFAULT 0,   
    meets_expectations  INTEGER NOT NULL DEFAULT 0,   
    UNIQUE(student_id, record_date)
);

CREATE TABLE IF NOT EXISTS reports (
    id           INTEGER PRIMARY KEY autoincrement,
    student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    report_text  TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
