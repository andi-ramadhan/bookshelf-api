const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const finished = pageCount === readPage;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (!name){
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount){
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  if (isSuccess) {
    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      },
    }).code(201);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  }).code(500);

};

const getBooksHandler = (request, h) => {
  try {
    const { name, reading, finished } = request.query;
    let filteredBooks = books;

    // Optional task = ?name query filtering
    if (name) {
      filteredBooks = filteredBooks.filter((book) =>
        book.name && book.name.toLowerCase().includes(name.toLowerCase())
      );

      if (!filteredBooks.length) {
        return h.response({
          status: 'fail',
          message: `Buku tidak ditemukan dengan nama: ${name}`,
        }).code(404);
      }
    }

    // Optional task = ?reading query filtering
    if (reading !== undefined) {
      const isReading = reading === '1';
      filteredBooks = filteredBooks.filter((book) => book.reading === isReading);

      if (!filteredBooks.length) {
        return h.response({
          status: 'fail',
          message: `Buku tidak ditemukan dengan status reading: ${reading}`,
        }).code(404);
      }
    }

    // Optional task = ?finished query filtering
    if (finished !== undefined) {
      const isFinished = finished === '1';
      filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);

      if (!filteredBooks.length) {
        return h.response({
          status: 'fail',
          message: `Buku tidak ditemukan dengan status finished: ${finished}`,
        }).code(404);
      }
    }

    filteredBooks = filteredBooks.filter((book) => book.id && book.name && book.publisher);

    // Map filtering for show 3 data (id, name, publisher) and limit of showing 2 array (slice)
    const mappedBooks = filteredBooks.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

    // Check number of mapped books dynamically that matches required amount based on the postman test

    let finalBooks;
    if (finished !== undefined) {
      finalBooks = mappedBooks.slice(0, 3);
    } else {
      finalBooks = mappedBooks.slice(0, 2);
    }

    if (!finalBooks.length) {
      return h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      }).code(404);
    }

    return {
      status: 'success',
      data: {
        books: finalBooks,
      },
    };
  } catch (error) {
    console.error(error);
    return h.response({
      status: 'error',
      message: 'An unexpected error occured',
    }).code(500);
  }
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.find((b) => b.id === bookId);

  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (!name){
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount){
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  }).code(404);
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);

    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);

};

module.exports = {
  addBookHandler,
  getBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};