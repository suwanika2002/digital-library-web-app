import { useState } from "react";
import Welcome from "./Welcome";
import Login from "./Login";
import MemberDashboard from "./pages/MemberDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Books from "./pages/Books";
import MyReservations from "./pages/MyReservations";

function App() {
  const [page, setPage] = useState("welcome");
  const [role, setRole] = useState("member");

  const openDashboard = (selectedRole = role) => {
    setRole(selectedRole);
    setPage("dashboard");
  };

  if (page === "login") {
    return (
      <Login
        goBack={() => setPage("welcome")}
        onLogin={openDashboard}
      />
    );
  }

  if (page === "dashboard") {
    const Dashboard = {
      member: MemberDashboard,
      librarian: LibrarianDashboard,
      admin: AdminDashboard,
    }[role];

    return (
      <Dashboard
        onNavigate={setPage}
        onLogout={() => setPage("welcome")}
      />
    );
  }

  if (page === "books") {
    return <Books onNavigate={setPage} />;
  }

  if (page === "reservations") {
    return <MyReservations onNavigate={setPage} />;
  }

  if (page !== "welcome") {
    const pageContent = {
      bookDetails: {
        title: "Book details",
        description: "Book information and availability will appear here.",
        action: "Browse books",
        nextPage: "books",
      },
      account: {
        title: "Account registration",
        description: "Member account registration will be available here.",
        action: "Back to dashboard",
        nextPage: "dashboard",
      },
    }[page];

    if (pageContent) {
      return (
        <section className="library-page">
          <header className="library-page-header">
            <button
              type="button"
              className="library-brand"
              onClick={() => setPage("dashboard")}
            >
              📚 Digital Library
            </button>
            <button
              type="button"
              className="library-nav-button"
              onClick={() => setPage("dashboard")}
            >
              Dashboard
            </button>
          </header>
          <main className="library-page-content">
            <p className="library-eyebrow">DIGITAL LIBRARY</p>
            <h1>{pageContent.title}</h1>
            <p>{pageContent.description}</p>
            <div className="demo-notice">
              Demo view: library data and authentication are not connected yet.
            </div>
            <button
              type="button"
              className="library-primary-button"
              onClick={() => setPage(pageContent.nextPage)}
            >
              {pageContent.action}
            </button>
            <button
              type="button"
              className="library-back-button"
              onClick={() => setPage("dashboard")}
            >
              Back to dashboard
            </button>
          </main>
        </section>
      );
    }
  }

  return (
    <Welcome
      goToLogin={() => setPage("login")}
      goToDashboard={() => openDashboard("member")}
    />
  );
}

export default App;