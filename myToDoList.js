const todoText = document.getElementById("todoText");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const clearBtn = document.getElementById("clearBtn");
let tasks = [];

function addTask() {
    const task = todoText.value.trim();
    if (task === "") return;

    const newTask = {
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
    const checkbox = document.createElement("input");
    const taskText = document.createElement("span");
    const deleteBtn = document.createElement("button");

    
    checkbox.type = "checkbox";
    checkbox.classList.add("task-check");
    checkbox.checked = taskObj.completed; 

    
    taskText.textContent = taskObj.text;
    taskText.classList.add("task-text");

    
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn");

    
    if (taskObj.completed) {
        li.classList.add("completed");
    }

    
    checkbox.addEventListener("change", () => {
        taskObj.completed = checkbox.checked;
        if (taskObj.completed) {
            li.classList.add("completed");
        } else {
            li.classList.remove("completed");
        }
        saveTasks(); 
    });

    
    deleteBtn.addEventListener("click", () => {
        li.classList.add("fade-out");
        setTimeout(() => {
            tasks = tasks.filter(t => t !== taskObj); 
            saveTasks(); 
            li.remove(); 
        }, 400);
    });

    
    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(deleteBtn);
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


function saveTasks(){
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

addBtn.addEventListener('click',addTask);
clearBtn.addEventListener('click',clearCompleted);
todoText.addEventListener('keydown',(event) => {
    if (event.key === "Enter"){
        addTask()
    }
})
window.addEventListener("DOMContentLoaded", () => {
    const savedTasks = JSON.parse(localStorage.getItem("todoTasks"));
    if (savedTasks) {
        tasks = savedTasks;
        tasks.forEach(task => renderTask(task));
    }
});