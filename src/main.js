"use strict";
let tasks;
let tasksSorted;
let counts;
let addButton;
let sortButton;
let viewSection;
let prioritySorted = false;
let dateSorted = false;
let alphabeticallySorted = false;

function start() {
  getPersistent(DB_NAME);

  addButton = document.querySelector('#add-button');
  sortButton = document.querySelector('#sort-button');
  viewSection = document.querySelector('#view-section');

  // events for drag and drop action
  viewSection.addEventListener('dragover', draggingATask);
  window.addEventListener('resize', makeElementsUndraggable);
  viewSection.addEventListener('dragend', getNewOrder);
  
  // events for control-buttons
  addButton.addEventListener('click', addToDoContainer);
  document.addEventListener('click', searchText);
  document.addEventListener('click', undo);
  document.addEventListener('click', clearAll);
  
  // events for sorting tasks
  sortButton.addEventListener('click', sortByPriority);
  document.addEventListener('click', sortByAlphabeticalOrder);
  document.addEventListener('click', sortByDate);
  document.addEventListener('click', saveListOrder);
  
  // events for buttons inside todo-container
  document.addEventListener('click', startTransition);
  document.addEventListener('animationend', deleteTask);
  document.addEventListener('click', markTaskDone);
  document.addEventListener('click', editTask);
  document.addEventListener('click', saveEdits);
}
start();

// handlers

// drag and drop elements handlers
function getNewOrder(event) {
  const allTasks = viewSection.querySelectorAll('.todo-container');
  let newOrder = [];

  for (let task of allTasks) {
    newOrder.push(tasks[findElementIndexInTasks(task)]);
  }

  tasksSorted = newOrder;
}

function makeElementsUndraggable(event) {
  const allTasks = document.querySelectorAll('.todo-container');
  
  if (document.body.getBoundingClientRect().width <= 900) {
    for (let task of allTasks) {
      task.draggable = false;
    }  
  } else {
    for (let task of allTasks) {
      task.draggable = true;
    }  
  }  
}  

function draggingATask(event) {
  event.preventDefault();
  const toDoContainer = document.querySelector('.dragging');

  const afterElement = getDragAfterElement(viewSection, event.clientY);

  if (afterElement === undefined) {
    viewSection.appendChild(toDoContainer);
  } else {
    viewSection.insertBefore(toDoContainer, afterElement);
  }
}

// control buttons handlers
function addToDoContainer() {
  const input = document.querySelector('#text-input');
  const priority = document.getElementById('priority-selector');
  
  if (input.value === '') return;
  
  const task = createTaskObject(input, priority);
  createToDoContainer(task);
  
  input.value = '';
  input.focus();
  
  updateCounter(tasks);
  checkTasksDone();
}

function undo(event) {
  const target = event.target;
  
  if (target.id !== 'undo-button') return;

  tasks = JSON.parse(localStorage.getItem(DB_NAME));
  viewSection.innerHTML = '';

  displayToDoList(tasks);
  setPersistent(DB_NAME, tasks);
}

function clearAll(event) {
  const target = event.target;
  
  if (target.id !== 'clear-all-button') return;
  
  if (confirm('Are you sure you want to clear your ToDo list?')) {
    viewSection.innerHTML = '';
    
    localStorage.setItem(DB_NAME, JSON.stringify(tasks));
    tasks = [];
    updateCounter(tasks);
    setPersistent(DB_NAME, tasks);
    checkTasksDone();
  } else return;
}

function searchText(event) {
  const target = event.target;

  if (target.id !== 'search-button') return;
  
  const searchInput = document.querySelector('#search-input');
  highlight(searchInput.value.toLowerCase());
  
  searchInput.value = '';
  searchInput.focus();
}  

// sorting buttons handlers
function sortByPriority() {
  if (!prioritySorted) {
    tasksSorted = tasks.sort((a, b) => {
      return b.priority - a.priority;
    });
    prioritySorted = true;
  } else {
    tasksSorted = tasks.sort((a, b) => {
      return a.priority - b.priority;
    });
    prioritySorted = false;
  }
  
  viewSection.innerHTML = '';
  displayToDoList(tasksSorted);
}

function sortByDate(event) {
  if (event.target.id !== 'sort-by-date') return;
  
  if (!dateSorted) {
    tasksSorted = tasks.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    dateSorted = true;
  } else {
    tasksSorted = tasks.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    dateSorted = false;
  }

  viewSection.innerHTML = '';
  displayToDoList(tasksSorted);
}

function sortByAlphabeticalOrder(event) {
  if (event.target.id !== 'sort-by-text') return;
  
  if (!alphabeticallySorted) {
    tasksSorted = tasks.sort((a, b) => {
      return a.text.localeCompare(b.text);
    });
    alphabeticallySorted = true;
  } else {
    tasksSorted = tasks.sort((a, b) => {
      return b.text.localeCompare(a.text);
    });
    alphabeticallySorted = false;
  }
  
  viewSection.innerHTML = '';
  displayToDoList(tasksSorted);
}

function saveListOrder(event) {
  if (event.target.id !== 'save-order-button') return;
  if (tasksSorted === undefined) return;
  tasks = tasksSorted;
  setPersistent(DB_NAME, tasks);
}

// todo container's extra button's handlers
function startTransition(event) {
  const target = event.target;
  
  if (target.classList[0] !== 'delete-button') return;
  
  const toDoContainer = target.parentElement.parentElement;
  toDoContainer.style.animation = 'leave 0.5s';
}

function deleteTask(event) {
  const target = event.target;

  const containerIndex = findElementIndexInTasks(target);
  
  target.parentNode.removeChild(target);
  
  localStorage.setItem(DB_NAME, JSON.stringify(tasks));
  tasks.splice(containerIndex, 1);
  setPersistent(DB_NAME, tasks);
  
  updateCounter(tasks);
  checkTasksDone();
}

function markTaskDone(event) {
  const target = event.target;
  
  if (!(target.classList[0] === 'done-button' || target.classList[0] === 'undone-button')) {
    return;
  }
  localStorage.setItem(DB_NAME, JSON.stringify(tasks));
  
  const toDoContainer = target.parentElement.parentElement;
  const toDoText = toDoContainer.querySelector('.todo-text');
  const containerIndex = findElementIndexInTasks(toDoContainer);
  
  tasks[containerIndex].done = !tasks[containerIndex].done;
  setPersistent(DB_NAME, tasks);
  
  if (tasks[containerIndex].done) {
    target.className = 'undone-button task-button';
    toDoText.className = 'todo-text done';
  } else {
    target.className = 'done-button task-button';
    toDoText.className = 'todo-text';
  }
  
  checkTasksDone();
}

function editTask(event) {
  const target = event.target;
  
  if (target.classList[0] !== 'edit-button') return;
  
  const toDoContainer = target.parentElement.parentElement;
  
  createEditBoxes(toDoContainer);
}

function saveEdits(event) {
  const target = event.target;
  
  if (target.classList[0] !== 'save-button') return;
  localStorage.setItem(DB_NAME, JSON.stringify(tasks));
  
  const taskContainer = event.target.parentElement.parentElement;
  const editBoxes = taskContainer.querySelectorAll('.edit-box');
  const toDoPriority = editBoxes[0].parentElement;
  const toDoText = editBoxes[1].parentElement;
  
  toDoText.textContent = editBoxes[1].value.toLowerCase();
  toDoPriority.textContent = editBoxes[0].value;
  
  swapEditSaveButtons(taskContainer);

  // save changes in database
  const taskIndex = findElementIndexInTasks(taskContainer);
  tasks[taskIndex].priority = editBoxes[0].value;
  tasks[taskIndex].text = editBoxes[1].value;
  setPersistent(DB_NAME, tasks);
}

// element-creating functions
function createToDoContainer(task) {
  const toDoContainer = document.createElement('div');
  
  toDoContainer.className = 'todo-container';

  // make task draggable on on desktop
  if (document.body.getBoundingClientRect().width > 900) {
    toDoContainer.draggable = true;
  }

  toDoContainer.addEventListener('dragstart', () => {
    toDoContainer.classList.add('dragging');
  });

  toDoContainer.addEventListener('dragend', () => {
    toDoContainer.classList.remove('dragging');
  });
  
  toDoContainer.append(
    createToDoPriority(task['priority']),
    createToDoCreatedAt(task['date']),
    createToDoText(task['text'], task['done']),
    createExtraButtons(task['done']));
    viewSection.appendChild(toDoContainer);
}

function createToDoPriority(priority) {
  const toDoPriority = document.createElement('div');
  
  toDoPriority.className = 'todo-priority';
  toDoPriority.textContent = priority;
  return toDoPriority;
}

function createToDoText(input, done) {
  const toDoText = document.createElement('div');
  
  if (done) {
    toDoText.className = 'todo-text done';
  } else {
    toDoText.className = 'todo-text';
  }
  
  toDoText.textContent = input.toLowerCase();
  return toDoText;
}

function createToDoCreatedAt(date) {
  const toDoCreatedAt = document.createElement('div');
  
  toDoCreatedAt.className = 'todo-created-at';
  toDoCreatedAt.textContent = date;
  return toDoCreatedAt;
}

function createTaskObject(input, priority) {
  localStorage.setItem(DB_NAME, JSON.stringify(tasks));

  const task = {
    "text": input.value,
    "priority": priority.value,
    "date": dateToSqlFormat(),
    "done": false
  }
  
  tasks.push(task);
  setPersistent(DB_NAME, tasks);
  return task;
}
function createPriorityEditBox(toDoContainer) {
  const taskPriority = toDoContainer.querySelector('.todo-priority');
  const editBoxPriority = document.createElement('select');

  for (let i = 1; i <= 5; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    editBoxPriority.append(option);
  }

  editBoxPriority.value = taskPriority.textContent;
  editBoxPriority.className = 'edit-box';

  taskPriority.textContent = '';
  taskPriority.append(editBoxPriority);
}

function createTextEditBox(toDoContainer) {
  const taskText = toDoContainer.querySelector('.todo-text');
  const editBoxText = document.createElement('input');

  editBoxText.className = 'edit-box';
  editBoxText.value = taskText.textContent;
  
  taskText.textContent = '';
  taskText.append(editBoxText);
}

function createEditBoxes(toDoContainer) {
  createTextEditBox(toDoContainer);
  createPriorityEditBox(toDoContainer);
  
  swapEditSaveButtons(toDoContainer);
}

function createExtraButtons(done) {
  const deleteButton = document.createElement('button');
  const editButton = document.createElement('button');
  const doneButton = document.createElement('button');
  const buttonsContainer = document.createElement('div');
  
  buttonsContainer.className = 'extra-buttons';
  
  if(done) {
    doneButton.className = 'undone-button task-button';
  } else {
    doneButton.className = 'done-button task-button';
  }
  
  deleteButton.className = 'delete-button task-button';
  editButton.className = 'edit-button task-button';
  
  buttonsContainer.append(
    doneButton,
    deleteButton,
    editButton)
    return buttonsContainer;
}

function createLoader() {
  // check for existing loader
  const currentLoader = document.querySelector('.loader');

  if (currentLoader !== null) {
    return currentLoader;
  }

  // create loader 
  const viewSection = document.querySelector('#view-section');
  const firstTask = document.querySelector('.todo-container');
  const loader = document.createElement('div');
  loader.className = 'loader';

  if (firstTask === undefined || firstTask === null) {
    viewSection.appendChild(loader);
  } else {
    viewSection.insertBefore(loader, firstTask);
  }

  return loader;
}
  
// helper functions
function displayToDoList(toDoList) {
  
  for (let task of toDoList) {
    createToDoContainer(task);
  }
  
  updateCounter(toDoList);
  checkTasksDone();
}

function checkTasksDone() {
  const tasksDonePercent = document.querySelector('#tasks-done-percent');
  const percentInNumbers = document.querySelector('#tasks-done p');
  let tasksDone = 0;
  
  for (let task of tasks) {
    if (task.done) {
      tasksDone++;
    }
  }
  
  const percentDone = Math.floor(tasksDone / tasks.length * 100);

  tasksDonePercent.style.width = tasks.length === 0 ? '0%' : `${percentDone}%`;
  percentInNumbers.textContent = tasks.length === 0 ? '0%' : `${percentDone}%`;
}

function findElementIndexInTasks(taskContainer) {
  const taskDate = taskContainer.querySelector('.todo-created-at').textContent;
  const taskDone = taskContainer.querySelector('.undone-button') !== null ? true : false;
  
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].date === taskDate && tasks[i].done === taskDone) {
      return i;
    }
  }
}

function updateCounter(toDoList) {
  const counter = document.querySelector('#counter');
  counter.textContent = toDoList.length;
  
  if (viewSection.querySelectorAll('.todo-container').length === 0 ) {
    viewSection.classList.add('empty-list');
  } else {
    viewSection.classList.remove('empty-list');
  }
}

function getDragAfterElement(container, y) {
  // turn draggableElements into a list
  const draggableElements = [...container.querySelectorAll('.todo-container:not(.dragging)')];
  
  // find out the element the draggable is above
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function highlight(text) {
  const taskTexts = document.querySelectorAll('.todo-text');
  
  for (let taskText of taskTexts) {
    const taskInnerHTML = taskText.textContent;
    
    if (text === '') {
      taskText.innerHTML = taskText.textContent;
      continue;
    }
    
    // get all occurrences of a search text in the task
    let textIndexes = [];
    let index = taskInnerHTML.indexOf(text, 0);
    
    while (index >= 0) {
      textIndexes.push(index);
      index = taskInnerHTML.indexOf(text, index + text.length)
    }
    
    const numberOfOccurrences = textIndexes.length;
    
    if (numberOfOccurrences === 0) {
      taskText.innerHTML = taskText.textContent;
      continue;
    }
    
    let newInnerHTML = `${taskInnerHTML.substring(0,textIndexes[0])}`;
    
    for (let i = 0; i < numberOfOccurrences; i++) {
      // if (i + text.length > taskInnerHTML.length) break;
      newInnerHTML = newInnerHTML + `<span class='highlight'>${text}</span>${taskInnerHTML.substring(textIndexes[i] + text.length, textIndexes[i + 1])}`;
    }
    
    taskText.innerHTML = newInnerHTML;
  }
}

function swapEditSaveButtons(toDoContainer) {
  const extraButtonsContainer = toDoContainer.querySelector('.extra-buttons');
  const currentButton = extraButtonsContainer.querySelectorAll('.task-button')[2];
  let newButton = document.createElement('button');
  
  if (currentButton.classList[0] === 'save-button') {
    newButton.className = 'edit-button task-button';
  } else {
    newButton.className = 'save-button task-button';
  }
  
  extraButtonsContainer.removeChild(currentButton);
  extraButtonsContainer.append(newButton);
}

function dateToSqlFormat() {
  const date = new Date();

  const sec = date.getSeconds().toString();
  const s = sec.length === 2 ? sec : `0${sec}`;

  const min = date.getMinutes().toString();
  const m = min.length === 2 ? min : `0${min}`;

  const hour = date.getHours().toString();
  const h = hour.length === 2 ? hour : `0${hour}`;

  const month = (date.getMonth() + 1).toString();
  const M = month.length === 2 ? month : `0${month}`;

  const day = date.getDate().toString();
  const d = day.length === 2 ? day : `0${day}`;

  return `${date.getFullYear()}-${M}-${d} ${h}:${m}:${s}`
}