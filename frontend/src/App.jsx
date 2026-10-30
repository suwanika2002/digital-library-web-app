
import { useCallback, useEffect, useState } from "react";
import Welcome from "./Welcome";
import Login from "./Login";
import MemberDashboard from "./pages/MemberDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import Books from "./pages/Books";
import MyReservations from "./pages/MyReservations";
import LibrarianReservations from "./pages/LibrarianReservations";
import LibrarianHistory from "./pages/LibrarianHistory";
import BorrowingManagement from "./pages/BorrowingManagement";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import ManageBooks from "./pages/ManageBooks";

function App() {
  const [page, setPage] = useState("welcome");
  const [role, setRole] = useState("member");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");

  const navigate = useCallback((nextPage) => {
    if (nextPage === "books" || nextPage === "bookDetails") {
      setBooksLoading(true);
    }

    setPage(nextPage);
  }, []);

  const requestBooks = useCallback(async () => {
    const response = await fetch("http://localhost:5000/api/books");

    if (!response.ok) {
      throw new Error("Unable to load books.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid book data received.");
    }

    return data;
  }, []);

  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    setBooksError("");

    try {
      setBooks(await requestBooks());
    } catch (error) {
      console.error("Error loading books:", error);
      setBooksError("Unable to load books. Please try again.");
    } finally {
      setBooksLoading(false);
    }
  }, [requestBooks]);

  useEffect(() => {
    if (!["welcome", "books", "bookDetails"].includes(page)) return undefined;
    let ignore = false;

    const load = async () => {
      try {
        const data = await requestBooks();
        if (!ignore) {
          setBooksError("");
          setBooks(data);
        }
      } catch (error) {
        console.error("Error loading books:", error);
        if (!ignore) setBooksError("Unable to load books. Please try again.");
      } finally {
        if (!ignore) setBooksLoading(false);
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [page, requestBooks]);

  // Save the logged-in user's information.
  const openDashboard = (user, token) => {
    if (!user || !token) {
      console.error("A valid user and token are required to log in.");
      return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));

    setLoggedInUser(user);
    setRole(user.role);
    navigate("dashboard");
  };

  // Login page.
  if (page === "login") {
    return (
      <Login
        goBack={() => navigate("welcome")}
        onLogin={openDashboard}
        onRegister={() => navigate("account")}
      />
    );
  }

  // Member or librarian dashboard.
  if (page === "dashboard") {
    const Dashboard =
      role === "librarian" ? LibrarianDashboard : MemberDashboard;

    return (
      <Dashboard
        onNavigate={navigate}
        onLogout={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
          setLoggedInUser(null);
          setRole("member");
          navigate("welcome");
        }}
        user={loggedInUser}
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
        onNavigate={navigate}
        onSelectBook={(book) => {
          setSelectedBook(book);
          navigate("bookDetails");
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
        onNavigate={navigate}
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
      onNavigate={navigate}
      onBookReserved={fetchBooks}
    />
  );
}


  // Reservation pages.
  if (page === "reservations") {
    if (role === "librarian") {
      return       <LibrarianReservations onNavigate={navigate} />;
    }

    return <MyReservations onNavigate={navigate} />;
  }

  if (page === "borrowing") {
    if (role === "librarian") {
      return <BorrowingManagement onNavigate={navigate} />;
    }

    return <MyReservations onNavigate={navigate} />;
  }

  if (page === "librarianHistory") {
    if (role === "librarian") {
      return <LibrarianHistory onNavigate={navigate} />;
    }

    return <MyReservations onNavigate={navigate} />;
  }

  // Registration page.
  if (page === "account") {
    return <Register onNavigate={navigate} />;
  }

  // Welcome page.
  return (
    <Welcome
      goToLogin={() => navigate("login")}
      goToRegister={() => navigate("account")}
      goToDashboard={() => navigate("login")}
    />
  );
}

export default App;
