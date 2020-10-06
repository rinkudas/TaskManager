// Execute a task for 20 seconds
const executeTask = (name) => new Promise(resolve => {
  let elem = document.getElementById("task"+name);
  if(elem){
    let width = 1;
    let id = setInterval(frame, 200);
    document.getElementById("delete"+name).remove(); // Once task is started, remove delete option
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        resolve();
      } else {
        width++;
        elem.style.width = width + "%";
        let pT = document.getElementById("progressText"+name);
        pT.innerHTML = '00:'+`${(20-parseInt(width/5))+100}`.substring(1); // Show time remained
        pT.style.color = "#FFF";
      }
    }
  }
})

// Create a Taskmanager
function TaskManager(serverCount=1) {
  this.availableServer = Math.min(serverCount, 10);
  this.queue = [];
  this.active = 0;
  this.totalTask = 0;
}

// Next task if available
TaskManager.prototype.next = function() {
  if (this.queue.length){ 
    this.runTask(this.queue.shift());
  }
}


// Run a task
TaskManager.prototype.runTask = function(name) {
  this.active++;
  executeTask(name).then(() => { // After one task is completed, decrement active count and run next if available
    this.active--;
    this.next();
  })
}

// After adding a task, check and run task if server available
TaskManager.prototype.pushTask = function(name) {
  let outputDiv = document.getElementById("tasks");
  let outerDiv = document.createElement("div");
  outerDiv.className = "taskContainer";
  outerDiv.id = "taskContainer"+name;
  let div = document.createElement("div");
  div.className = "taskDiv";
  let progress = document.createElement("div");
  progress.id = "task"+name;
  progress.className = "task";
  let progressText = document.createElement("span");
  progressText.innerText = "waiting...";
  progressText.className = "progressText";
  progressText.id = "progressText"+name;
  progressText.style.color = "#7b68aa";
  progress.appendChild(progressText);
  div.appendChild(progress);
  outerDiv.appendChild(div);
  let remove = document.createElement("span");
  remove.id = "delete"+name;
  remove.className = "deleteBtn";
  remove.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
  remove.addEventListener("click", (e) => {
    taskManager.deleteTask(name);
  }, false);
  outerDiv.appendChild(remove);
  outputDiv.appendChild(outerDiv);
  
  if (this.active < this.availableServer){ // If server available, run the task else add to queue 
    this.runTask(name);
  }
  else {
    this.queue.push(name);
  }
}

// Add tasks
TaskManager.prototype.addTasks = function(){
  let taskCountEle = document.getElementById("taskCount");
  let taskCount = parseInt(taskCountEle.value);

  for(let i=1; i<= taskCount; i++){
    this.pushTask(++this.totalTask);
  }
}

// Delete a task
TaskManager.prototype.deleteTask = function(id){ 
  document.getElementById("taskContainer"+id).remove();
  this.queue = this.queue.filter(item => item !== id);
}


// Add a server 
TaskManager.prototype.addServer = function() {
  if(this.availableServer < 10){ // Maximum 10 server
    this.availableServer++;
    countEle.innerText = this.availableServer;
    if(this.availableServer == 10){ // If maximum is reached, disable add option
      addServerEle.setAttribute("disable", true);
      addServerEle.classList.add("disabled");
    }
    if(this.availableServer > 0){
      removeServerEle.setAttribute("disable", false);
      removeServerEle.classList.remove("disabled");
    }
    this.next(); // After adding a server, check and run queued task if available
  }
}

// Remove a server if it is idle
TaskManager.prototype.removeServer = function() {
  if(this.availableServer > 0){ //Check if any server is available
    if(this.active < this.availableServer){ //Check if any server is idle
      this.availableServer--; // decrement by 1
      countEle.innerText = this.availableServer; // Update available server count
      if(this.availableServer < 10){ // If deleting a server decrements the count below 10, add server btn enabled
        addServerEle.setAttribute("disable", false);
        addServerEle.classList.remove("disabled");
      }
      if(this.availableServer == 0){ // If deleting a server decrements the count to 0, further delete option disabled
        removeServerEle.setAttribute("disable", true);
        removeServerEle.classList.add("disabled");
      }
    }
  }
}

// Initialize with 1 server
var taskManager = new TaskManager(1);

let countEle = document.getElementById("serverCnt");
countEle.innerText = taskManager.availableServer;

let addServerEle = document.getElementById("addServer");
addServerEle.addEventListener("click", () => taskManager.addServer(), false);

let removeServerEle = document.getElementById("removeServer");
removeServerEle.addEventListener("click", () => taskManager.removeServer(), false);

let addTasksEle = document.getElementById("addTask");
addTasksEle.addEventListener("click", () => taskManager.addTasks(), false);



