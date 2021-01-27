"use strict";

// check if there's data in the local storage
let tasksString;

if (localStorage.getItem('tasks') === null) {
  tasksString = "[]"; 
} else {
  tasksString = localStorage.getItem('tasks');
}

let tasksJson = JSON.parse(tasksString);
displayToDoList(tasksString);

const addButton = document.querySelector('#add-button');

addButton.addEventListener('click', addToDoContainer);

function displayToDoList(toDoList) {
  for (let task of JSON.parse(toDoList)) {
    createToDoContainer(task);
  }
}

function addToDoContainer() {
  const input = document.querySelector('#text-input');
  const priority = document.getElementById('priority-selector');

  const task = createTaskObject(input, priority);
  createToDoContainer(task);
  
  input.value = '';
  input.focus();
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
    createToDoText(task['text']));
  viewSection.appendChild(toDoContainer);
}

function createTaskObject(input, priority) {
  const task = {
    "text": input.value,
    "priority": priority.value,
    "date": new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
  tasksJson.push(task);
  localStorage.clear();
  localStorage.setItem("tasks", JSON.stringify(tasksJson));
  return task;
}
