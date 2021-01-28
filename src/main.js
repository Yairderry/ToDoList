"use strict";

// check if there's data in the local storage
let tasks = localStorage.getItem('tasks');

if (tasks === null) {
  tasks = []; 
} else {
  tasks = JSON.parse(tasks);
}

let counts = tasks.length;

displayToDoList(tasks);


const addButton = document.querySelector('#add-button');
const sortButton = document.querySelector('#sort-button');

addButton.addEventListener('click', addToDoContainer);
sortButton.addEventListener('click', sortByPriority);
document.addEventListener('click', deleteTask);
document.addEventListener('click', markTaskDone);

function deleteTask(event) {
  const target = event.target;
  
  if (target.className !== 'delete-button') return;

  const toDoContainer = target.parentElement.parentElement;
  const taskDate = toDoContainer.querySelector('.todo-created-at').textContent;

  toDoContainer.parentNode.removeChild(toDoContainer);

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].date === taskDate) {
      tasks.splice(i, 1)
      localStorage.clear();
      localStorage.setItem("tasks", JSON.stringify(tasks));

      const counter = document.querySelector('#counter');
      counter.textContent = tasks.length;

      checkTasksDone();
    }
  }
}

function markTaskDone(event) {
  const target = event.target;

  if (target.classList[0] !== 'done-button') return;
  
  const toDoContainer = target.parentElement.parentElement;
  const taskDate = toDoContainer.querySelector('.todo-created-at').textContent;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].date === taskDate) {
      tasks[i].done = !tasks[i].done;
      localStorage.clear();
      localStorage.setItem("tasks", JSON.stringify(tasks));

      if (tasks[i].done) {
        target.textContent = 'undone';
      } else {
        target.textContent = 'done';
      }
    }
  }  

  checkTasksDone();
}

function displayToDoList(toDoList) {
  const counter = document.querySelector('#counter');

  counter.textContent = toDoList.length;

  for (let task of toDoList) {
    createToDoContainer(task);
  }

  checkTasksDone();
}

function addToDoContainer() {
  const input = document.querySelector('#text-input');
  const priority = document.getElementById('priority-selector');

  const task = createTaskObject(input, priority);
  createToDoContainer(task);
  
  input.value = '';
  input.focus();

  const counter = document.querySelector('#counter');
  counter.textContent = tasks.length;
  
  checkTasksDone();
}

function sortByPriority() {
  const tasksSorted = tasks.sort((a, b) => {
    return b.priority - a.priority;
  });

  const unsortedTasks = document.querySelectorAll('.todo-container');

  for (let unsortedTask of unsortedTasks) {
    unsortedTask.parentNode.removeChild(unsortedTask);
  }
  displayToDoList(tasksSorted);
}

function createToDoPriority(priority) {
  const toDoPriority = document.createElement('div');

  toDoPriority.className = 'todo-priority';
  toDoPriority.textContent = priority;
  return toDoPriority;
}

function createToDoText(input) {
  const toDoText = document.createElement('div');

  toDoText.className = 'todo-text';
  toDoText.textContent = input;
  return toDoText;
}

function createToDoCreatedAt(date) {
  const toDoCreatedAt = document.createElement('div');

  toDoCreatedAt.className = 'todo-created-at';
  toDoCreatedAt.textContent = date;
  return toDoCreatedAt;
}

function createToDoContainer(task) {
  const toDoContainer = document.createElement('div');
  const viewSection = document.querySelector('#view-section');

  toDoContainer.className = 'todo-container';

  toDoContainer.append(
    createToDoPriority(task['priority']),
    createToDoCreatedAt(task['date']),
    createToDoText(task['text']),
    createExtraButtons(task['done']));
  viewSection.appendChild(toDoContainer);
}

function createTaskObject(input, priority) {
  const task = {
    "text": input.value,
    "priority": priority.value,
    "date": new Date().toISOString().slice(0, 19).replace('T', ' '),
    "done": false
  }
  tasks.push(task);

  localStorage.clear();
  localStorage.setItem("tasks", JSON.stringify(tasks));
  return task;
}

function createExtraButtons(done) {
  const deleteButton = document.createElement('button');
  const editButton = document.createElement('button');
  const doneButton = document.createElement('button');
  const buttonsContainer = document.createElement('div');

  deleteButton.textContent = 'delete';
  editButton.textContent = 'edit';
  if(done) {
    doneButton.textContent = 'undone';
  } else {
    doneButton.textContent = 'done';
  }

  deleteButton.className = 'delete-button';
  editButton.className = 'edit-button';
  doneButton.className = 'done-button';

  buttonsContainer.append(
    deleteButton,
    editButton,
    doneButton)
  return buttonsContainer;
}

function checkTasksDone() {
  const tasksDonePercent = document.querySelector('#tasks-done-percent');
  let tasksDone = 0;

  for (let task of tasks) {
    if (task.done) {
      tasksDone++;
    }
  }

  const percentDone = Math.floor(tasksDone / tasks.length * 100);
  tasksDonePercent.style.width = percentDone + '%';
}
