const todoText = document.getElementById("todoText");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const clearBtn = document.getElementById("clearBtn");
let tasks = [];

function addTask() {
    const task = todoText.value.trim();
    if (task === "") return;

    const newTask = {
        id: Date.now(),
        text: task,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoText.value = "";
}

function renderTask(taskObj) {
    const li = document.createElement("li");
    li.dataset.id = String(taskObj.id);
    li.draggable = true;

    const handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.textContent = "⠿";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-check");
    checkbox.checked = taskObj.completed;

    const taskText = document.createElement("span");
    taskText.textContent = taskObj.text;
    taskText.classList.add("task-text");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");

    const actionWrapper = document.createElement("div");
    actionWrapper.classList.add("action-wrapper");
    actionWrapper.appendChild(editBtn);
    actionWrapper.appendChild(deleteBtn);

    if (taskObj.completed) {
        li.classList.add("completed");
    }

    checkbox.addEventListener("change", () => {
        taskObj.completed = checkbox.checked;
        li.classList.toggle("completed", taskObj.completed);
        saveTasks();
    });

    editBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = taskText.textContent;
        input.className = "edit-input";

        li.replaceChild(input, taskText);
        input.focus();

        function finishEditing() {
            const newText = input.value.trim();
            if (newText) {
                taskObj.text = newText;
                saveTasks();
            }
            taskText.textContent = taskObj.text;
            li.replaceChild(taskText, input);
        }

        input.addEventListener("blur", finishEditing);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") finishEditing();
        });
    });

    deleteBtn.addEventListener("click", () => {
        li.classList.add("fade-out");
        setTimeout(() => {
            tasks = tasks.filter(t => t !== taskObj);
            saveTasks();
            li.remove();
        }, 400);
    });

    li.addEventListener("dragstart", (e) => {
        li.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move"; 

        const crt = li.cloneNode(true);
        crt.style.width = getComputedStyle(li).width;
        crt.style.opacity = "0.8";
        crt.style.position = "absolute";
        crt.style.top = "-9999px";
        document.body.appendChild(crt);
        e.dataTransfer.setDragImage(crt, 20, 20);
        setTimeout(() => document.body.removeChild(crt), 0);
    });

    li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        persistOrderFromDOM(); 
    });

    li.appendChild(handle);
    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(actionWrapper);
    li.classList.add("fade-in");
    todoList.appendChild(li);
}

function clearCompleted() {
    const allTask = document.querySelectorAll("#todoList li");
    allTask.forEach((task) => {
        if (task.classList.contains("completed")) {
            task.classList.add("fade-out");
            setTimeout(() => {
                task.remove();
            }, 400);
        }
    });

    tasks = tasks.filter(task => !task.completed);
    saveTasks();
}

function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll("li:not(.dragging)")];
    return els.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

todoList.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const dragging = document.querySelector(".dragging");
    if (!dragging) return;
    [...todoList.children].forEach(li => li.classList.remove("reorder-shadow"));

    if (afterElement == null) {
        todoList.appendChild(dragging);
    } else {
        afterElement.classList.add("reorder-shadow");
        todoList.insertBefore(dragging, afterElement);
    }
});

todoList.addEventListener("drop", () => {
    persistOrderFromDOM();
});

todoList.addEventListener("dragleave", () => {
    [...todoList.children].forEach(li => li.classList.remove("reorder-shadow"));
});

function persistOrderFromDOM() {
    const order = [...todoList.children].map(li => Number(li.dataset.id));
    const pos = new Map(order.map((id, i) => [id, i]));
    tasks.sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
    saveTasks();
}

addBtn.addEventListener('click', addTask);
clearBtn.addEventListener('click', clearCompleted);

todoText.addEventListener('keydown', (event) => {
    if (event.key === "Enter") addTask();
});

window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("todoTasks");
    try {
        const savedTasks = saved ? JSON.parse(saved) : [];
        tasks = Array.isArray(savedTasks) ? savedTasks : [];
    } catch {
        tasks = [];
    }
    tasks.forEach(task => renderTask(task));
});
