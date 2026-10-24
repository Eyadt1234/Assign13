//User class (base class)
export class User {
    id;
    name;
    email;
    password;
    phone;
    _age;
    notebooks = [];
    constructor(id, name, email, password, phone, age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        //1: constructor, the age goes through the same check as the setter
        this._age = User.checkAge(age);
    }

    //_________________________________________________________________________________//
    
    //2: checkAge, must be a whole number between 18 and 60
    static checkAge(age) {
        if (!Number.isInteger(age) || age < 18 || age > 60) {
            throw new Error("the age must be between 18 and 60");
        }
        return age;
    }
    
    //_________________________________________________________________________________//
    
    //3: age getter and setter
    get age() {
        return this._age;
    }
    set age(value) {
        this._age = User.checkAge(value);
    }
    
    //_________________________________________________________________________________//
    
    //4: displayInfo, the password is hidden
    displayInfo() {
        console.log(`USER INFO :
  ID       : ${this.id}
  NAME     : ${this.name}
  EMAIL    : ${this.email}
  PASSWORD : ${"*".repeat(this.password.length)}
  PHONE    : ${this.phone}
  AGE      : ${this._age}`);
    }
    //_________________________________________________________________________________//
    //5: addNotebook (aggregation)
    addNotebook(notebook) {
        if (this.notebooks.includes(notebook)) {
            throw new Error(`notebook "${notebook.title}" is already added`);
        }
        this.notebooks.push(notebook);
    }

    //_________________________________________________________________________________//
   
    //6: getNotebooks, returns a copy
    getNotebooks() {
        return [...this.notebooks];
    }
}

//_________________________________________________________________________________//

//Admin class (inheritance)
export class Admin extends User {
    constructor(id, name, email, password, phone, age) {
        super(id, name, email, password, phone, age);
    }

    //_________________________________________________________________________________//
    
    //1: manageNotes, shows all notes of a notebook
    manageNotes(notebook) {
        console.log(`Admin ${this.name} is managing "${notebook.title}" (${notebook.getNotesCount()} notes)`);
        notebook.getAllNotes().forEach((note) => {
            console.log(`  - [${note.id}] ${note.title} (by ${note.author.name})`);
        });
    }

    //_________________________________________________________________________________//
    
    //2: deleteNote, admin removes any note
    deleteNote(notebook, noteId) {
        return notebook.removeNote(noteId);
    }
}

//_________________________________________________________________________________//

//Note class (association with User)
export class Note {
    id;
    title;
    content;
    author;
    constructor(id, title, content, author) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;
    }

    //_________________________________________________________________________________//
    
    //1: userId, the id of the author
    get userId() {
        return this.author.id;
    }

    //_________________________________________________________________________________//
    
    //2: preview, short version of the content
    preview(length = 50) {
        if (this.content.length <= length) {
            return this.content;
        }
        return this.content.substring(0, length) + "...";
    }
}

//_________________________________________________________________________________//

//NoteBook class (composition with Note)
export class NoteBook {
    id;
    title;
    notes = []; //composition: the notebook owns its notes
    nextNoteId = 1;
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    //_________________________________________________________________________________//

    //1: addNote, the notebook creates the note itself so it can't live outside it
    addNote(title, content, author) {
        const note = new Note(this.nextNoteId, title, content, author);
        this.nextNoteId++;
        this.notes.push(note);
        return note;
    }

    //_________________________________________________________________________________//

    //2: removeNote (true = removed, false = not found)
    removeNote(noteId) {
        const index = this.notes.findIndex((note) => note.id === noteId);
        if (index === -1) {
            return false;
        }
        this.notes.splice(index, 1);
        return true;
    }
   
    //_________________________________________________________________________________//
   
    //3: getAllNotes, returns a copy
    getAllNotes() {
        return [...this.notes];
    }

    //_________________________________________________________________________________//
    
    //4: getNotesCount
    getNotesCount() {
        return this.notes.length;
    }
}

//_________________________________________________________________________________//

//Storage class (generic, works with any type)
export class Storage {
    items = [];
    //1: addItem
    addItem(item) {
        this.items.push(item);
    }

    //_________________________________________________________________________________//
    
    //2: removeItem (true = removed, false = not found)
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index === -1) {
            return false;
        }
        this.items.splice(index, 1);
        return true;
    }

    //_________________________________________________________________________________//
    
    //3: getAllItems, returns a copy
    getAllItems() {
        return [...this.items];
    }
}