const API_KEY = "$2b$10$xNclmgx/GVpbpMcRyHz5cOe1TnwSr9WeXB05.J21A1R1xWt/MXZBS";
const DB_NAME = "my-todo";
const URL = "http://localhost:3000/api/v3/b/1613581577675";

// Gets data from persistent storage by the given key and returns it
function getPersistent(key) {
  const init = {
    method: "GET"
  };
  const request = new Request(URL, init);
  const loader = createLoader();
  let dataPromise = fetch(request).then(res => {
    if (!res.ok) {
      return res.json().then(data => {
        throw new Error(data.message);
      })
    }

    viewSection.innerHTML = '';
    return res.json().then(data => {
      tasks = data.record[DB_NAME];
    
        if (tasks === null) {
          tasks = []; 
        }

        counts = tasks.length;
        displayToDoList(tasks);
    })
  }).catch(error => {
      loader.classList.add('request-failed');
      loader.classList.remove('loader');
      loader.textContent = "Error: failed to get data from server";
      console.log(error);
  })
  return dataPromise;
}

// Saves the given data into persistent storage by the given key.
function setPersistent(key, data) {
  const dataObj = {};
  dataObj[key] = data;
  const init = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataObj)
  };
  const loader = createLoader();
  const request = new Request(URL, init);
  fetch(request).then(res => {
    if (!res.ok) {
      return res.json().then(data => {
        throw new Error(data.message);
      })
    }

    viewSection.removeChild(loader);
  }).catch(error => {
    loader.classList.add('request-failed');
    loader.classList.remove('loader');
    console.log(error);
    loader.innerHTML = "Error: failed to send data to server.<br>Changes will not be saved.";
})
}
