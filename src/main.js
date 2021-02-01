"use strict";
let tasks;
let tasksSorted;
let counts;
let addButton;
let sortButton;
let viewSection;

async function start() {
  tasks = await getPersistent(DB_NAME);

  if (tasks === null) {
    tasks = []; 
  }

  counts = tasks.length;
  
  addButton = document.querySelector('#add-button');
  sortButton = document.querySelector('#sort-button');
  viewSection = document.querySelector('#view-section');
  
  viewSection.addEventListener('dragover', draggingATask);
  viewSection.addEventListener('dragend', getNewOrder);
  addButton.addEventListener('click', addToDoContainer);
  sortButton.addEventListener('click', sortByPriority);
  document.addEventListener('animationend', deleteTask);
  document.addEventListener('click', startTransition);
  document.addEventListener('click', markTaskDone);
  document.addEventListener('click', editTask);
  document.addEventListener('click', saveEdits);
  document.addEventListener('click', searchText);
  document.addEventListener('click', undo);
  document.addEventListener('click', clearAll);
  document.addEventListener('click', sortByAlphabeticalOrder);
  document.addEventListener('click', sortByDate);
  document.addEventListener('click', saveListOrder);
  displayToDoList(tasks);
}
start();

// handlers
function clearAll(event) {
  const target = event.target;
  
  if (target.id !== 'clear-all-button') return;
  
  if (confirm('Are you sure you want to clear your ToDo list?')) {
    clearViewSection();
    localStorage.setItem(DB_NAME, JSON.stringify(tasks));
    tasks = [];
    updateCounter(tasks);
    setPersistent(DB_NAME, tasks);
  } else return;
}

function getNewOrder(event) {
  const allTasks = viewSection.querySelectorAll('.todo-container');
  let newOrder = [];

  for (let task of allTasks) {
    newOrder.push(tasks[findElementIndexInTasks(task)]);
  }

  tasksSorted = newOrder;
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

function startTransition(event) {
  const target = event.target;
  
  if (target.className !== 'delete-button') return;
  
  const toDoContainer = target.parentElement.parentElement;
  toDoContainer.style.animation = 'leave 0.5s';
}

function saveListOrder(event) {
  if (event.target.id !== 'save-order-button') return;
  if (tasksSorted === undefined) return;
  tasks = tasksSorted;
  setPersistent(DB_NAME, tasks);
}

function sortByDate(event) {
  if (event.target.id !== 'sort-by-date') return;
  
  tasksSorted = tasks.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  clearViewSection();
  displayToDoList(tasksSorted);
}

function sortByAlphabeticalOrder(event) {
  if (event.target.id !== 'sort-by-text') return;
  
  tasksSorted = tasks.sort((a, b) => {
    return a.text.localeCompare(b.text);
  });
  
  clearViewSection();
  displayToDoList(tasksSorted);
}

function undo(event) {
  const target = event.target;
  
  if (target.id !== 'undo-button') return;

  tasks = JSON.parse(localStorage.getItem(DB_NAME));
  clearViewSection();
  displayToDoList(tasks);
  setPersistent(DB_NAME, tasks);
}

function searchText(event) {
  const target = event.target;

  if (target.id !== 'search-button') return;
  
  const searchInput = document.querySelector('#search-input');
  highlight(searchInput.value.toLowerCase());
  
  searchInput.value = '';
  searchInput.focus();
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
      index = taskInnerHTML.indexOf(text, index + 1)
    }
    
    const numberOfOccurrences = textIndexes.length;
    
    if (numberOfOccurrences === 0) {
      taskText.innerHTML = taskText.textContent;
      continue;
    }
    
    let newInnerHTML = `${taskInnerHTML.substring(0,textIndexes[0])}`;
    
    for (let i = 0; i < numberOfOccurrences; i++) {
      
      newInnerHTML = newInnerHTML + `<span class='highlight'>${text}</span>${taskInnerHTML.substring(textIndexes[i] + text.length, textIndexes[i + 1])}`
    }
    
    taskText.innerHTML = newInnerHTML;
  }
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
  
  if (!(target.className === 'done-button' || target.className === 'undone-button')) {
    return;
  }
  localStorage.setItem(DB_NAME, JSON.stringify(tasks));
  
  const toDoContainer = target.parentElement.parentElement;
  const toDoText = toDoContainer.querySelector('.todo-text');
  const containerIndex = findElementIndexInTasks(toDoContainer);
  
  tasks[containerIndex].done = !tasks[containerIndex].done;
  setPersistent(DB_NAME, tasks);
  
  if (tasks[containerIndex].done) {
    target.className = 'undone-button';
    toDoText.className = 'todo-text done';
  } else {
    target.className = 'done-button';
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
  
  const editButton = document.createElement('button');
  editButton.className = 'edit-button';
  
  // remove save button and add edit button
  const saveButton = taskContainer.querySelector('.save-button');
  const extraButtonsContainer = saveButton.parentElement;
  extraButtonsContainer.append(editButton);
  extraButtonsContainer.removeChild(saveButton);
  
  // save changes in database
  const taskIndex = findElementIndexInTasks(taskContainer);
  tasks[taskIndex].priority = editBoxes[0].value;
  tasks[taskIndex].text = editBoxes[1].value;
  setPersistent(DB_NAME, tasks);
}

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

// element-creating functions
function createEditBoxes(toDoContainer) {
  const taskPriority = toDoContainer.querySelector('.todo-priority');
  const taskText = toDoContainer.querySelector('.todo-text');
  
  const editBoxText = document.createElement('input');
  const editBoxPriority = document.createElement('input');

  editBoxText.className = 'edit-box';
  editBoxPriority.className = 'edit-box';
  
  editBoxText.value = taskText.textContent;
  editBoxPriority.value = taskPriority.textContent;
  
  editBoxPriority.type = 'number';
  editBoxPriority.max = 5;
  editBoxPriority.min = 1;
  
  taskText.textContent = '';
  taskPriority.textContent = '';
  
  taskPriority.append(editBoxPriority);
  taskText.append(editBoxText);
  
  const saveButton = document.createElement('button');
  saveButton.className = 'save-button';
  
  // remove edit button and add save button
  const editButton = toDoContainer.querySelector('.edit-button');
  const extraButtonsContainer = editButton.parentElement;
  extraButtonsContainer.append(saveButton);
  extraButtonsContainer.removeChild(editButton);
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

function createToDoContainer(task) {
  const toDoContainer = document.createElement('div');
  
  toDoContainer.className = 'todo-container';
  toDoContainer.draggable = true;
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

  function createTaskObject(input, priority) {
    localStorage.setItem(DB_NAME, JSON.stringify(tasks));
    const task = {
      "text": input.value,
      "priority": priority.value,
    "date": new Date().toISOString().slice(0, 19).replace('T', ' '),
    "done": false
  }
  tasks.push(task);
  setPersistent(DB_NAME, tasks);
  return task;
}

function createExtraButtons(done) {
  const deleteButton = document.createElement('button');
  const editButton = document.createElement('button');
  const doneButton = document.createElement('button');
  const buttonsContainer = document.createElement('div');
  
  buttonsContainer.className = 'extra-buttons';
  
  if(done) {
    doneButton.className = 'undone-button';
  } else {
    doneButton.className = 'done-button';
  }
  
  deleteButton.className = 'delete-button';
  editButton.className = 'edit-button';
  
  buttonsContainer.append(
    doneButton,
    deleteButton,
    editButton)
    return buttonsContainer;
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
  let tasksDone = 0;
  
  for (let task of tasks) {
    if (task.done) {
      tasksDone++;
    }
  }
  
  const percentDone = Math.floor(tasksDone / tasks.length * 100);
  tasksDonePercent.style.width = percentDone + '%';
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
}

function sortByPriority() {
  tasksSorted = tasks.sort((a, b) => {
    return b.priority - a.priority;
  });
  
  clearViewSection();
  displayToDoList(tasksSorted);
}

function clearViewSection() {
  const allTasks = document.querySelectorAll('.todo-container');
  
  for (let task of allTasks) {
    task.parentNode.removeChild(task);
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
