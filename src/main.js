"use strict";


async function getData(url) {
  const response = await fetch(url + '/latest');
  const data = await response.json();
  console.log(data.record);
  return data.record;
}


async function setData(url, updatedList) {

  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedList)
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    console.log(response);
  }
  const data = await response.json();
  console.log(data);

}

async function start() {
  let tryTasks = await getData('https://api.jsonbin.io/v3/b/60127c6d88655a7f320e64b1');
  if (tryTasks === null) {
    tryTasks = []; 
  }

  displayToDoList(tryTasks);

  const addButton = document.querySelector('#add-button');
  const sortButton = document.querySelector('#sort-button');

  addButton.addEventListener('click', addToDoContainer);
  sortButton.addEventListener('click', sortByPriority);

}

start();

async function displayToDoList(toDoList) {
  const counter = document.querySelector('#counter');
  counter.textContent = toDoList.length;
  for (let task of toDoList) {
    await createToDoContainer(task);
  }
}

async function addToDoContainer() {
  const input = document.querySelector('#text-input');
  const priority = document.getElementById('priority-selector');
  let tryTasks = await getData('https://api.jsonbin.io/v3/b/60127c6d88655a7f320e64b1');

  const task = await createTaskObject(input, priority);
  await createToDoContainer(task);
  
  tryTasks.push(task);
  await setData('https://api.jsonbin.io/v3/b/60127c6d88655a7f320e64b1', tryTasks);
  input.value = '';
  input.focus();

  const counter = document.querySelector('#counter');
  counter.textContent = tryTasks.length;
}

async function sortByPriority() {
  let tryTasks = await getData('https://api.jsonbin.io/v3/b/60127c6d88655a7f320e64b1');
  const tasksSorted = tryTasks.sort((a, b) => {
    return b.priority - a.priority;
  });

  const unsortedTasks = document.querySelectorAll('.todo-container');

  for (let unsortedTask of unsortedTasks) {
    unsortedTask.parentNode.removeChild(unsortedTask);
  }
  displayToDoList(tasksSorted);
}

async function createToDoPriority(priority) {
  const toDoPriority = document.createElement('div');

  toDoPriority.className = 'todo-priority';
  toDoPriority.textContent = priority;
  return toDoPriority;
}

async function createToDoText(input) {
  const toDoText = document.createElement('div');

  toDoText.className = 'todo-text';
  toDoText.textContent = input;
  return toDoText;
}

async function createToDoCreatedAt(date) {
  const toDoCreatedAt = document.createElement('div');

  toDoCreatedAt.className = 'todo-created-at';
  toDoCreatedAt.textContent = date;
  return toDoCreatedAt;
}

async function createToDoContainer(task) {
  const toDoContainer = document.createElement('div');
  const viewSection = document.querySelector('#view-section');

  toDoContainer.className = 'todo-container';

  toDoContainer.append(
    await createToDoPriority(task['priority']),
    await createToDoCreatedAt(task['date']),
    await createToDoText(task['text']));
  viewSection.appendChild(toDoContainer);
}

async function createTaskObject(input, priority) {
  const task = {
    "text": input.value,
    "priority": priority.value,
    "date": new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  return task;
}
