function getCurrentDate() {
 let monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
 let cDay = new Date;
 let day = String(cDay.getDate()).padStart(2, '0');
 let month = monthArr[cDay.getMonth()];
 let year = cDay.getFullYear();
 return day+' '+month+' '+year;
}

Vue.directive('focus', {
 componentUpdated: function(input) {
  input.focus()
 }
})

Vue.component('folder', {
 props: ['folder'],
 data: function () {
  return {
   notepad: this.folder,
   newItem:'',
   editedItem:'',
   chosenPriority: '',
   sortVariations: [
    {mode: 'By name', value: 'name'},
    {mode: 'By date', value: 'date'},
    {mode: 'By priority', value: 'priority'}
   ],
   sortedMode: ''

  }
 },
 template: `
  <div class="modal-mask">
       <div class="modal-wrapper">
         <div class="modal-container col-6" style="width: fit-content" v-bind:style=[{backgroundColor:this.folder.color}]>

           <div class="modal-header">
            <div class="d-flex flex-column blockHead">
              <div class="d-flex flex-row firstLine">
               <div class="col-7 pr-0"><h2 class="text-right">{{ folder.name }}</h2></div>
               <div class="col-5 text-right"><button class="btn btn-sm btn-danger" @click="$emit('close')"> X </button></div>
              </div>
                <dir class="mx-auto">
                 <div class="input-group">
        <select class="custom-select" v-model="sortedMode">
          <option v-for="modes in sortVariations" v-bind:value="modes.value">
          {{ modes.mode }}
        </option>
        </select>
        <div class="input-group-append">
          <button class="btn btn-secondary" v-on:click="sortTasks">Sort</button>
        </div>
      </div>                 
                </dir>
             </div>   
           </div>

           <div class="overflow-auto modal-body">
             <div class="text-center">
                <div v-for= "(note, index) in folder.notes" v-bind:key="note.noteId">
                 <input type="checkbox" v-on:click="done(index)">
                 <span v-html="note.icon"></span>
                 <input class="my-2 mx-0" v-focus v-bind:disabled="note.disabled" v-model="note.task" 
                 v-bind:class="[note.taskDone ? 'done' : '']">
                 <button class="btn btn-sm btn-light" v-on:click="editTask(index)"> &#10000; </button>
                 <button class="btn btn-sm btn-secondary" v-if="!note.disabled" v-on:click="cancelEditTask(index)"> c </button>
                 <button class="btn btn-sm btn-danger" v-on:click="removeTask(index)"> x </button>
                </div>               
             </div>
           </div>

           <div class="modal-footer">
             <div class="d-flex flex-column">
              <h5 class="text-center">Add new task:</h5>
              <div>
               <input class="form-control" v-model="newItem" placeholder="Enter your task here..."></input>
              </div>

              <div class="mt-2">
               <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" id="high" value="3" v-model="chosenPriority">
        <label class="form-check-label" for="high"><span>&#11088;</span> High</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" id="medium" value="2" v-model="chosenPriority">
        <label class="form-check-label" for="medium"><span>&#127800;</span> Medium</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" id="low" value="1" v-model="chosenPriority">
        <label class="form-check-label" for="low"><span>&#127810;</span> Low</label>
      </div>
              </div>

              <div class="mt-2 text-center">
               <button class="btn btn-secondary" v-on:click="addItem">Add</button>
              </div>     
               
             </div>
           </div>
         </div>
       </div>
     </div>`,

 methods: {
  defineIcon: function(prior) {
   switch(prior) {
    case '3':
     return '&#11088;';
     break;
    case '2':
     return '&#127800;';
     break;
    case '1':
     return '&#127810;';
     break;
    default:
     return console.log('Smth going wrong...');
   }
  },

  addItem: function() {
   console.log(this.chosenPriority)
   if (this.newItem != '' && this.chosenPriority != '') {
    this.notepad.notes.push( {noteId: this.folder.notes.length + 1, task: this.newItem,
      taskDone: false, disabled: true, taskDate: getCurrentDate(), priority: this.chosenPriority, 
      icon: this.defineIcon(this.chosenPriority) });
    this.newItem ='';
    this.chosenPriority = '';
    this.$root.saveFolder();
   } else {
    return;
   }
   
   
   // console.log(this.notepad.notes);
  },
  done: function(index) {
   if (this.notepad.notes[index].taskDone == true) {
    this.notepad.notes[index].taskDone = false;
   } else {
    this.notepad.notes[index].taskDone = true;
   }
   this.$root.saveFolder();   
  },
  removeTask: function(index) {
   this.notepad.notes.splice(index, 1);
   this.$root.saveFolder();
  },
  editTask: function(index) {
   this.editedItem = this.notepad.notes[index].task;
   if (this.editedItem != '') {    
    if (this.notepad.notes[index].disabled == true) {
     this.notepad.notes[index].disabled = false;
     // this.notepad.notes[index].task = this.notepad.notes[index].task;
    } else {
     this.notepad.notes[index].disabled = true;
    }
    this.$root.saveFolder();
   } else {
    return;
   }
  },
  cancelEditTask: function(index) {
   this.notepad.notes[index].task = this.editedItem;
   this.notepad.notes[index].disabled = true;
  },

  sortedByName: function(a, b) {
   if (a.task.toLowerCase() > b.task.toLowerCase()) {
    return 1;
   } else {
    return -1;
   }
   return 0;
  },

  sortedByDate: function(a, b) {
   if(new Date(a.taskDate) > new Date(b.taskDate)) {
    return -1;
   } else {
    return 1;
   }
  },

  sortedByPriority: function(a, b) {
   if(a.priority < b.priority) {
    return 1;
   } else {
    return -1;
   }
  },

  sortTasks: function() {
   console.log(this.sortedMode)
   switch(this.sortedMode) {
    case 'name':
     return this.notepad.notes.sort(this.sortedByName);
     break;
    case 'date':
     this.notepad.notes.sort(this.sortedByDate);
     break;
    case 'priority':
     this.notepad.notes.sort(this.sortedByPriority);
     break;
    default:
     console.log('smth wrong');
   }
   this.$root.saveFolder();
  }
 },
 
})


let todoList = new Vue({
 el: '#todoList',
 data: {
  showModal: false,
  createf: false,
  editedfolder: false,
  newFolderName: 'No name',
  colorList: [
   {id:0, code: '#d6b6b6', active: false},
   {id:1, code: '#d4b4e2', active: false},
   {id:2, code: '#b6c4e3', active: false},
   {id:3, code: '#b8e2bd', active: false},
   {id:4, code: '#dedede', active: false},
   {id:5, code: '#dbb7a0', active: false},
  ],
  chosenColor: '',
  currentFolder: '',
  oldName: '',
  request: [],
  searchKey:'',
  wasSearched: false,
  searchfolder:'',
  folderlsList: true,
  divResult: false,
  searchResult: [],
  folders: [
   {id:0, name:'work', dataCreated: '30 January 2020', color: '#d6b6b6', notes: [
    {noteId: 0, task: 'Laravael', taskDone: false, disabled: true, taskDate:  '07 November 2019',
     priority: '3', icon: '&#11088;'},
    {noteId: 1, task: 'Yii2', taskDone: false, disabled: true, taskDate:  '03 January 2020', 
     priority: '2', icon: '&#127800;'},
    {noteId: 2, task: 'Vue', taskDone: false, disabled: true, taskDate:  '03 December 2019',
     priority: '1', icon: '&#127810;' },
   ]},
   {id:1, name:'home', dataCreated: '30 January 2020', color: '#b6c4e3', notes: [
    {noteId: 0, task: 'eSchool', taskDone: false, disabled: true, taskDate:  '07 November 2019',
     priority: '1', icon: '&#127810;'},
   ]},
   {id:2, name:'study', dataCreated: '30 January 2020', color: '#b8e2bd', notes: []},
  ]

 },

 mounted() {
  if (localStorage.getItem('folders')) {
   try {
    this.folders = JSON.parse(localStorage.getItem('folders'));
   } catch(e) {
          localStorage.removeItem('folders');
        }
  }
 },

 methods: {
  openFolder: function(index) {
   this.currentFolder = this.folders[index];
   this.showModal = true;   
  },

  createFolderModalOpen: function() {
   this.createf = true;
  },

  chooseColor: function(index) {
   this.chosenColor = this.colorList[index].code;
   for(i=0; i<this.colorList.length; ++i){
    if (this.chosenColor == this.colorList[i].code) {
     this.colorList[i].active = true;
    } else {
     this.colorList[i].active = false;
    }
   }
   // console.log(this.chosenColor)
  },

  createFolder: function() {
   if (this.newFolderName != ''){
    this.folders.push({id: this.folders.length, name: this.newFolderName, dataCreated: getCurrentDate(),
     color:this.chosenColor, notes: []});
    this.chosenColor = '';
    this.newFolderName = 'No name';
    alert('folder created!');
    this.createf = false;
    this.saveFolder();
   } else {
    return;
   }
   
  },

  openEditFolderModal: function(index) {
   this.editedfolder = true;
   this.currentFolder = this.folders[index];
   this.oldName = this.folders[index].name;
  },

  saveChanges: function() {
   console.log(this.currentFolder.id)
   this.currentFolder = this.folders[this.currentFolder.id];
   if (this.currentFolder.name !== '') {    
    
    if (this.chosenColor !== '') {
     this.folders[this.currentFolder.id].color = this.chosenColor;
    }
    this.editedfolder = false;
    this.currentFolder = '';
    this.saveFolder();
   } else {
    return;
   }
   
  },

  cancelChanges: function() {
   // console.log(thi)
   this.folders[this.currentFolder.id].name = this.oldName;
   this.editedfolder = false;
   this.oldName = '';
   this.currentFolder = '';
  },

  deleteFolder: function(index) {
   if (confirm('Do you really want to delete folder '+this.folders[index].name+'?')) {
    this.folders.splice(index, 1);
    this.saveFolder();
   } else {
    console.log('nothing');
   }
  },

  cancelCreate: function() {
   this.createf = false;
   this.chosenColor = '';
   for(i=0; i<this.colorList.length; ++i){
    this.colorList[i].active = false;
   }
   this.newFolderName = 'No name';

  },

  checkSearch: function() {
   if(this.wasSearched == false) {
    this.searchNotes();
   } else {
    this.searchResult = [];
    this.searchNotes();
   }
  },

  searchNotes: function() {
   if (this.searchKey != '') {
    this.wasSearched = true;
    this.folderlsList = false;
    this.divResult = true;
    for ( i=0; i<this.folders.length; ++i) {
     this.searchfolder = this.folders[i];
     this.request = this.searchfolder.notes.filter(task => {
     return task.task.toLowerCase().includes(this.searchKey.toLowerCase())
    });
     console.log(this.request);
     if (this.request.length !==0) {
      this.searchResult.push({note: this.request, parentFolder:this.searchfolder.name 
    });
     }
     
    }
   }
  },

  onMainScreen: function() {
   this.searchResult = [];
   this.searchKey = '';
   this.wasSearched = false;
   this.divResult = false;
   this.folderlsList = true;
   
  },

  saveFolder: function() {
   let parsed = JSON.stringify(this.folders);
   localStorage.setItem('folders', parsed);
  }

 }

}) 
