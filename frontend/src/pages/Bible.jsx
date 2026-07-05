import { useEffect, useState } from "react";
import API from "../services/api";

export default function Bible() {
  const [dailyVerses, setDailyVerses] = useState([]);
  const [verseOfTheDay, setVerseOfTheDay] = useState(null);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [passage, setPassage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDailyVerses();
    loadBookList();
  }, []);

  useEffect(() => {
    if (!selectedBook && books.length > 0) {
      setSelectedBook(books[0]);
    }
  }, [books, selectedBook]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadPassage(selectedBook, selectedChapter);
    }
  }, [selectedBook, selectedChapter]);

  const loadDailyVerses = async () => {
    try {
      const res = await API.get("/bible/daily");
      setDailyVerses(res.data.verses || []);
      setVerseOfTheDay(res.data.verse_of_the_day || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load daily verses.");
    }
  };

  const loadBookList = async () => {
    try {
      console.log("Loading book list");
      const res = await API.get("/bible/books");
      console.log("Books response:", res.data);
      setBooks(res.data.books || []);
      setError(""); // Clear any previous error
    } catch (err) {
      console.error("Books load error:", err);
      if (err.response && err.response.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError("Failed to load Bible books. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (book) => {
    try {
      console.log("Loading chapters for book:", book);
      const res = await API.get("/bible/chapters", { params: { book } });
      console.log("Chapters response:", res.data);
      setChapters(res.data.chapters || []);
      if (res.data.chapters && res.data.chapters.length > 0) {
        setSelectedChapter(String(res.data.chapters[0]));
      }
      setError(""); // Clear any previous error
    } catch (err) {
      console.error("Chapters load error:", err);
      setChapters([]);
      setSelectedChapter("");
      if (err.response && err.response.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response && err.response.status === 404) {
        setError(`Book '${book}' not found.`);
      } else {
        setError("Failed to load chapters. Please try again.");
      }
    }
  };

  const loadPassage = async (book, chapter) => {
    if (!book || !chapter) return;
    setLoadingPassage(true);
    console.log("Loading passage for:", book, chapter, typeof chapter);
    try {
      const res = await API.get("/bible/passage", {
        params: { book, chapter: Number(chapter) },
      });
      console.log("Passage response:", res.data);
      setPassage(res.data.verses || []);
      setError(""); // Clear any previous error
    } catch (err) {
      console.error("Passage load error:", err);
      setPassage([]);
      if (err.response && err.response.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response && err.response.status === 404) {
        setError(`Chapter ${chapter} not found in book ${book}. Please select a valid chapter.`);
      } else {
        setError("Failed to load passage. Please check your connection and try again.");
      }
    } finally {
      setLoadingPassage(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.bread}>Bible Study</p>
          <h1 style={styles.title}>Daily Bible Verses + Online Reader</h1>
          <p style={styles.subtitle}>
            Reflect on a fresh verse every day and explore selected Bible passages in one place.
          </p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        <section style={styles.cardSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Verse of the Day</h2>
              <p style={styles.sectionNote}>A daily reminder from Scripture.</p>
            </div>
          </div>

          {verseOfTheDay && (
            <div style={styles.featureCard}>
              <p style={styles.featureText}>{verseOfTheDay.text}</p>
              <p style={styles.featureRef}>{verseOfTheDay.reference}</p>
            </div>
          )}

          <div style={styles.verseGrid}>
            {dailyVerses.map((verse) => (
              <div key={verse.reference} style={styles.verseCard}>
                <p style={styles.verseText}>{verse.text}</p>
                <p style={styles.verseRef}>{verse.reference}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.readerSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Online Bible Reader</h2>
              <p style={styles.sectionNote}>Select a book and chapter to read a passage.</p>
            </div>
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>
              Book
              <select
                style={styles.select}
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
              >
                {books.map((book) => (
                  <option key={book} value={book}>
                    {book}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Chapter
              <select
                style={styles.select}
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              >
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={styles.passageBox}>
            {loadingPassage ? (
              <p style={styles.loading}>Loading passage...</p>
            ) : passage.length > 0 ? (
              passage.map((verse) => (
                <p key={verse.number} style={styles.passageLine}>
                  <span style={styles.verseNumber}>{verse.number}</span>
                  {verse.text}
                </p>
              ))
            ) : (
              <p style={styles.empty}>Select a book and chapter to view the passage.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    color: "#111",
  },
  header: {
    marginBottom: 30,
  },
  bread: {
    margin: 0,
    color: "#6A1B9A",
    fontWeight: 700,
    letterSpacing: "1px",
  },
  title: {
    margin: "10px 0 8px",
    fontSize: "2.25rem",
    lineHeight: 1.1,
    color: "#0F172A",
  },
  subtitle: {
    margin: 0,
    maxWidth: 720,
    color: "#334155",
    fontSize: "1rem",
    lineHeight: 1.75,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 24,
  },
  cardSection: {
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 15px 40px rgba(15, 23, 42, 0.08)",
  },
  readerSection: {
    background: "#faf9ff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 15px 40px rgba(15, 23, 42, 0.06)",
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#1e293b",
  },
  sectionNote: {
    margin: "6px 0 0",
    color: "#475569",
  },
  featureCard: {
    background: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    color: "#111",
    boxShadow: "0 15px 30px rgba(15, 23, 42, 0.1)",
  },
  featureText: {
    margin: 0,
    fontSize: "1.15rem",
    lineHeight: 1.8,
    fontWeight: 600,
  },
  featureRef: {
    marginTop: 14,
    color: "#4338ca",
    fontWeight: 700,
  },
  verseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  verseCard: {
    background: "#f8fafc",
    borderRadius: 18,
    padding: 18,
    minHeight: 140,
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.05)",
  },
  verseText: {
    margin: 0,
    color: "#111827",
    lineHeight: 1.7,
  },
  verseRef: {
    marginTop: 14,
    color: "#7c3aed",
    fontSize: "0.95rem",
    fontWeight: 700,
  },
  formRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontWeight: 600,
    color: "#111827",
    minWidth: 140,
  },
  select: {
    appearance: "none",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#fff",
    minWidth: 180,
    fontSize: "0.95rem",
  },
  passageBox: {
    background: "#fff",
    borderRadius: 20,
    padding: 22,
    minHeight: 260,
    border: "1px solid #e2e8f0",
  },
  passageLine: {
    margin: "0 0 16px",
    lineHeight: 1.75,
    color: "#0f172a",
    fontSize: "1rem",
  },
  verseNumber: {
    display: "inline-block",
    minWidth: 34,
    marginRight: 12,
    color: "#7c3aed",
    fontWeight: 700,
  },
  loading: {
    color: "#475569",
  },
  empty: {
    color: "#64748b",
  },
  error: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    background: "#fee2e2",
    color: "#b91c1c",
  },
};
