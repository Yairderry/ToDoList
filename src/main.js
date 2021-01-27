"use strict";

// check if there's data in the local storage
let tasksString;

if (localStorage.getItem('tasks') === null) {
  tasksString = "[]"; 
} else {
  tasksString = localStorage.getItem('tasks');
}

let tasksJson = JSON.parse(tasksString);
let counts = tasksJson.length;

displayToDoList(tasksJson);


const addButton = document.querySelector('#add-button');
const sortButton = document.querySelector('#sort-button');

addButton.addEventListener('click', addToDoContainer);
sortButton.addEventListener('click', sortByPriority);

function displayToDoList(toDoList) {
  const counter = document.querySelector('#counter');
  counter.textContent = counts;
  for (let task of toDoList) {
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

  const counter = document.querySelector('#counter');
  counter.textContent = ++counts;
}

function sortByPriority() {
  const tasksJsonSorted = tasksJson.sort((a, b) => {
    return b.priority - a.priority;
  });

  const unsortedTasks = document.querySelectorAll('.todo-container');

  for (let unsortedTask of unsortedTasks) {
    unsortedTask.parentNode.removeChild(unsortedTask);
  }
  displayToDoList(tasksJsonSorted);
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
