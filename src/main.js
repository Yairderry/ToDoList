"use strict";

const addBtn = document.querySelector('#add-button');
addBtn.addEventListener('click', addToDoContainer);

function addToDoContainer(event) {
  const toDoContainer = document.createElement('div');
  const input = document.querySelector('#text-input');
  const viewSection = document.querySelector('#view');

  toDoContainer.className = 'todo-container';

  toDoContainer.append(createToDoPriority(), createToDoCreatedAt(), createToDoText(input));
  viewSection.append(toDoContainer);
  
  input.value = '';
  input.focus();
}

function createToDoPriority() {
  const priority = document.getElementById('priority-selector');
  const toDoPriority = document.createElement('div');

  toDoPriority.className = 'todo-priority';
  toDoPriority.textContent = priority.value;
  return toDoPriority;
}

function createToDoText(input) {
  const toDoText = document.createElement('div');

  toDoText.className = 'todo-text';
  toDoText.textContent = input.value;
  return toDoText;
}

function createToDoCreatedAt() {
  const toDoCreatedAt = document.createElement('div');

  toDoCreatedAt.textContent = new Date();
  return toDoCreatedAt;
}