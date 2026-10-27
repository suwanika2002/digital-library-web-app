import { useState } from "react";
import Welcome from "./Welcome";
import Login from "./Login";
import MemberDashboard from "./pages/MemberDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import Books from "./pages/Books";
import MyReservations from "./pages/MyReservations";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import ManageBooks from "./pages/ManageBooks";
import { books as initialBooks } from "./data/books";

function App() {
  const [page, setPage] = useState("welcome");
  const [role, setRole] = useState("member");
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState(initialBooks);

  const openDashboard = (user, token) => {
  localStorage.setItem("authToken", token);
  localStorage.setItem("authUser", JSON.stringify(user));

  setRole(user.role);
  setPage("dashboard");
};

  if (page === "login") {
    return (
      <Login
        goBack={() => setPage("welcome")}
        onLogin={openDashboard}
        onRegister={() => setPage("account")}
      />
    );
  }

  if (page === "dashboard") {
    const Dashboard = role === "member" ? MemberDashboard : LibrarianDashboard;

    return (
      <Dashboard
        onNavigate={setPage}
        onLogout={() => setPage("welcome")}
      />
    );
  }

  if (page === "books") {
    return (
      <Books
        onNavigate={setPage}
        books={books}
        onSelectBook={(book) => {
          setSelectedBook(book);
          setPage("bookDetails");
        }}
      />
    );
  }

  if (page === "manageBooks") {
    return (
      <ManageBooks
        books={books}
        onBooksChange={setBooks}
        onNavigate={setPage}
      />
    );
  }

  if (page === "bookDetails") {
    const currentBook =
      books.find((book) => book.id === selectedBook?.id) ?? null;
    return <BookDetails book={currentBook} onNavigate={setPage} />;
  }

  if (page === "reservations") {
    return <MyReservations onNavigate={setPage} />;
  }

  if (page === "account") {
    return <Register onNavigate={setPage} />;
  }

  return (
    <Welcome
      goToLogin={() => setPage("login")}
      goToRegister={() => setPage("account")}
      goToDashboard={() => openDashboard("member")}
    />
  );
}

export default App;