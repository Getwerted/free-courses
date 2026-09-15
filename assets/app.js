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

  var FIELD_LABEL = {
    business: "Business Administration",
    healthcare: "Healthcare",
    "business+healthcare": "Business & Healthcare"
  };

  function fieldKey(fields) {
    var hasBusiness = fields.indexOf("business") !== -1;
    var hasHealthcare = fields.indexOf("healthcare") !== -1;
    if (hasBusiness && hasHealthcare) return "business+healthcare";
    if (hasHealthcare) return "healthcare";
    return "business";
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
    var fk = fieldKey(course.fields);

    card.dataset.primaryField = course.fields.indexOf("healthcare") !== -1 && course.fields.indexOf("business") === -1
      ? "healthcare"
      : "business";

    var fieldBadge = node.querySelector(".badge-field");
    fieldBadge.textContent = FIELD_LABEL[fk];
    fieldBadge.dataset.field = fk;

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
