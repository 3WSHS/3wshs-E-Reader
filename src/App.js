import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FaBook, FaUpload, FaSearch, FaStar, FaRegStar, FaCheckCircle, FaRegCircle, FaBookmark, FaRegBookmark, FaTimes } from 'react-icons/fa';
import PDFViewer from './components/PDFViewer';
import { pdfjs } from 'react-pdf';
import { set, get, del, keys } from 'idb-keyval';
import NewsCard from './components/NewsCard';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&display=swap');
  body {
    margin: 0;
    padding: 0;
    background-color: #181a20;
    color: #ffffff;
    font-family: 'Montserrat', 'Orbitron', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background: linear-gradient(180deg, #181a20 0%, #101014 100%);
  padding: 32px 0 32px 0;
  border-right: 1.5px solid #23263a;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const SidebarNav = styled.ul`
  list-style: none;
  padding: 0 0 0 24px;
  margin: 0;
`;

const SidebarNavItem = styled.li`
  margin: 18px 0;
  font-size: 1.13rem;
  font-weight: 600;
  color: ${({ active }) => (active ? '#fff' : '#bfc7d5')};
  background: ${({ active }) => (active ? '#23263a' : 'none')};
  border-radius: 8px 0 0 8px;
  padding: 10px 18px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: none;
  border: none;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0 32px 20px 32px;
  overflow-y: auto;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(30, 32, 40, 0.7);
  margin-bottom: 20px;
  border-radius: 18px;
  box-shadow: 0 2px 24px 0 #00c3ff22;
  backdrop-filter: blur(10px);
  transition: background 0.3s, box-shadow 0.3s;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #23263a;
  padding: 8px 16px;
  border-radius: 20px;
  width: 300px;
  input {
    background: none;
    border: none;
    color: white;
    margin-left: 8px;
    width: 100%;
    outline: none;
    font-size: 1rem;
  }
`;

const UploadButton = styled.button`
  background: linear-gradient(90deg, #00c3ff 0%, #007aff 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 0 12px #00c3ff55;
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: linear-gradient(90deg, #007aff 0%, #00c3ff 100%);
    box-shadow: 0 0 24px #00c3ff99;
  }
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
`;

const BookCard = styled.div`
  background: linear-gradient(180deg, #23263a 0%, #181a20 100%);
  border-radius: 18px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border 0.2s;
  box-shadow: 0 2px 16px #00000022;
  border: 2px solid transparent;
  position: relative;
  &:hover {
    transform: translateY(-7px) scale(1.03);
    box-shadow: 0 4px 32px #00000044;
    border: 2px solid #007aff;
    z-index: 2;
  }
`;

const BookCover = styled.div`
  width: 100%;
  height: 250px;
  background-color: #23263a;
  border-radius: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BookTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  color: #fff;
  font-family: 'Montserrat', 'Orbitron', sans-serif;
  letter-spacing: 0.01em;
  font-weight: 700;
`;

const AudioBookCard = styled.div`
  background: linear-gradient(180deg, #23263a 0%, #181a20 100%);
  border-radius: 18px;
  width: 220px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 16px #00000022;
  position: relative;
  margin-bottom: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s, border 0.2s;
  border: 2px solid transparent;
  &:hover, &.active {
    box-shadow: 0 4px 32px #00000044;
    border: 2px solid #007aff;
  }
`;

const AudioBookTitle = styled.div`
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
  margin-top: 16px;
  margin-bottom: 0;
  text-align: center;
  font-family: 'Montserrat', 'Orbitron', sans-serif;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AudioPlayerOverlay = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(24, 26, 32, 0.98);
  border-radius: 0 0 18px 18px;
  padding: 16px 12px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 12px #0008;
`;

const MusicNote = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="32" fill="#23263a" />
    <path d="M44 16V44.5C44 47.5376 41.5376 50 38.5 50C35.4624 50 33 47.5376 33 44.5C33 41.4624 35.4624 39 38.5 39C39.4307 39 40.3082 39.2442 41.0625 39.6719V22H24V44.5C24 47.5376 21.5376 50 18.5 50C15.4624 50 13 47.5376 13 44.5C13 41.4624 15.4624 39 18.5 39C19.4307 39 20.3082 39.2442 21.0625 39.6719V16H44Z" fill="#bfc7d5"/>
  </svg>
);

// Helper to generate a cover image from the first page of a PDF
async function generatePdfCover(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/png');
}

const SIDEBAR_TABS = [
  { key: 'all', label: 'Home Screen' },
  { key: 'allEbooks', label: 'All Ebooks' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'needToRead', label: 'Need to Read' },
  { key: 'finished', label: 'Finished' },
  { key: 'audio', label: 'Audio Books' },
  { key: 'news', label: 'News' },
];

// Example books for preview (not persisted)
const exampleBooks = [
  {
    id: 'example-1',
    title: 'The Great Gatsby',
    cover: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    isExample: true,
    favorite: false,
    needToRead: false,
    finished: false
  },
  {
    id: 'example-2',
    title: 'Moby Dick',
    cover: 'https://covers.openlibrary.org/b/id/8100921-L.jpg',
    isExample: true,
    favorite: false,
    needToRead: false,
    finished: false
  },
  {
    id: 'example-3',
    title: 'Pride and Prejudice',
    cover: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    isExample: true,
    favorite: false,
    needToRead: false,
    finished: false
  }
];

const Banner = styled.div`
  width: 100%;
  padding: 48px 0 40px 0;
  background: linear-gradient(90deg, #181a20 60%, #1a2340 100%);
  border-radius: 28px;
  box-shadow: 0 4px 32px #00000022;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const BannerBokeh = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const BannerTitle = styled.h1`
  color: #fff;
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  letter-spacing: 0.01em;
  text-align: center;
  z-index: 1;
`;

const BannerSubtitle = styled.div`
  color: #bfc7d5;
  font-size: 1.15rem;
  font-weight: 500;
  text-align: center;
  z-index: 1;
`;

const SectionTitle = styled.h2`
  color: #fff;
  font-size: 1.35rem;
  font-weight: 700;
  margin: 36px 0 18px 0;
  letter-spacing: 0.01em;
`;

const PlaceholderCard = styled.div`
  background: linear-gradient(180deg, #23263a 0%, #181a20 100%);
  border-radius: 18px;
  width: 200px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444a5a;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.5;
`;

const NeedToReadGrid = styled(BookGrid)`
  grid-template-columns: repeat(8, 1fr);
`;

function App() {
  const [books, setBooks] = useState(exampleBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [audioBooks, setAudioBooks] = useState([]);
  const [activeAudioId, setActiveAudioId] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsPage, setNewsPage] = useState(0);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const ARTICLES_PER_PAGE = 20;

  // Load books and audio books from IndexedDB on mount
  useEffect(() => {
    async function loadBooks() {
      const allKeys = await keys();
      const loadedBooks = [];
      const loadedAudioBooks = [];
      for (const key of allKeys) {
        if (typeof key === 'string' && key.startsWith('book-')) {
          const book = await get(key);
          if (book && book.file) {
            book.url = URL.createObjectURL(book.file);
          }
          loadedBooks.push(book);
        }
        if (typeof key === 'string' && key.startsWith('audio-')) {
          const audio = await get(key);
          if (audio && audio.file) {
            audio.url = URL.createObjectURL(audio.file);
          }
          loadedAudioBooks.push(audio);
        }
      }
      setBooks(loadedBooks.length > 0 ? loadedBooks : exampleBooks);
      setAudioBooks(loadedAudioBooks);
    }
    loadBooks();
  }, []);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('playlists');
    if (stored) {
      try {
        setPlaylists(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Save or update a book in IndexedDB
  const saveBookToDB = async (book) => {
    await set(`book-${book.id}`, book);
  };

  // Remove a book from IndexedDB
  const deleteBookFromDB = async (bookId) => {
    await del(`book-${bookId}`);
  };

  // Save or update an audio book in IndexedDB
  const saveAudioBookToDB = async (audioBook) => {
    await set(`audio-${audioBook.id}`, audioBook);
  };

  // Remove an audio book from IndexedDB
  const deleteAudioBookFromDB = async (audioId) => {
    await del(`audio-${audioId}`);
  };

  const handleFileUpload = async (event) => {
    setUploading(true);
    const files = Array.from(event.target.files);
    const newBooks = await Promise.all(files.map(async file => {
      let cover = null;
      try {
        cover = await generatePdfCover(file);
      } catch (e) {
        cover = null;
      }
      const book = {
        id: Date.now() + Math.random(),
        title: file.name,
        file,
        cover,
        favorite: false,
        needToRead: false,
        finished: false,
        isExample: false
      };
      await saveBookToDB(book);
      return book;
    }));
    setBooks(prevBooks => [...prevBooks.filter(b => !b.isExample), ...newBooks]);
    setUploading(false);
  };

  const handleAudioUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newAudioBooks = await Promise.all(files.map(async file => {
      const audioBook = {
        id: Date.now() + Math.random(),
        title: file.name,
        file,
        url: URL.createObjectURL(file),
      };
      await saveAudioBookToDB(audioBook);
      return audioBook;
    }));
    setAudioBooks(prev => [...prev, ...newAudioBooks]);
  };

  const handleBookClick = (book) => {
    if (book.isExample) return; // Don't open viewer for example books
    setSelectedBook(book);
  };

  const toggleBookProp = (bookId, prop) => {
    setBooks(books => books.map(book => {
      if (book.id === bookId) {
        const updated = { ...book, [prop]: !book[prop] };
        if (!updated.isExample) saveBookToDB(updated);
        return updated;
      }
      return book;
    }));
  };

  const handleDeleteBook = (bookId) => {
    setBooks(books => books.filter(book => book.id !== bookId));
    deleteBookFromDB(bookId);
  };

  const handleDeleteAudioBook = (audioId) => {
    setAudioBooks(audios => audios.filter(a => a.id !== audioId));
    deleteAudioBookFromDB(audioId);
  };

  // Filtering logic for tabs
  const filterByTab = (book) => {
    if (activeTab === 'favorites') return book.favorite;
    if (activeTab === 'needToRead') return book.needToRead;
    if (activeTab === 'finished') return book.finished;
    return true;
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) && filterByTab(book)
  );

  const isAudioTab = activeTab === 'audio';

  const toggleAudioBookProp = (audioId, prop) => {
    setAudioBooks(audios => audios.map(audio => {
      if (audio.id === audioId) {
        const updated = { ...audio, [prop]: !audio[prop] };
        saveAudioBookToDB(updated);
        return updated;
      }
      return audio;
    }));
  };

  // Function to add a new playlist
  const handleAddPlaylist = () => {
    if (newPlaylistName.trim() === "") return;
    setPlaylists(prev => [
      ...prev,
      { id: Date.now() + Math.random(), name: newPlaylistName.trim(), bookIds: [] }
    ]);
    setNewPlaylistName("");
  };

  // Open modal for a playlist
  const openEditPlaylist = (playlist) => {
    setEditingPlaylistId(playlist.id);
    setSelectedBookIds(playlist.bookIds || []);
  };

  // Save selected ebooks to playlist
  const handleSavePlaylistBooks = () => {
    setPlaylists(prev => prev.map(pl =>
      pl.id === editingPlaylistId ? { ...pl, bookIds: selectedBookIds } : pl
    ));
    setEditingPlaylistId(null);
    setSelectedBookIds([]);
  };

  // Update the useEffect for fetching news
  useEffect(() => {
    if (activeTab !== 'news') return;
    async function fetchNews() {
      const topIds = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(r => r.json());
      const start = newsPage * ARTICLES_PER_PAGE;
      const end = start + ARTICLES_PER_PAGE;
      const pageIds = topIds.slice(start, end);
      if (pageIds.length === 0) {
        setHasMoreNews(false);
        return;
      }
      const articles = await Promise.all(
        pageIds.map(async id => {
          const story = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json());
          return story;
        })
      );
      setNewsArticles(prev => newsPage === 0 ? articles : [...prev, ...articles]);
      setHasMoreNews(end < topIds.length);
    }
    fetchNews();
  }, [activeTab, newsPage]);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Sidebar>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', marginLeft: 24, marginBottom: 24, letterSpacing: 0.01 }}>Library</h2>
          <nav>
            <SidebarNav>
              {SIDEBAR_TABS.map(tab => (
                <SidebarNavItem
                  key={tab.key}
                  $active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </SidebarNavItem>
              ))}
            </SidebarNav>
          </nav>
        </Sidebar>
        <MainContent>
          <Banner>
            <BannerBokeh>
              <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="80" r="60" fill="#007aff" fillOpacity="0.18" />
                <circle cx="400" cy="120" r="40" fill="#00c3ff" fillOpacity="0.12" />
                <circle cx="900" cy="60" r="80" fill="#007aff" fillOpacity="0.13" />
                <circle cx="1100" cy="160" r="50" fill="#00c3ff" fillOpacity="0.10" />
              </svg>
            </BannerBokeh>
            <BannerTitle>Welcome To Your E-Reader</BannerTitle>
            <BannerSubtitle>A futuristic home for your books and audio books</BannerSubtitle>
          </Banner>
          <TopBar>
            <SearchBar>
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isAudioTab}
              />
            </SearchBar>
            {isAudioTab ? (
              <label htmlFor="audio-upload" style={{ cursor: 'pointer' }}>
                <UploadButton as="span">
                  <FaUpload />
                  Upload Audio Book
                  <input
                    type="file"
                    accept="audio/mp3"
                    multiple
                    onChange={handleAudioUpload}
                    style={{ display: 'none' }}
                    id="audio-upload"
                  />
                </UploadButton>
              </label>
            ) : (
              <label htmlFor="file-upload" style={{ cursor: isAudioTab ? 'not-allowed' : 'pointer' }}>
                <UploadButton as="span" disabled={isAudioTab} style={isAudioTab ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                  <FaUpload />
                  {uploading ? 'Uploading...' : 'Upload E-Book'}
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                    disabled={isAudioTab}
                  />
                </UploadButton>
              </label>
            )}
          </TopBar>
          {isAudioTab ? (
            <div style={{ color: '#fff', fontSize: 24, textAlign: 'center', marginTop: 40 }}>
              <div style={{ fontSize: 20, marginBottom: 24 }}>Audio Books</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
                {audioBooks.length === 0 && <div style={{ color: '#aaa', fontSize: 18 }}>No audio books uploaded yet.</div>}
                {audioBooks.map(audio => (
                  <AudioBookCard
                    key={audio.id}
                    className={activeAudioId === audio.id ? 'active' : ''}
                    onMouseEnter={() => setActiveAudioId(audio.id)}
                    onMouseLeave={() => setActiveAudioId(null)}
                    onClick={() => setActiveAudioId(audio.id)}
                  >
                    <span
                      title="Delete"
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 2,
                        background: 'rgba(30,30,30,0.85)',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        boxShadow: '0 1px 4px #0002',
                        transition: 'background 0.2s',
                      }}
                      onClick={e => { e.stopPropagation(); handleDeleteAudioBook(audio.id); }}
                    >
                      <FaTimes size={16} />
                    </span>
                    <div style={{ marginTop: 8 }}><MusicNote /></div>
                    <AudioBookTitle>{audio.title}</AudioBookTitle>
                    {activeAudioId === audio.id && (
                      <AudioPlayerOverlay>
                        <audio controls autoPlay src={audio.url} style={{ width: '100%' }} />
                      </AudioPlayerOverlay>
                    )}
                  </AudioBookCard>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'all' && (
                <>
                  <SectionTitle>Recently Added</SectionTitle>
                  {(() => {
                    const totalSlots = 8;
                    const placeholders = totalSlots - filteredBooks.length;
                    return (
                      <BookGrid>
                        {filteredBooks.map(book => (
                          <BookCard key={book.id} onClick={() => handleBookClick(book)} style={{ opacity: book.isExample ? 0.7 : 1, position: 'relative' }}>
                            {!book.isExample && (
                              <span
                                title="Delete"
                                style={{
                                  position: 'absolute',
                                  top: 10,
                                  left: 10,
                                  zIndex: 2,
                                  background: 'rgba(30,30,30,0.85)',
                                  borderRadius: '50%',
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#fff',
                                  boxShadow: '0 1px 4px #0002',
                                  transition: 'background 0.2s',
                                }}
                                onClick={e => { e.stopPropagation(); handleDeleteBook(book.id); }}
                              >
                                <FaTimes size={16} />
                              </span>
                            )}
                            <BookCover>
                              {book.cover ? (
                                <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                              ) : (
                                <FaBook size={40} />
                              )}
                            </BookCover>
                            <BookTitle>{book.title}</BookTitle>
                            {book.isExample && <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Example</div>}
                            {!book.isExample && (
                              <div style={{ display: 'flex', gap: 8, position: 'absolute', top: 10, right: 10 }}>
                                <span title="Favorite" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleBookProp(book.id, 'favorite'); }}>
                                  {book.favorite ? <FaStar color="#FFD700" /> : <FaRegStar color="#fff" />}
                                </span>
                                <span title="Need to Read" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleBookProp(book.id, 'needToRead'); }}>
                                  {book.needToRead ? <FaBookmark color="#007AFF" /> : <FaRegBookmark color="#fff" />}
                                </span>
                                <span title="Finished" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleBookProp(book.id, 'finished'); }}>
                                  {book.finished ? <FaCheckCircle color="#4CAF50" /> : <FaRegCircle color="#fff" />}
                                </span>
                              </div>
                            )}
                          </BookCard>
                        ))}
                        {Array.from({ length: placeholders > 0 ? placeholders : 0 }).map((_, i) => (
                          <PlaceholderCard key={i}>
                            <FaBook size={40} style={{ opacity: 0.3 }} />
                          </PlaceholderCard>
                        ))}
                      </BookGrid>
                    );
                  })()}
                  <SectionTitle>Need to Read</SectionTitle>
                  <BookGrid style={{ marginTop: 0 }}>
                    {books.filter(b => b.needToRead).slice(0, 5).map(book => (
                      <BookCard key={book.id} style={{ opacity: book.isExample ? 0.7 : 1, position: 'relative' }}>
                        <BookCover>
                          {book.cover ? (
                            <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                          ) : (
                            <FaBook size={40} />
                          )}
                        </BookCover>
                        <BookTitle>{book.title}</BookTitle>
                      </BookCard>
                    ))}
                    {Array.from({ length: 5 - books.filter(b => b.needToRead).length }).map((_, i) => (
                      <PlaceholderCard key={i}>
                        <FaBook size={40} style={{ opacity: 0.3 }} />
                      </PlaceholderCard>
                    ))}
                  </BookGrid>
                  <SectionTitle>Audio Books</SectionTitle>
                  {(() => {
                    const totalSlots = 8;
                    const placeholders = totalSlots - audioBooks.length;
                    return (
                      <NeedToReadGrid style={{ marginTop: 0 }}>
                        {audioBooks.map(audio => (
                          <BookCard key={audio.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <BookCover style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                              <MusicNote />
                            </BookCover>
                            <BookTitle style={{ textAlign: 'center', fontSize: '1rem', marginTop: 12 }}>{audio.title}</BookTitle>
                            <audio controls src={audio.url} style={{ width: '90%', marginTop: 8 }} />
                            <span
                              title="Delete"
                              style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                zIndex: 2,
                                background: 'rgba(30,30,30,0.85)',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff',
                                boxShadow: '0 1px 4px #0002',
                                transition: 'background 0.2s',
                              }}
                              onClick={e => { e.stopPropagation(); handleDeleteAudioBook(audio.id); }}
                            >
                              <FaTimes size={16} />
                            </span>
                            <div style={{ display: 'flex', gap: 8, position: 'absolute', top: 10, right: 10 }}>
                              <span title="Favorite" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleAudioBookProp(audio.id, 'favorite'); }}>
                                {audio.favorite ? <FaStar color="#FFD700" /> : <FaRegStar color="#fff" />}
                              </span>
                              <span title="Need to Read" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleAudioBookProp(audio.id, 'needToRead'); }}>
                                {audio.needToRead ? <FaBookmark color="#007AFF" /> : <FaRegBookmark color="#fff" />}
                              </span>
                            </div>
                          </BookCard>
                        ))}
                        {Array.from({ length: placeholders > 0 ? placeholders : 0 }).map((_, i) => (
                          <PlaceholderCard key={i}>
                            <MusicNote />
                          </PlaceholderCard>
                        ))}
                      </NeedToReadGrid>
                    );
                  })()}
                  <SectionTitle>Favorites</SectionTitle>
                  {(() => {
                    const favoriteBooks = books.filter(b => b.favorite);
                    const favoriteAudio = audioBooks.filter(a => a.favorite);
                    const favoriteTotal = favoriteBooks.length + favoriteAudio.length;
                    const favoritePlaceholders = 8 - favoriteTotal;
                    return (
                      <NeedToReadGrid style={{ marginTop: 0 }}>
                        {favoriteBooks.map(book => (
                          <BookCard key={book.id} onClick={() => handleBookClick(book)} style={{ opacity: book.isExample ? 0.7 : 1, position: 'relative' }}>
                            <BookCover>
                              {book.cover ? (
                                <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                              ) : (
                                <FaBook size={40} />
                              )}
                            </BookCover>
                            <BookTitle>{book.title}</BookTitle>
                          </BookCard>
                        ))}
                        {favoriteAudio.map(audio => (
                          <BookCard key={audio.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <BookCover style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                              <MusicNote />
                            </BookCover>
                            <BookTitle style={{ textAlign: 'center', fontSize: '1rem', marginTop: 12 }}>{audio.title}</BookTitle>
                            <audio controls src={audio.url} style={{ width: '90%', marginTop: 8 }} />
                            <span
                              title="Delete"
                              style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                zIndex: 2,
                                background: 'rgba(30,30,30,0.85)',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff',
                                boxShadow: '0 1px 4px #0002',
                                transition: 'background 0.2s',
                              }}
                              onClick={e => { e.stopPropagation(); handleDeleteAudioBook(audio.id); }}
                            >
                              <FaTimes size={16} />
                            </span>
                            <div style={{ display: 'flex', gap: 8, position: 'absolute', top: 10, right: 10 }}>
                              <span title="Favorite" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleAudioBookProp(audio.id, 'favorite'); }}>
                                {audio.favorite ? <FaStar color="#FFD700" /> : <FaRegStar color="#fff" />}
                              </span>
                              <span title="Need to Read" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleAudioBookProp(audio.id, 'needToRead'); }}>
                                {audio.needToRead ? <FaBookmark color="#007AFF" /> : <FaRegBookmark color="#fff" />}
                              </span>
                            </div>
                          </BookCard>
                        ))}
                        {Array.from({ length: favoritePlaceholders > 0 ? favoritePlaceholders : 0 }).map((_, i) => (
                          <PlaceholderCard key={i}>
                            <FaBook size={40} style={{ opacity: 0.3 }} />
                          </PlaceholderCard>
                        ))}
                      </NeedToReadGrid>
                    );
                  })()}
                </>
              )}
              {activeTab === 'allEbooks' && (
                <>
                  <SectionTitle>All Ebooks</SectionTitle>
                  <BookGrid>
                    {books.map(book => (
                      <BookCard key={book.id} onClick={() => handleBookClick(book)} style={{ opacity: book.isExample ? 0.7 : 1, position: 'relative' }}>
                        {!book.isExample && (
                          <span
                            title="Delete"
                            style={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              zIndex: 2,
                              background: 'rgba(30,30,30,0.85)',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: '#fff',
                              boxShadow: '0 1px 4px #0002',
                              transition: 'background 0.2s',
                            }}
                            onClick={e => { e.stopPropagation(); handleDeleteBook(book.id); }}
                          >
                            <FaTimes size={16} />
                          </span>
                        )}
                        <BookCover>
                          {book.cover ? (
                            <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                          ) : (
                            <FaBook size={40} />
                          )}
                        </BookCover>
                        <BookTitle>{book.title}</BookTitle>
                        {book.isExample && <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>Example</div>}
                        {!book.isExample && (
                          <div style={{ display: 'flex', gap: 8, position: 'absolute', top: 10, right: 10 }}>
                            <span title="Favorite" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleBookProp(book.id, 'favorite'); }}>
                              {book.favorite ? <FaStar color="#FFD700" /> : <FaRegStar color="#fff" />}
                            </span>
                            <span title="Need to Read" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleBookProp(book.id, 'needToRead'); }}>
                              {book.needToRead ? <FaBookmark color="#007AFF" /> : <FaRegBookmark color="#fff" />}
                            </span>
                            <span title="Finished" style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggleBookProp(book.id, 'finished'); }}>
                              {book.finished ? <FaCheckCircle color="#4CAF50" /> : <FaRegCircle color="#fff" />}
                            </span>
                          </div>
                        )}
                      </BookCard>
                    ))}
                  </BookGrid>
                </>
              )}
              {activeTab === 'news' && (
                <>
                  <SectionTitle>News</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginTop: 24 }}>
                    {newsArticles.length === 0 ? (
                      <div style={{ color: '#aaa', fontSize: 18 }}>Loading news...</div>
                    ) : (
                      <>
                        {newsArticles.map(article => (
                          <NewsCard key={article.id} article={article} />
                        ))}
                        {hasMoreNews && (
                          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                            <button
                              onClick={() => setNewsPage(prev => prev + 1)}
                              style={{
                                padding: '12px 24px',
                                borderRadius: 8,
                                background: 'linear-gradient(90deg, #00c3ff 0%, #007aff 100%)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: 16,
                                boxShadow: '0 2px 12px #00c3ff55',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                              }}
                            >
                              Load More Articles
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'genres' && (
                <>
                  <SectionTitle>Genres</SectionTitle>
                  <div style={{ marginBottom: 24 }}>
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      placeholder="New playlist name"
                      style={{ padding: 8, borderRadius: 6, border: '1px solid #333', marginRight: 8, background: '#23263a', color: '#fff' }}
                    />
                    <button
                      onClick={handleAddPlaylist}
                      style={{ padding: '8px 18px', borderRadius: 6, background: '#007aff', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Add Playlist
                    </button>
                  </div>
                  <div>
                    {playlists.length === 0 ? (
                      <div style={{ color: '#aaa', fontSize: 18 }}>No playlists yet.</div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {playlists.map(pl => (
                          <li
                            key={pl.id}
                            onClick={() => setSelectedPlaylistId(pl.id)}
                            style={{
                              color: '#fff',
                              fontSize: 18,
                              marginBottom: 10,
                              background: selectedPlaylistId === pl.id ? '#2a3a5a' : '#23263a',
                              borderRadius: 8,
                              padding: '10px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              border: selectedPlaylistId === pl.id ? '2px solid #007aff' : 'none',
                              boxShadow: selectedPlaylistId === pl.id ? '0 0 8px #007aff55' : 'none',
                              transition: 'background 0.2s, border 0.2s',
                            }}
                          >
                            <span>{pl.name} <span style={{ color: '#aaa', fontSize: 15 }}>({pl.bookIds.length} ebooks)</span></span>
                            <button
                              onClick={e => { e.stopPropagation(); openEditPlaylist(pl); }}
                              style={{ marginLeft: 16, padding: '6px 14px', borderRadius: 6, background: '#00c3ff', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                            >
                              Add Ebooks
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Show books in selected playlist */}
                  {selectedPlaylistId && (() => {
                    const playlist = playlists.find(pl => pl.id === selectedPlaylistId);
                    const playlistBooks = books.filter(book => playlist.bookIds.includes(book.id));
                    return (
                      <div style={{ marginTop: 32 }}>
                        <SectionTitle style={{ fontSize: '1.1rem', margin: '0 0 18px 0' }}>Books in "{playlist.name}"</SectionTitle>
                        {playlistBooks.length === 0 ? (
                          <div style={{ color: '#aaa', fontSize: 16 }}>No ebooks in this playlist yet.</div>
                        ) : (
                          <BookGrid>
                            {playlistBooks.map(book => (
                              <BookCard key={book.id} onClick={() => handleBookClick(book)} style={{ opacity: book.isExample ? 0.7 : 1, position: 'relative' }}>
                                <BookCover>
                                  {book.cover ? (
                                    <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                  ) : (
                                    <FaBook size={40} />
                                  )}
                                </BookCover>
                                <BookTitle>{book.title}</BookTitle>
                              </BookCard>
                            ))}
                          </BookGrid>
                        )}
                      </div>
                    );
                  })()}
                  {/* Modal for selecting ebooks */}
                  {editingPlaylistId && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{ background: '#23263a', borderRadius: 12, padding: 32, minWidth: 340, color: '#fff', boxShadow: '0 4px 32px #0008' }}>
                        <h3 style={{ marginTop: 0 }}>Select Ebooks</h3>
                        <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 18 }}>
                          {books.length === 0 ? (
                            <div style={{ color: '#aaa' }}>No ebooks available.</div>
                          ) : (
                            books.map(book => (
                              <label key={book.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedBookIds.includes(book.id)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedBookIds(ids => [...ids, book.id]);
                                    } else {
                                      setSelectedBookIds(ids => ids.filter(id => id !== book.id));
                                    }
                                  }}
                                  style={{ marginRight: 10 }}
                                />
                                <span>{book.title}</span>
                              </label>
                            ))
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                          <button onClick={() => { setEditingPlaylistId(null); setSelectedBookIds([]); }} style={{ padding: '7px 18px', borderRadius: 6, background: '#333', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                          <button onClick={handleSavePlaylistBooks} style={{ padding: '7px 18px', borderRadius: 6, background: '#007aff', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </MainContent>
      </AppContainer>
      {selectedBook && (
        <PDFViewer
          file={selectedBook.file}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  );
}

export default App;
