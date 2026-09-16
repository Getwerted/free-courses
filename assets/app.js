(function () {
  "use strict";

  var state = { field: "all", level: "all", cert: "all" };
  var courses = [];

  var listEl = document.getElementById("courseList");
  var countEl = document.getElementById("resultCount");
  var emptyEl = document.getElementById("emptyState");
  var template = document.getElementById("courseCardTemplate");

  var LEVEL_LABEL = {
    introductory: "Introductory",
    intermediate: "Intermediate",
    advanced: "Advanced"
  };

  // Canonical priority order: also used to pick a course's primary (border/first-listed) field
  // when it belongs to more than one.
  var FIELD_ORDER = ["business", "healthcare", "finance"];

  var FIELD_LABEL = {
    business: "Business Administration",
    healthcare: "Healthcare",
    finance: "Finance"
  };

  function activeFields(fields) {
    return FIELD_ORDER.filter(function (f) {
      return fields.indexOf(f) !== -1;
    });
  }

  function fieldKey(fields) {
    return activeFields(fields).join("+");
  }

  function fieldLabel(fields) {
    return activeFields(fields)
      .map(function (f) { return FIELD_LABEL[f]; })
      .join(" & ");
  }

  function primaryField(fields) {
    return activeFields(fields)[0];
  }

  function fieldBadgeStyle(active) {
    if (active.length <= 1) {
      var f = active[0];
      return { background: "var(--color-" + f + "-bg)", color: "var(--color-" + f + ")" };
    }
    var n = active.length;
    var stops = active.map(function (f, i) {
      var start = (i / n) * 100;
      var end = ((i + 1) / n) * 100;
      return "var(--color-" + f + "-bg) " + start + "%, var(--color-" + f + "-bg) " + end + "%";
    }).join(", ");
    return { background: "linear-gradient(90deg, " + stops + ")", color: "var(--color-text)" };
  }

  function matchesFilters(course) {
    if (state.field !== "all" && course.fields.indexOf(state.field) === -1) return false;
    if (state.level !== "all" && course.level !== state.level) return false;
    if (state.cert !== "all" && course.certificate !== state.cert) return false;
    return true;
  }

  function render() {
    var filtered = courses.filter(matchesFilters);

    listEl.innerHTML = "";
    filtered.forEach(function (course) {
      listEl.appendChild(buildCard(course));
    });

    var n = filtered.length;
    countEl.textContent = n + (n === 1 ? " course" : " courses") + " shown";
    emptyEl.hidden = n !== 0;
  }

  function buildCard(course) {
    var node = template.content.cloneNode(true);
    var card = node.querySelector(".course-card");
    var active = activeFields(course.fields);
    var primary = primaryField(course.fields);

    card.dataset.primaryField = primary;
    card.style.borderLeftColor = "var(--color-" + primary + ")";

    var fieldBadge = node.querySelector(".badge-field");
    fieldBadge.textContent = fieldLabel(course.fields);
    fieldBadge.dataset.field = fieldKey(course.fields);
    var badgeStyle = fieldBadgeStyle(active);
    fieldBadge.style.background = badgeStyle.background;
    fieldBadge.style.color = badgeStyle.color;

    var levelBadge = node.querySelector(".badge-level");
    levelBadge.textContent = LEVEL_LABEL[course.level] || course.level;

    node.querySelector(".course-title").textContent = course.title;
    node.querySelector(".course-provider").textContent = course.provider;
    node.querySelector(".course-description").textContent = course.description;

    var metaBits = [];
    if (course.duration) metaBits.push(course.duration);
    if (course.verifiedOn) metaBits.push("Verified live " + course.verifiedOn);
    node.querySelector(".course-meta").textContent = metaBits.join(" · ");

    var certNote = node.querySelector(".cert-note");
    certNote.dataset.cert = course.certificate;
    certNote.textContent = course.certificateNote;

    var link = node.querySelector(".enroll-link");
    link.href = course.url;

    return node;
  }

  function setActiveChip(groupSelector, chip) {
    document.querySelectorAll(groupSelector).forEach(function (el) {
      el.classList.toggle("is-active", el === chip);
    });
  }

  function wireControls() {
    document.querySelectorAll(".chip-field").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.field = chip.dataset.field;
        setActiveChip(".chip-field", chip);
        render();
      });
    });
    document.querySelectorAll(".chip-level").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.level = chip.dataset.level;
        setActiveChip(".chip-level", chip);
        render();
      });
    });
    document.querySelectorAll(".chip-cert").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.cert = chip.dataset.cert;
        setActiveChip(".chip-cert", chip);
        render();
      });
    });
  }

  function loadCourses() {
    return fetch("data/courses.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      });
  }

  wireControls();
  loadCourses()
    .then(function (data) {
      courses = data;
      render();
    })
    .catch(function (err) {
      listEl.innerHTML = "";
      countEl.textContent = "";
      emptyEl.hidden = false;
      emptyEl.textContent =
        "Could not load course data (" + err.message + "). If you opened this file directly " +
        "in a browser, run a local server instead — see README.md.";
    });
})();
