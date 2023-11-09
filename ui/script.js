const invoke = window.__TAURI_INTERNALS__.invoke;

document.addEventListener('DOMContentLoaded', () => {
    const notesList = document.getElementById('notes-list');
    const enterKeyButton = document.getElementById('enter-key-button');
    const newNoteButton = document.getElementById('new-note-button');
    const modal = document.getElementById('note-modal');
    const closeModal = document.getElementById('close-modal');
    const saveNoteButton = document.getElementById('save-note-button');
    const deleteNoteButton = document.getElementById('delete-note-button');
    const titleInput = document.getElementById('note-title-input');
    const contentInput = document.getElementById('note-content-input');
    let currentNoteIndex = null;

    enterKey();

    newNoteButton.addEventListener('click', () => {
        currentNoteIndex = null;
        titleInput.value = '';
        contentInput.value = '';
        deleteNoteButton.style.display = 'none';
        modal.style.display = 'block';
        titleInput.focus();
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    saveNoteButton.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        if (title && content) {
            if (currentNoteIndex !== null) {
                await updateNote(currentNoteIndex, title, content);
            } else {
                await saveNewNote(title, content);
            }
            modal.style.display = 'none';
        } else {
            alert("Both fields are required!");
        }
    });

    deleteNoteButton.addEventListener('click', () => {
        if (currentNoteIndex !== null) {
            deleteNote(currentNoteIndex);
            modal.style.display = 'none';
        }
    });

    enterKeyButton.addEventListener('click', enterKey);

    function enterKey() {
        let key = prompt("Please enter your secret key:", "");
        if (key) {
            invoke('aes_setup', { key: key });
        }
        renderNotes();
    }

    async function encrypt(msg) {
        return await invoke('aes_encrypt', { msg: msg });
    }

    async function decrypt(buf) {
        return await invoke('aes_decrypt', { buf: buf });
    }

    async function saveNewNote(title, content) {
        title = await encrypt(title);
        content = await encrypt(content);

        if (!title || !content) {
            alert("Key not entered!");
            return;
        }

        const notes = getNotes();
        notes.push({ title, content });
        localStorage.setItem('notes', JSON.stringify(notes));

        renderNotes();
    }

    async function updateNote(index, title, content) {
        title = await encrypt(title);
        content = await encrypt(content);

        if (!title || !content) {
            alert("Key not entered!");
            return;
        }

        const notes = getNotes();
        notes[index] = { title, content };
        localStorage.setItem('notes', JSON.stringify(notes));

        renderNotes();
    }

    function deleteNote(index) {
        let notes = getNotes();
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }

    function renderNotes() {
        const notes = getNotes();
        notesList.innerHTML = '';
        notes.forEach(async (note, index) => {
            note.title = await decrypt(note.title);
            note.content = await decrypt(note.content);

            if (note.title && note.content) {
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                noteElement.innerHTML = `
                    <h2 class="note-title">${note.title}</h2>
                    <p class="note-content">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
                `;
                noteElement.addEventListener('click', () => {
                    currentNoteIndex = index;
                    titleInput.value = note.title;
                    contentInput.value = note.content;
                    deleteNoteButton.style.display = 'block';
                    modal.style.display = 'block';
                });
                notesList.appendChild(noteElement);
            }
        });
    }

    function getNotes() {
        return JSON.parse(localStorage.getItem('notes') || '[]');
    }
});
