const API_KEY = "$2b$10$xNclmgx/GVpbpMcRyHz5cOe1TnwSr9WeXB05.J21A1R1xWt/MXZBS";
const DB_NAME = "my-todo";
const URL = "https://api.jsonbin.io/v3/b/6012df127bfaff74c3995478";

// Gets data from persistent storage by the given key and returns it
function getPersistent(key) {
  const init = {
    method: "GET",
    headers: {
      "X-Master-Key": API_KEY
    }
  };
  const request = new Request(URL, init);
  const loader = createLoader();
  let dataPromise = fetch(request).then(res => {
    if (!res.ok) {
      throw new Error("Error: failed to get data from server");
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
      loader.textContent = error;
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
      "X-Master-Key": API_KEY,
      "Content-Type": "application/json",
      "X-Bin-Versioning": false
    },
    body: JSON.stringify(dataObj)
  };
  const loader = createLoader();
  const request = new Request(URL, init);
  fetch(request).then(res => {
    if (!res.ok) {
      throw new Error("Error: failed to send data to server");
    }

    viewSection.removeChild(loader);
  }).catch(error => {
    loader.classList.add('request-failed');
    loader.classList.remove('loader');
    loader.textContent = error;
})
}
