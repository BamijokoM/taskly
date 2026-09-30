// =========================================
// TASKLY — script.js (Part 1)
// Beginner-friendly vanilla JavaScript.
// No backend, no database, no API.
// We save tasks with localStorage.
// =========================================

// 1. Get elements from the HTML page
var taskForm = document.getElementById("task-form");
var taskInput = document.getElementById("task-input");
var prioritySelect = document.getElementById("priority-select");
var dateInput = document.getElementById("date-input");
var taskList = document.getElementById("task-list");
var emptyState = document.getElementById("empty-state");
var filterButtons = document.querySelectorAll(".filter-btn");
var progressText = document.getElementById("progress-text");
var progressFill = document.getElementById("progress-fill");
var progressPercent = document.getElementById("progress-percent");
var greetingText = document.getElementById("greeting-text");
var currentDateText = document.getElementById("current-date");
var themeBtn = document.getElementById("theme-btn");

// 2. Our data: a simple list of task objects.
// Each task = { id, name, priority, dueDate, completed }
var tasks = [];
var currentFilter = "all"; // all | active | completed

// 3. Load saved tasks from localStorage
function loadTasks() {
  var saved = localStorage.getItem("taskly-tasks");
  if (saved) {
    tasks = JSON.parse(saved);
  } else {
    tasks = [];
  }
}

// 4. Save tasks so they remain after refresh
function saveTasks() {
  localStorage.setItem("taskly-tasks", JSON.stringify(tasks));
}

// 5. Greeting + today's date
function showGreetingAndDate() {
  var now = new Date();
  var hour = now.getHours();
  if (hour < 12) {
    greetingText.textContent = "Good morning 👋";
  } else if (hour < 17) {
    greetingText.textContent = "Good afternoon 👋";
  } else {
    greetingText.textContent = "Good evening 👋";
  }
  var options = { weekday: "long", month: "long", day: "numeric" };
  currentDateText.textContent = now.toLocaleDateString("en-US", options);
}

// 6. Turn "2026-09-30" into friendly text like "Due today"
function friendlyDueDate(dueDate, completed) {
  if (completed) return "Completed";
  if (!dueDate) return "No due date";
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var due = new Date(dueDate + "T00:00:00");
  var diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "Overdue by 1 day";
  if (diffDays < 0) return "Overdue by " + Math.abs(diffDays) + " days";
  return "Due " + due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// 7. Progress: completed / total x 100
function updateProgress() {
  var total = tasks.length;
  var completed = tasks.filter(function (t) { return t.completed; }).length;
  if (total === 0) {
    progressText.textContent = "0 of 0 completed";
    progressFill.style.width = "0%";
    progressPercent.textContent = "0%";
    return;
  }
  var percent = Math.round((completed / total) * 100);
  progressText.textContent = completed + " of " + total + " completed";
  var blocks = Math.round(percent / 10);
  var bar = "█".repeat(blocks) + "░".repeat(10 - blocks);
  progressPercent.textContent = bar + " " + percent + "%";
  progressFill.style.width = percent + "%";
}

// 8. Show tasks on the page (with filter applied)
function renderTasks() {
  taskList.innerHTML = "";
  var filtered = tasks.filter(function (task) {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });
  if (filtered.length === 0) {
    emptyState.style.display = "block";
    emptyState.textContent = tasks.length === 0
      ? "No tasks yet. Add your first task above ✨"
      : "Nothing here for this filter.";
  } else {
    emptyState.style.display = "none";
  }
  filtered.forEach(function (task) {
    var li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task complete");
    checkbox.addEventListener("change", function () {
      toggleComplete(task.id);
    });
    var mainDiv = document.createElement("div");
    mainDiv.className = "task-main";
    var nameP = document.createElement("p");
    nameP.className = "task-name";
    nameP.textContent = task.name;
    var metaP = document.createElement("p");
    metaP.className = "task-meta";
    var dot = document.createElement("span");
    dot.className = "dot " + task.priority;
    var priorityLabel = document.createElement("span");
    priorityLabel.textContent = task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Medium";
    var dueLabel = document.createElement("span");
    dueLabel.textContent = "• " + friendlyDueDate(task.dueDate, task.completed);
    metaP.appendChild(dot);
    metaP.appendChild(priorityLabel);
    metaP.appendChild(dueLabel);
    mainDiv.appendChild(nameP);
    mainDiv.appendChild(metaP);
    var actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";
    var editBtn = document.createElement("button");
    editBtn.className = "btn-small edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () { editTask(task.id); });
    var deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-small delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () { deleteTask(task.id); });
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(checkbox);
    li.appendChild(mainDiv);
    li.appendChild(actionsDiv);
    taskList.appendChild(li);
  });
  updateProgress();
}

// 9. Add a new task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  var name = taskInput.value.trim();
  if (name === "") {
    alert("Please type a task name first.");
    return;
  }
  var newTask = {
    id: Date.now(),
    name: name,
    priority: prioritySelect.value,
    dueDate: dateInput.value,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = "";
  dateInput.value = "";
  taskInput.focus();
});

// 10. Complete / uncomplete a task
function toggleComplete(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) task.completed = !task.completed;
    return task;
  });
  saveTasks();
  renderTasks();
}

// 11. Delete a task
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter(function (task) { return task.id !== id; });
  saveTasks();
  renderTasks();
}

// 12. Edit a task
function editTask(id) {
  var task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;
  var newName = prompt("Edit task name:", task.name);
  if (newName === null) return;
  newName = newName.trim();
  if (newName === "") {
    alert("Task name cannot be empty.");
    return;
  }
  task.name = newName;
  var newPriority = prompt("Edit priority (high, medium, or low):", task.priority);
  if (newPriority !== null) {
    newPriority = newPriority.trim().toLowerCase();
    if (["high", "medium", "low"].indexOf(newPriority) !== -1) task.priority = newPriority;
  }
  var newDate = prompt("Edit due date (YYYY-MM-DD, or empty):", task.dueDate || "");
  if (newDate !== null) task.dueDate = newDate.trim();
  saveTasks();
  renderTasks();
}

// 13. Filters: All | Active | Completed
filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    filterButtons.forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTasks();
  });
});

// 14. Dark mode toggle, also saved
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  var isDark = document.body.classList.contains("dark");
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("taskly-theme", isDark ? "dark" : "light");
});

function loadTheme() {
  if (localStorage.getItem("taskly-theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
  }
}

// 15. Start the app
loadTasks();
loadTheme();
showGreetingAndDate();
renderTasks();

