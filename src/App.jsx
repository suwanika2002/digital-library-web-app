
import { useCallback, useEffect, useState } from "react";
import Welcome from "./Welcome";
import Login from "./Login";
import MemberDashboard from "./pages/MemberDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import Books from "./pages/Books";
import MyReservations from "./pages/MyReservations";
import LibrarianReservations from "./pages/LibrarianReservations";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import ManageBooks from "./pages/ManageBooks";

function App() {
  const [page, setPage] = useState("welcome");
  const [role, setRole] = useState("member");
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");

  // Fetch the latest books from the backend.
  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    setBooksError("");

    try {
      const response = await fetch("http://localhost:5000/api/books");

      if (!response.ok) {
        throw new Error("Unable to load books.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid book data received.");
      }

      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
      setBooksError("Unable to load books. Please try again.");
    } finally {
      setBooksLoading(false);
    }
  }, []);

  // Fetch books when the app first loads.
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Refresh the catalogue whenever the Books page is opened.
  useEffect(() => {
    if (page === "books") {
      fetchBooks();
    }
  }, [page, fetchBooks]);

  // Save the logged-in user's information.
  const openDashboard = (user, token) => {
    if (!user || !token) {
      console.error("A valid user and token are required to log in.");
      return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));

    setRole(user.role);
    setPage("dashboard");
  };

  // Login page.
  if (page === "login") {
    return (
      <Login
        goBack={() => setPage("welcome")}
        onLogin={openDashboard}
        onRegister={() => setPage("account")}
      />
    );
  }

  // Member or librarian dashboard.
  if (page === "dashboard") {
    const Dashboard =
      role === "librarian" ? LibrarianDashboard : MemberDashboard;

    return (
      <Dashboard
        onNavigate={setPage}
        onLogout={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
          setRole("member");
          setPage("welcome");
        }}
      />
    );
  }

  // Book catalogue.
  if (page === "books") {
    if (booksLoading && books.length === 0) {
      return <p>Loading books...</p>;
    }

    if (booksError && books.length === 0) {
      return (
        <section>
          <p>{booksError}</p>
          <button type="button" onClick={fetchBooks}>
            Try again
          </button>
        </section>
      );
    }

    return (
      <Books
        books={books}
        onNavigate={setPage}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setPage("bookDetails");
        }}
      />
    );
  }

  // Librarian book management.
  if (page === "manageBooks") {
    return (
      <ManageBooks
        books={books}
        onBooksChange={setBooks}
        onNavigate={setPage}
      />
    );
  }

  // Selected book details.
 
if (page === "bookDetails") {
  const currentBook =
    books.find(
      (book) =>
        String(book.id ?? book._id) ===
        String(selectedBook?.id ?? selectedBook?._id)
    ) ?? null;

  return (
    <BookDetails
      book={currentBook}
      onNavigate={setPage}
      onBookReserved={fetchBooks}
    />
  );
}


  // Reservation pages.
  if (page === "reservations") {
    if (role === "librarian") {
      return <LibrarianReservations onNavigate={setPage} />;
    }

    return <MyReservations onNavigate={setPage} />;
  }

  // Registration page.
  if (page === "account") {
    return <Register onNavigate={setPage} />;
  }

  // Welcome page.
  return (
    <Welcome
      goToLogin={() => setPage("login")}
      goToRegister={() => setPage("account")}
      goToDashboard={() => setPage("login")}
    />
  );
}

export default App;
