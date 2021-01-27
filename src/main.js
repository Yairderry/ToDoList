"use strict";

const addBtn = document.querySelector('#add-button');
addBtn.addEventListener('click', addToDo);

function addToDo(event) {
  const toDoContainer = document.createElement('div');
  const toDoPriority = document.createElement('div');
  const toDoCreatedAt = document.createElement('div');
  const toDoText = document.createElement('div');
  const viewSection = document.querySelector('#view');

  toDoContainer.className = 'todo-container';
  toDoPriority.className = 'todo-priority';
  toDoText.className = 'todo-text';

  toDoPriority.textContent = getPriority();
  toDoText.textContent = getTextInput();
  toDoCreatedAt.textContent = new Date();

  toDoContainer.append(toDoPriority, toDoCreatedAt, toDoText);
  viewSection.append(toDoContainer);
}

function getTextInput() {
  const textInput = document.querySelector('#text-input');
  return textInput.value;
}

function getPriority() {
  const priority = document.getElementById('priority-selector');
  return priority.value;
}