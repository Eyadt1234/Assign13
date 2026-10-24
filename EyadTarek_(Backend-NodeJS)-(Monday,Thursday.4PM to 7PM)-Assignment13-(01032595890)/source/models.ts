//User class (base class)
export class User {
  private _age: number;
  private notebooks: NoteBook[] = [];

  constructor(
    public id: number,
    public name: string,
    public email: string,
    private password: string,
    protected phone: string,
    age: number
  ) {
    //1: constructor, the age goes through the same check as the setter
    this._age = User.checkAge(age);
  }

  //_________________________________________________________________________________//

  //2: checkAge, must be a whole number between 18 and 60
  private static checkAge(age: number): number {
    if (!Number.isInteger(age) || age < 18 || age > 60) {
      throw new Error("the age must be between 18 and 60");
    }
    return age;
  }

  //_________________________________________________________________________________//

  //3: age getter and setter
  public get age(): number {
    return this._age;
  }

  public set age(value: number) {
    this._age = User.checkAge(value);
  }

  //_________________________________________________________________________________//

  //4: displayInfo, the password is hidden
  public displayInfo(): void {
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
  public addNotebook(notebook: NoteBook): void {
    if (this.notebooks.includes(notebook)) {
      throw new Error(`notebook "${notebook.title}" is already added`);
    }
    this.notebooks.push(notebook);
  }

  //_________________________________________________________________________________//

  //6: getNotebooks, returns a copy
  public getNotebooks(): NoteBook[] {
    return [...this.notebooks];
  }
}

//_________________________________________________________________________________//

//Admin class (inheritance)
export class Admin extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    super(id, name, email, password, phone, age);
  }

  //_________________________________________________________________________________//

  //1: manageNotes, shows all notes of a notebook
  public manageNotes(notebook: NoteBook): void {
    console.log(`Admin ${this.name} is managing "${notebook.title}" (${notebook.getNotesCount()} notes)`);
    notebook.getAllNotes().forEach((note) => {
      console.log(`  - [${note.id}] ${note.title} (by ${note.author.name})`);
    });
  }

  //_________________________________________________________________________________//

  //2: deleteNote, admin removes any note
  public deleteNote(notebook: NoteBook, noteId: number): boolean {
    return notebook.removeNote(noteId);
  }
}

//_________________________________________________________________________________//

//Note class (association with User)
export class Note {
  constructor(
    public id: number,
    public title: string,
    public content: string,
    public author: User
  ) {}

  //_________________________________________________________________________________//

  //1: userId, the id of the author
  public get userId(): number {
    return this.author.id;
  }

  //_________________________________________________________________________________//

  //2: preview, short version of the content
  public preview(length: number = 50): string {
    if (this.content.length <= length) {
      return this.content;
    }
    return this.content.substring(0, length) + "...";
  }
}

//_________________________________________________________________________________//

//NoteBook class (composition with Note)
export class NoteBook {
  private notes: Note[] = []; //composition: the notebook owns its notes
  private nextNoteId: number = 1;

  constructor(
    public id: number,
    public title: string
  ) {}

  //_________________________________________________________________________________//

  //1: addNote, the notebook creates the note itself so it can't live outside it
  public addNote(title: string, content: string, author: User): Note {
    const note = new Note(this.nextNoteId, title, content, author);
    this.nextNoteId++;
    this.notes.push(note);
    return note;
  }

  //_________________________________________________________________________________//

  //2: removeNote (true = removed, false = not found)
  public removeNote(noteId: number): boolean {
    const index = this.notes.findIndex((note) => note.id === noteId);
    if (index === -1) {
      return false;
    }
    this.notes.splice(index, 1);
    return true;
  }

  //_________________________________________________________________________________//

  //3: getAllNotes, returns a copy
  public getAllNotes(): Note[] {
    return [...this.notes];
  }

  //_________________________________________________________________________________//

  //4: getNotesCount
  public getNotesCount(): number {
    return this.notes.length;
  }
}

//_________________________________________________________________________________//

//Storage class (generic, works with any type)
export class Storage<T> {
  private items: T[] = [];

  //1: addItem
  public addItem(item: T): void {
    this.items.push(item);
  }

  //_________________________________________________________________________________//

  //2: removeItem (true = removed, false = not found)
  public removeItem(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  //_________________________________________________________________________________//

  //3: getAllItems, returns a copy
  public getAllItems(): T[] {
    return [...this.items];
  }
}