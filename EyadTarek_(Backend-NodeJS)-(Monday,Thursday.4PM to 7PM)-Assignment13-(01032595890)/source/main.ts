import { Admin, Note, NoteBook, Storage, User } from "./models.js";

//1: users
const user1 = new User(1, "Eyad", "eyad@gmail.com", "Eyad0124!", "01112345678", 22);
const admin = new Admin(2, "Ziad", "ziad@gmail.com", "Ziad0124!", "01212345678", 28);
user1.displayInfo();
admin.displayInfo();

//_________________________________________________________________________________//

//2: notebook and notes (composition)
const notebook = new NoteBook(1, "Study Notes");
const note1 = notebook.addNote("Lab Reminder", "Remember to finish the TypeScript OOP assignment before the Thursday lab session.", user1);
const note2 = notebook.addNote("Diagram Review", "Check every relationship in the UML class diagram.", admin);

console.log(`\nPreview of note1: ${note1.preview()}`);
console.log(`Preview of note2: ${note2.preview(20)}`);
console.log(`Author of note1: ${note1.author.name} (userId = ${note1.userId})`);

//_________________________________________________________________________________//

//3: user owns notebooks (aggregation)
user1.addNotebook(notebook);
console.log(`\n${user1.name} owns ${user1.getNotebooks().length} notebook(s)`);

//_________________________________________________________________________________//

//4: admin manages notes (inheritance)
console.log("\n--- Admin managing notes ---");
admin.manageNotes(notebook);
console.log(`Deleted note ${note2.id}: ${admin.deleteNote(notebook, note2.id)}`);
admin.manageNotes(notebook);

//_________________________________________________________________________________//

//5: age validation
try {
  new User(3, "Mohamed", "mohamed@gmail.com", "Mohamed0124!", "01512345678", 17);
} catch (error) {
  console.log(`\nBlocked: ${(error as Error).message}`);
}

//_________________________________________________________________________________//

//6: generic storage with different types
const noteStorage = new Storage<Note>();
noteStorage.addItem(note1);
const numberStorage = new Storage<number>();
numberStorage.addItem(10);
numberStorage.addItem(20);
numberStorage.removeItem(10);
console.log(`\nNotes in storage: ${noteStorage.getAllItems().length}`);
console.log(`Numbers in storage: ${numberStorage.getAllItems()}`);