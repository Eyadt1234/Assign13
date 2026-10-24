import { Admin, Note, NoteBook, Storage, User } from "./models.js";

let passed = 0;
let failed = 0;

//1: test, runs one test and prints the result
const test = (name: string, run: () => void): void => {
  try {
    run();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed++;
    console.log(` FAIL ${name}\n ${(error as Error).message}`);
  }
};

//_________________________________________________________________________________//

//2: check, throws if the condition is false
const check = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

//_________________________________________________________________________________//

//3: checkThrows, the function must throw an error that contains the text
const checkThrows = (run: () => unknown, text: string): void => {
  try {
    run();
  } catch (error) {
    check((error as Error).message.includes(text), `wrong error message: ${(error as Error).message}`);
    return;
  }
  throw new Error(`expected an error containing "${text}"`);
};

//_________________________________________________________________________________//

//4: makers
const makeUser = (id: number = 1): User => new User(id, "Eyad", "eyad@gmail.com", "Eyad0124!", "01112345678", 22);
const makeAdmin = (id: number = 99): Admin => new Admin(id, "Ziad", "ziad@gmail.com", "Ziad0124!", "01212345678", 28);

//_________________________________________________________________________________//

//5: silent, runs a function without printing its console.log
const silent = <R>(run: () => R): R => {
  const oldLog = console.log;
  console.log = () => {};
  try {
    return run();
  } finally {
    console.log = oldLog;
  }
};

//_________________________________________________________________________________//

console.log("\n1 - User");

test("creates a user with all properties", () => {
  const user = makeUser();
  check(user.id === 1 && user.name === "Eyad" && user.email === "eyad@gmail.com" && user.age === 22, "wrong values");
});

test("age 18 and 60 are accepted", () => {
  check(new User(1, "Mohamed", "mohamed@gmail.com", "Mohamed0124!", "01512345678", 18).age === 18, "18 rejected");
  check(new User(1, "Mohamed", "mohamed@gmail.com", "Mohamed0124!", "01512345678", 60).age === 60, "60 rejected");
});

test("age 17, 61, 25.5, NaN and negative are rejected", () => {
  for (const age of [17, 61, 25.5, NaN, -5, 0]) {
    checkThrows(() => new User(1, "Mohamed", "mohamed@gmail.com", "Mohamed0124!", "01512345678", age), "between 18 and 60");
  }
});

test("age setter validates and keeps the old age on error", () => {
  const user = makeUser();
  user.age = 40;
  check(user.age === 40, "age not changed");
  checkThrows(() => (user.age = 10), "between 18 and 60");
  check(user.age === 40, "age changed after a failed set");
});

test("password is private and phone is protected (compile time)", () => {
  const user = makeUser();
  //@ts-expect-error password is private
  check(user.password === "Eyad0124!", "wrong password value");
  //@ts-expect-error phone is protected
  check(user.phone === "01112345678", "wrong phone value");
});

test("displayInfo prints the information and hides the password", () => {
  const lines: string[] = [];
  const oldLog = console.log;
  console.log = (text: string) => lines.push(text);
  makeUser().displayInfo();
  console.log = oldLog;
  const text = lines.join("\n");
  check(lines.length === 1, "should print once");
  check(text.includes("Eyad") && text.includes("eyad@gmail.com") && text.includes("01112345678") && text.includes("22"), "data missing");
  check(!text.includes("Eyad0124!"), "password leaked");
});

//_________________________________________________________________________________//

console.log("\n2 - Admin (inheritance)");

test("Admin is also a User and keeps its properties", () => {
  const admin = makeAdmin();
  check(admin instanceof User && admin instanceof Admin, "not instanceof User");
  check(admin.name === "Ziad" && admin.age === 28, "inherited members missing");
});

test("Admin keeps the age validation of User", () => {
  checkThrows(() => new Admin(1, "Mohamed", "mohamed@gmail.com", "Mohamed0124!", "01512345678", 70), "between 18 and 60");
});

test("manageNotes prints every note of the notebook", () => {
  const lines: string[] = [];
  const oldLog = console.log;
  console.log = (text: string) => lines.push(text);
  const book = new NoteBook(1, "Book");
  book.addNote("One", "first", makeUser(1));
  book.addNote("Two", "second", makeUser(2));
  makeAdmin().manageNotes(book);
  console.log = oldLog;
  check(lines.length === 3, "wrong number of lines");
  check(lines[1]!.includes("One") && lines[2]!.includes("Two"), "notes missing");
});

test("admin can delete a note of another user", () => {
  const book = new NoteBook(1, "Book");
  book.addNote("One", "first", makeUser(1));
  check(makeAdmin().deleteNote(book, 1) === true && book.getNotesCount() === 0, "not deleted");
  check(makeAdmin().deleteNote(book, 1) === false, "deleted twice");
});

//_________________________________________________________________________________//

console.log("\n3 - Note (association)");

test("note has id, title, content and a real reference to its author", () => {
  const user = makeUser(7);
  const note = new Note(5, "Title", "Content", user);
  check(note.id === 5 && note.title === "Title" && note.content === "Content", "wrong values");
  check(note.author === user, "author is not the same object");
  check(note.userId === 7, "userId is wrong");
});

test("preview returns short content as it is", () => {
  check(new Note(1, "T", "Hello", makeUser()).preview() === "Hello", "short content changed");
});

test("preview cuts long content and adds ...", () => {
  const note = new Note(1, "T", "a".repeat(100), makeUser());
  check(note.preview() === "a".repeat(50) + "...", "default length wrong");
  check(note.preview(10) === "a".repeat(10) + "...", "custom length wrong");
});

test("preview with exact length has no ...", () => {
  check(new Note(1, "T", "12345", makeUser()).preview(5) === "12345", "added ... by mistake");
});

//_________________________________________________________________________________//

console.log("\n4 - NoteBook (composition)");

test("addNote creates the note inside the notebook with unique ids", () => {
  const user = makeUser();
  const book = new NoteBook(1, "Book");
  const a = book.addNote("A", "a", user);
  const b = book.addNote("B", "b", user);
  check(a.id === 1 && b.id === 2 && book.getNotesCount() === 2, "ids or count wrong");
  check(a.author === user, "author not saved");
});

test("ids are not reused after a removal", () => {
  const book = new NoteBook(1, "Book");
  book.addNote("A", "a", makeUser());
  book.removeNote(1);
  check(book.addNote("B", "b", makeUser()).id === 2, "id was reused");
});

test("removeNote removes by id and returns false when not found", () => {
  const book = new NoteBook(1, "Book");
  book.addNote("A", "a", makeUser());
  book.addNote("B", "b", makeUser());
  check(book.removeNote(1) === true && book.getNotesCount() === 1, "not removed");
  check(book.getAllNotes()[0]!.title === "B", "removed the wrong note");
  check(book.removeNote(1) === false && book.removeNote(99) === false, "removed a missing note");
});

test("getAllNotes returns a copy", () => {
  const book = new NoteBook(1, "Book");
  book.addNote("A", "a", makeUser());
  book.getAllNotes().pop();
  check(book.getNotesCount() === 1, "outside code changed the notebook");
});

test("notes of different notebooks are independent", () => {
  const book1 = new NoteBook(1, "One");
  const book2 = new NoteBook(2, "Two");
  book1.addNote("A", "a", makeUser());
  check(book2.getNotesCount() === 0 && book1.getNotesCount() === 1, "notes are shared");
});

test("empty notebook", () => {
  check(new NoteBook(1, "Empty").getAllNotes().length === 0, "not empty");
});

//_________________________________________________________________________________//

console.log("\n5 - User and NoteBook (aggregation)");

test("user can own many notebooks", () => {
  const user = makeUser();
  user.addNotebook(new NoteBook(1, "One"));
  user.addNotebook(new NoteBook(2, "Two"));
  check(user.getNotebooks().length === 2, "wrong count");
});

test("same notebook can't be added twice", () => {
  const user = makeUser();
  const book = new NoteBook(1, "One");
  user.addNotebook(book);
  checkThrows(() => user.addNotebook(book), "already added");
});

test("a notebook exists on its own and can be shared by two users", () => {
  const book = new NoteBook(1, "Shared");
  const user1 = makeUser(1);
  const user2 = makeUser(2);
  user1.addNotebook(book);
  user2.addNotebook(book);
  check(user1.getNotebooks()[0] === user2.getNotebooks()[0], "not the same notebook");
});

test("getNotebooks returns a copy", () => {
  const user = makeUser();
  user.addNotebook(new NoteBook(1, "One"));
  user.getNotebooks().pop();
  check(user.getNotebooks().length === 1, "outside code changed the list");
});

//_________________________________________________________________________________//

console.log("\n6 - Storage (generics)");

test("stores numbers, strings, users and notes", () => {
  const numbers = new Storage<number>();
  const strings = new Storage<string>();
  const users = new Storage<User>();
  const notes = new Storage<Note>();
  const user = makeUser();
  numbers.addItem(1);
  numbers.addItem(2);
  strings.addItem("hi");
  users.addItem(user);
  notes.addItem(new Note(1, "T", "C", user));
  check(numbers.getAllItems().join() === "1,2", "numbers wrong");
  check(strings.getAllItems()[0] === "hi" && users.getAllItems()[0] === user && notes.getAllItems().length === 1, "wrong values");
});

test("removeItem removes one item and returns false when missing", () => {
  const storage = new Storage<string>();
  storage.addItem("a");
  storage.addItem("b");
  check(storage.removeItem("a") === true && storage.getAllItems().join() === "b", "not removed");
  check(storage.removeItem("zzz") === false, "removed a missing item");
});

test("removeItem removes only the first duplicate", () => {
  const storage = new Storage<number>();
  [5, 5, 5].forEach((n) => storage.addItem(n));
  storage.removeItem(5);
  check(storage.getAllItems().length === 2, "removed more than one");
});

test("getAllItems returns a copy and empty storage works", () => {
  const storage = new Storage<number>();
  check(storage.getAllItems().length === 0, "not empty");
  storage.addItem(1);
  storage.getAllItems().pop();
  check(storage.getAllItems().length === 1, "outside code changed the storage");
});

//_________________________________________________________________________________//

test("full flow: user, admin, notebook, notes and storage together", () => {
  silent(() => {
    const user = makeUser(1);
    const admin = makeAdmin(2);
    const book = new NoteBook(1, "Flow");
    const storage = new Storage<Note>();
    user.addNotebook(book);
    storage.addItem(book.addNote("A", "from user", user));
    storage.addItem(book.addNote("B", "from admin", admin));
    admin.manageNotes(book);
    admin.deleteNote(book, 1);
    check(book.getNotesCount() === 1 && storage.getAllItems().length === 2, "flow broken");
    check(user.getNotebooks()[0]!.getAllNotes()[0]!.author === admin, "wrong remaining note");
  });
});

console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  throw new Error(`${failed} test(s) failed`);
}