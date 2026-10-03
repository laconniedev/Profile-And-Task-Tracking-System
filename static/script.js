(() => {
  "use strict";

  const setupSection = document.getElementById("setupSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const footerBar = document.getElementById("footerBar");
  const topbarMeta = document.getElementById("topbarMeta");

  const setupForm = document.getElementById("setupForm");
  const setupError = document.getElementById("setupError");
  const existingClasses = document.getElementById("existingClasses");
  const classChips = document.getElementById("classChips");

  const dashClassName = document.getElementById("dashClassName");
  const dashDate = document.getElementById("dashDate");
  const studentGrid = document.getElementById("studentGrid");
  const switchClassBtn = document.getElementById("switchClassBtn");
  const exportBtn = document.getElementById("exportBtn");

  const drawer = document.getElementById("reportsDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerStudentName = document.getElementById("drawerStudentName");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const reportForm = document.getElementById("reportForm");
  const reportText = document.getElementById("reportText");
  const reportList = document.getElementById("reportList");

  const toast = document.getElementById("toast");

  let currentClass = null;   
  let currentStudentId = null;
  let currentDashboardDate = null;

  const LAST_CLASS_KEY = "fieldreports_last_class_id";

  /* notification popups! */
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("show"));
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => (toast.hidden = true), 200);
    }, 1800);
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
  }

  function formatDateHeading(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    });
  }

 /* load existing cohorts */

  async function loadExistingCohorts() {
    const classes = await api("/api/classes");
    if (classes.length === 0) {
      existingClasses.hidden = true;
      return;
    }
    classChips.innerHTML = "";
    classes.forEach((c) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = `${c.name} · ${c.student_count} students`;
      chip.addEventListener("click", () => openClass(c));
      classChips.appendChild(chip);
    });
    existingClasses.hidden = false;
  }

  setupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setupError.hidden = true;
    const name = document.getElementById("className").value.trim();
    const student_count = parseInt(document.getElementById("studentCount").value, 10);

    try {
      const cls = await api("/api/classes", {
        method: "POST",
        body: JSON.stringify({ name, student_count }),
      });
      openClass(cls);
    } catch (err) {
      setupError.textContent = err.message;
      setupError.hidden = false;
    }
  });

  switchClassBtn.addEventListener("click", () => {
    dashboardSection.hidden = true;
    footerBar.hidden = true;
    topbarMeta.textContent = "";
    setupSection.hidden = false;
    loadExistingCohorts();
  });

/* open a cohort */
  async function openClass(cls) {
    currentClass = cls;
    localStorage.setItem(LAST_CLASS_KEY, String(cls.id));

    setupSection.hidden = true;
    dashboardSection.hidden = false;
    footerBar.hidden = false;

    dashClassName.textContent = cls.name;
    exportBtn.href = `/api/export/${cls.id}`;
    topbarMeta.textContent = `${cls.student_count} students`;

    await refreshDashboard();
  }

  async function refreshDashboard() {
    const data = await api(`/api/dashboard/${currentClass.id}`);
    currentDashboardDate = data.date;
    dashDate.textContent = formatDateHeading(data.date);
    renderGrid(data.students);
  }

  function renderGrid(students) {
    studentGrid.innerHTML = "";
    students.forEach((s) => {
      studentGrid.appendChild(buildStudentCard(s));
    });
  }

  function buildStudentCard(s) {
    const card = document.createElement("article");
    card.className = "student-card";
    card.dataset.studentId = s.student_id;

    const head = document.createElement("div");
    head.className = "student-card-head";

    const name = document.createElement("span");
    name.className = "student-name";
    name.textContent = s.animal_name;

    const reportButton = document.createElement("button");
    reportButton.type = "button";
    reportButton.className = "report_button";
    reportButton.title = "Write a report";
    reportButton.textContent = "📝";
    reportButton.addEventListener("click", () => openReport(s.student_id, s.animal_name, reportButton));

    head.appendChild(name);
    head.appendChild(reportButton);
    card.appendChild(head);

    card.appendChild(buildToggleRow(s.student_id, "assigned_homework", "Assigned Homework?", s.assigned_homework, "row-assigned", card));
    card.appendChild(buildToggleRow(s.student_id, "completed_homework", "Completed Homework", s.completed_homework, "row-completed", card));
    card.appendChild(buildToggleRow(s.student_id, "meets_expectations", "Meets Expectations", s.meets_expectations, "row-meets", card));

    checkHasReports(s.student_id, reportButton);
    syncCardHighlight(card);

    return card;
  }

  function syncCardHighlight(card) {
    const boxes = card.querySelectorAll('input[type="checkbox"]');
    const allChecked = boxes.length > 0 && Array.from(boxes).every((b) => b.checked);
    card.classList.toggle("all-complete", allChecked);
  }

  function buildToggleRow(studentId, field, label, checked, rowClass, card) {
    const row = document.createElement("div");
    row.className = `toggle-row ${rowClass}`;

    const span = document.createElement("span");
    span.textContent = label;

    const switchLabel = document.createElement("label");
    switchLabel.className = "switch";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!checked;
    const slider = document.createElement("span");
    slider.className = "slider";
    switchLabel.appendChild(input);
    switchLabel.appendChild(slider);

    input.addEventListener("change", async () => {
      try {
        await api("/api/update", {
          method: "POST",
          body: JSON.stringify({
            student_id: studentId,
            field,
            value: input.checked,
          }),
        });
      } catch (err) {
        input.checked = !input.checked; // revert on failure
        showToast("Couldn't save — try again.");
      } finally {
        syncCardHighlight(card);
      }
    });

    row.appendChild(span);
    row.appendChild(switchLabel);
    return row;
  }

  async function checkHasReports(studentId, btn) {
    try {
      const reports = await api(`/api/reports/${studentId}`);
      if (reports.length > 0) btn.classList.add("has-reports");
    } catch (_) { /* non-critical */ }
  }

  /* open the report popup */

  async function openReport(studentId, animalName, triggerBtn) {
    currentStudentId = studentId;
    drawerStudentName.textContent = animalName;
    reportText.value = "";
    drawer.hidden = false;
    drawerBackdrop.hidden = false;
    drawer.dataset.triggerRef = "";
    drawer._triggerBtn = triggerBtn;
    reportText.focus();
    await loadReports(studentId);
  }

  function closeReport() {
    drawer.hidden = true;
    drawerBackdrop.hidden = true;
    currentStudentId = null;
  }

  closeDrawerBtn.addEventListener("click", closeReport);
  drawerBackdrop.addEventListener("click", closeReport);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.hidden) closeReport();
  });

  async function loadReports(studentId) {
    const reports = await api(`/api/reports/${studentId}`);
    reportList.innerHTML = "";
    if (reports.length === 0) {
      const p = document.createElement("p");
      p.className = "muted empty-report";
      p.textContent = "Outstanding!";
      reportList.appendChild(p);
      return;
    }
    reports.forEach((n) => {
      const item = document.createElement("div");
      item.className = "report-item";
      const p = document.createElement("p");
      p.textContent = n.report_text;
      const time = document.createElement("time");
      time.textContent = n.created_at;
      item.appendChild(p);
      item.appendChild(time);
      reportList.appendChild(item);
    });
  }

  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = reportText.value.trim();
    if (!text || !currentStudentId) return;
    try {
      await api("/api/reports", {
        method: "POST",
        body: JSON.stringify({ student_id: currentStudentId, report_text: text }),
      });
      reportText.value = "";
      await loadReports(currentStudentId);
      if (drawer._triggerBtn) drawer._triggerBtn.classList.add("has-reports");
      showToast("Report saved.");
    } catch (err) {
      showToast("Couldn't save the report — try again.");
    }
  });

 /* daily autorefresh */
  setInterval(() => {
    if (!currentClass) return;
    const now = new Date(); // local date, same as the server's date
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (currentDashboardDate && todayIso !== currentDashboardDate) {
      refreshDashboard();
    }
  }, 60 * 1000);

  async function boot() {
    await loadExistingCohorts();
    const lastId = localStorage.getItem(LAST_CLASS_KEY);
    if (lastId) {
      try {
        const classes = await api("/api/classes");
        const match = classes.find((c) => String(c.id) === lastId);
        if (match) {
          await openClass(match);
        }
      } catch (_) { /* fall back to setup screen */ }
    }
  }

  boot();
})();
