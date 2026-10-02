let tasks = [];
let currentFilter = "all";

try {
  tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
} catch (error) {
  tasks = [];
}

function getElementById(elementId) {
  return document.getElementById(elementId);
}

function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {}
}

function addTask() {
  const taskText = getElementById("in").value.trim();

  if (!taskText) {
    return;
  }

  tasks.push({ id: Date.now(), text: taskText, done: false });
  getElementById("in").value = "";
  saveTasks();
  renderTasks();
}

function renderTasks() {
  const taskList = getElementById("list");
  const visibleTasks = tasks.filter(
    (task) => currentFilter === "all" || (currentFilter === "done") === task.done
  );

  taskList.innerHTML = "";

  if (!visibleTasks.length) {
    taskList.innerHTML = '<div class="empty">Nothing here ~</div>';
  }

  visibleTasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });

  updateCounter();
}

function createTaskElement(task) {
  const taskElement = document.createElement("li");

  if (task.done) {
    taskElement.className = "done";
  }

  const completionCheckbox = document.createElement("input");
  completionCheckbox.type = "checkbox";
  completionCheckbox.checked = task.done;
  completionCheckbox.onchange = handleTaskToggle.bind(null, task, completionCheckbox);

  const taskText = document.createElement("span");
  taskText.textContent = task.text;
  taskText.ondblclick = beginTaskEditing.bind(null, task, taskElement, taskText);

  const deleteButton = document.createElement("button");
  deleteButton.className = "del";
  deleteButton.textContent = "×";
  deleteButton.title = "Delete";
  deleteButton.onclick = deleteTask.bind(null, task);

  taskElement.append(completionCheckbox, taskText, deleteButton);

  return taskElement;
}

function handleTaskToggle(task, completionCheckbox) {
  task.done = completionCheckbox.checked;
  saveTasks();
  renderTasks();
}

function beginTaskEditing(task, taskElement, taskText) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit";
  editInput.value = task.text;

  taskElement.replaceChild(editInput, taskText);
  editInput.focus();
  editInput.onkeydown = handleEditKeydown.bind(null, task, editInput);
  editInput.onblur = finishTaskEditing.bind(null, task, editInput, true);
}

function handleEditKeydown(task, editInput, keyEvent) {
  if (keyEvent.key === "Enter") {
    finishTaskEditing(task, editInput, true);
  }

  if (keyEvent.key === "Escape") {
    finishTaskEditing(task, editInput, false);
  }
}

function finishTaskEditing(task, editInput, shouldSave) {
  if (shouldSave && editInput.value.trim()) {
    task.text = editInput.value.trim();
  }

  saveTasks();
  renderTasks();
}

function deleteTask(task) {
  tasks = tasks.filter((existingTask) => existingTask.id !== task.id);
  saveTasks();
  renderTasks();
}

function updateCounter() {
  const remainingTasks = tasks.filter((task) => !task.done).length;

  getElementById("count").textContent =
    remainingTasks + " task" + (remainingTasks === 1 ? "" : "s") + " left";
}

function handleAddKeydown(keyEvent) {
  if (keyEvent.key === "Enter") {
    addTask();
  }
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
}

function handleFilterClick(clickEvent) {
  const selectedFilter = clickEvent.target.dataset.f;

  if (!selectedFilter) {
    return;
  }

  currentFilter = selectedFilter;
  [...getElementById("filters").children].forEach((filterButton) => {
    filterButton.classList.toggle("on", filterButton.dataset.f === selectedFilter);
  });
  renderTasks();
}

getElementById("addBtn").onclick = addTask;
getElementById("in").onkeydown = handleAddKeydown;
getElementById("clear").onclick = clearCompletedTasks;
getElementById("filters").onclick = handleFilterClick;

renderTasks();
