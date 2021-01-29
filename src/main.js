"use strict";
let tasks;
let counts
let addButton;
let sortButton;
async function start() {
  tasks = await getPersistent(DB_NAME);
  if (tasks === null) {
    tasks = []; 
  }
  console.log(tasks);
  counts = tasks.length;
  
  addButton = document.querySelector('#add-button');
  sortButton = document.querySelector('#sort-button');
  
  addButton.addEventListener('click', addToDoContainer);
  sortButton.addEventListener('click', sortByPriority);
  document.addEventListener('click', deleteTask);
  document.addEventListener('click', markTaskDone);
  document.addEventListener('click', editTask);
  document.addEventListener('click', saveEdits);
  document.addEventListener("keyup", addWithEnter);
  displayToDoList(tasks);
}
start();

// handlers
function addWithEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const textInput = document.querySelector('#text-input').value;
    
    if (textInput !== '') {
      document.querySelector('#add-button').click();
    }
  }
}

function deleteTask(event) {
  const target = event.target;
  
  if (target.className !== 'delete-button') return;
  
  const toDoContainer = target.parentElement.parentElement;
  const containerIndex = findElementIndexInTasks(toDoContainer);
  
  toDoContainer.parentNode.removeChild(toDoContainer);
  
  tasks.splice(containerIndex, 1);
  setPersistent(DB_NAME, tasks);
  
  updateCounter(tasks);
  checkTasksDone();
}

function markTaskDone(event) {
  const target = event.target;
  
  if (target.classList[0] !== 'done-button') return;
  
  const toDoContainer = target.parentElement.parentElement;
  const containerIndex = findElementIndexInTasks(toDoContainer);
  
  tasks[containerIndex].done = !tasks[containerIndex].done;
  setPersistent(DB_NAME, tasks);
  
  if (tasks[containerIndex].done) {
    target.textContent = 'undone';
  } else {
    target.textContent = 'done';
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

  const taskContainer = event.target.parentElement.parentElement;
  const editBoxes = taskContainer.querySelectorAll('.edit-box');
  const toDoPriority = editBoxes[0].parentElement;
  const toDoText = editBoxes[1].parentElement;

  toDoText.textContent = editBoxes[1].value;
  toDoPriority.textContent = editBoxes[0].value;

  const editButton = document.createElement('button');
  editButton.textContent = 'edit';
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

  editBoxText.value = taskText.textContent;
  editBoxPriority.value = taskPriority.textContent;

  editBoxPriority.type = 'number';
  editBoxPriority.max = 5;
  editBoxPriority.min = 1;

  editBoxText.className = 'edit-box';
  editBoxPriority.className = 'edit-box';

  taskText.textContent = '';
  taskPriority.textContent = '';

  taskPriority.append(editBoxPriority);
  taskText.append(editBoxText);

  const saveButton = document.createElement('button');
  saveButton.textContent = 'save';
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
    
    setPersistent(DB_NAME, tasks);
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
      
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].date === taskDate) {
          return i;
        }
      }
    }
    
    function updateCounter(toDoList) {
      const counter = document.querySelector('#counter');
      counter.textContent = toDoList.length;
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