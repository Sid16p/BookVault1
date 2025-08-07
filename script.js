       // Book management system
        class BookVault {
            constructor() {
                this.books = JSON.parse(localStorage.getItem('bookVaultBooks')) || [];
                this.currentEditId = null;
                this.bookToDelete = null;
                this.init();
            }

            init() {
                this.renderBooks();
                this.updateStats();
                this.setupEventListeners();
                this.populateGenreFilter();
            }

            setupEventListeners() {
                // Search functionality
                document.getElementById('searchInput').addEventListener('input', () => {
                    this.renderBooks();
                });

                // Filter functionality
                document.getElementById('statusFilter').addEventListener('change', () => {
                    this.renderBooks();
                });

                document.getElementById('genreFilter').addEventListener('change', () => {
                    this.renderBooks();
                });

                // Form submission
                document.getElementById('bookForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveBook();
                });
            }

            generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            }

            addBook(bookData) {
                const book = {
                    id: this.generateId(),
                    ...bookData,
                    dateAdded: new Date().toISOString()
                };
                this.books.push(book);
                this.saveToStorage();
                this.renderBooks();
                this.updateStats();
                this.populateGenreFilter();
            }

            updateBook(id, bookData) {
                const index = this.books.findIndex(book => book.id === id);
                if (index !== -1) {
                    this.books[index] = { ...this.books[index], ...bookData };
                    this.saveToStorage();
                    this.renderBooks();
                    this.updateStats();
                    this.populateGenreFilter();
                }
            }

            deleteBook(id) {
                this.books = this.books.filter(book => book.id !== id);
                this.saveToStorage();
                this.renderBooks();
                this.updateStats();
                this.populateGenreFilter();
            }

            saveToStorage() {
                localStorage.setItem('bookVaultBooks', JSON.stringify(this.books));
            }

            getFilteredBooks() {
                const searchTerm = document.getElementById('searchInput').value.toLowerCase();
                const statusFilter = document.getElementById('statusFilter').value;
                const genreFilter = document.getElementById('genreFilter').value;

                return this.books.filter(book => {
                    const matchesSearch = !searchTerm || 
                        book.title.toLowerCase().includes(searchTerm) ||
                        book.author.toLowerCase().includes(searchTerm) ||
                        (book.genre && book.genre.toLowerCase().includes(searchTerm));
                    
                    const matchesStatus = !statusFilter || book.status === statusFilter;
                    const matchesGenre = !genreFilter || book.genre === genreFilter;

                    return matchesSearch && matchesStatus && matchesGenre;
                });
            }

            renderBooks() {
                const booksGrid = document.getElementById('booksGrid');
                const emptyState = document.getElementById('emptyState');
                const filteredBooks = this.getFilteredBooks();

                if (filteredBooks.length === 0) {
                    booksGrid.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    return;
                }

                emptyState.classList.add('hidden');
                
                booksGrid.innerHTML = filteredBooks.map(book => `
                    <div class="book-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 slide-up">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-2">${book.title}</h3>
                                <p class="text-gray-600 mb-2">by ${book.author}</p>
                                ${book.genre ? `<span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${book.genre}</span>` : ''}
                            </div>
                            <div class="flex space-x-1 ml-2">
                                <button onclick="bookVault.editBook('${book.id}')" class="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="bookVault.openDeleteModal('${book.id}')" class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-500">Status:</span>
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(book.status)}">
                                    ${this.getStatusText(book.status)}
                                </span>
                            </div>
                            
                            ${book.year ? `
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-500">Year:</span>
                                    <span class="text-sm text-gray-900">${book.year}</span>
                                </div>
                            ` : ''}
                            
                            ${book.rating ? `
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-500">Rating:</span>
                                    <span class="text-sm">${'⭐'.repeat(parseInt(book.rating))}</span>
                                </div>
                            ` : ''}
                            
                            ${book.notes ? `
                                <div class="mt-3 pt-3 border-t border-gray-100">
                                    <p class="text-sm text-gray-600 line-clamp-3">${book.notes}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }

            getStatusColor(status) {
                const colors = {
                    'read': 'bg-green-100 text-green-800',
                    'reading': 'bg-blue-100 text-blue-800',
                    'to-read': 'bg-yellow-100 text-yellow-800'
                };
                return colors[status] || 'bg-gray-100 text-gray-800';
            }

            getStatusText(status) {
                const texts = {
                    'read': 'Read',
                    'reading': 'Reading',
                    'to-read': 'To Read'
                };
                return texts[status] || status;
            }

            updateStats() {
                const total = this.books.length;
                const read = this.books.filter(book => book.status === 'read').length;
                const toRead = this.books.filter(book => book.status === 'to-read').length;

                document.getElementById('totalBooks').textContent = total;
                document.getElementById('readBooks').textContent = read;
                document.getElementById('toReadBooks').textContent = toRead;
            }

            populateGenreFilter() {
                const genres = [...new Set(this.books.map(book => book.genre).filter(Boolean))].sort();
                const genreFilter = document.getElementById('genreFilter');
                const currentValue = genreFilter.value;
                
                genreFilter.innerHTML = '<option value="">All Genres</option>' + 
                    genres.map(genre => `<option value="${genre}">${genre}</option>`).join('');
                
                genreFilter.value = currentValue;
            }

            saveBook() {
                const bookData = {
                    title: document.getElementById('bookTitle').value.trim(),
                    author: document.getElementById('bookAuthor').value.trim(),
                    genre: document.getElementById('bookGenre').value.trim(),
                    year: document.getElementById('bookYear').value,
                    status: document.getElementById('bookStatus').value,
                    rating: document.getElementById('bookRating').value,
                    notes: document.getElementById('bookNotes').value.trim()
                };

                if (!bookData.title || !bookData.author) {
                    alert('Please fill in the required fields (Title and Author).');
                    return;
                }

                if (this.currentEditId) {
                    this.updateBook(this.currentEditId, bookData);
                } else {
                    this.addBook(bookData);
                }

                this.closeModal();
            }

            editBook(id) {
                const book = this.books.find(book => book.id === id);
                if (!book) return;

                this.currentEditId = id;
                
                document.getElementById('modalTitle').textContent = 'Edit Book';
                document.getElementById('submitButtonText').textContent = 'Update Book';
                
                document.getElementById('bookTitle').value = book.title;
                document.getElementById('bookAuthor').value = book.author;
                document.getElementById('bookGenre').value = book.genre || '';
                document.getElementById('bookYear').value = book.year || '';
                document.getElementById('bookStatus').value = book.status;
                document.getElementById('bookRating').value = book.rating || '';
                document.getElementById('bookNotes').value = book.notes || '';

                document.getElementById('bookModal').classList.remove('hidden');
                document.getElementById('bookModal').classList.add('flex');
            }

            openDeleteModal(id) {
                this.bookToDelete = id;
                document.getElementById('deleteModal').classList.remove('hidden');
                document.getElementById('deleteModal').classList.add('flex');
            }

            closeDeleteModal() {
                this.bookToDelete = null;
                document.getElementById('deleteModal').classList.add('hidden');
                document.getElementById('deleteModal').classList.remove('flex');
            }

            confirmDelete() {
                if (this.bookToDelete) {
                    this.deleteBook(this.bookToDelete);
                    this.closeDeleteModal();
                }
            }

            closeModal() {
                this.currentEditId = null;
                document.getElementById('bookForm').reset();
                document.getElementById('modalTitle').textContent = 'Add New Book';
                document.getElementById('submitButtonText').textContent = 'Add Book';
                document.getElementById('bookModal').classList.add('hidden');
                document.getElementById('bookModal').classList.remove('flex');
            }
        }

        // Global functions for button clicks
        function openAddModal() {
            bookVault.closeModal(); // Reset form
            document.getElementById('bookModal').classList.remove('hidden');
            document.getElementById('bookModal').classList.add('flex');
        }

        function closeModal() {
            bookVault.closeModal();
        }

        function closeDeleteModal() {
            bookVault.closeDeleteModal();
        }

        function confirmDelete() {
            bookVault.confirmDelete();
        }

        // Initialize the app
        const bookVault = new BookVault();

        // Add some sample books if none exist
        if (bookVault.books.length === 0) {
            const sampleBooks = [
                {
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    genre: "Classic Literature",
                    year: "1925",
                    status: "read",
                    rating: "5",
                    notes: "A masterpiece of American literature. The symbolism and prose are incredible."
                },
                {
                    title: "To Kill a Mockingbird",
                    author: "Harper Lee",
                    genre: "Classic Literature",
                    year: "1960",
                    status: "read",
                    rating: "4",
                    notes: "Powerful story about justice and morality in the American South."
                },
                {
                    title: "Dune",
                    author: "Frank Herbert",
                    genre: "Science Fiction",
                    year: "1965",
                    status: "reading",
                    rating: "",
                    notes: "Complex world-building and political intrigue. Taking my time with this one."
                },
                {
                    title: "The Midnight Library",
                    author: "Matt Haig",
                    genre: "Contemporary Fiction",
                    year: "2020",
                    status: "to-read",
                    rating: "",
                    notes: "Heard great things about this book. Looking forward to reading it."
                }
            ];

            sampleBooks.forEach(book => bookVault.addBook(book));
        }
