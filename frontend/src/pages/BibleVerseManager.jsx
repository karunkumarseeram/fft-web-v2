import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Pagination,
  InputAdornment,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Book as BookIcon
} from '@mui/icons-material';
import api from '../services/api';

const BibleVerseManager = () => {
  const [verses, setVerses] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVerse, setEditingVerse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    book: '',
    chapter: '',
    verse_number: '',
    text_en: '',
    text_te: '',
    is_daily: false
  });

  useEffect(() => {
    loadBooks();
    loadVerses();
  }, [page, selectedBook, selectedChapter]);

  const loadBooks = async () => {
    try {
      const response = await api.get('/bible/books');
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const loadVerses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: ((page - 1) * 50).toString(),
        limit: '50'
      });

      if (selectedBook) params.append('book', selectedBook);
      if (selectedChapter) params.append('chapter', selectedChapter);

      const response = await api.get(`/bible/verses?${params}`);
      setVerses(response.data);
      setTotalPages(Math.ceil(response.data.length / 50)); // Approximate pagination
    } catch (error) {
      console.error('Error loading verses:', error);
      setSnackbar({ open: true, message: 'Error loading verses', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (verse = null) => {
    if (verse) {
      setEditingVerse(verse);
      setFormData({
        book: verse.book,
        chapter: verse.chapter,
        verse_number: verse.verse_number,
        text_en: verse.text_en,
        text_te: verse.text_te || '',
        is_daily: verse.is_daily
      });
    } else {
      setEditingVerse(null);
      setFormData({
        book: '',
        chapter: '',
        verse_number: '',
        text_en: '',
        text_te: '',
        is_daily: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVerse(null);
    setFormData({
      book: '',
      chapter: '',
      verse_number: '',
      text_en: '',
      text_te: '',
      is_daily: false
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        chapter: parseInt(formData.chapter),
        verse_number: parseInt(formData.verse_number)
      };

      if (editingVerse) {
        await api.put(`/bible/verses/${editingVerse.id}`, data);
        setSnackbar({ open: true, message: 'Verse updated successfully', severity: 'success' });
      } else {
        await api.post('/bible/verses', data);
        setSnackbar({ open: true, message: 'Verse created successfully', severity: 'success' });
      }

      handleCloseDialog();
      loadVerses();
    } catch (error) {
      console.error('Error saving verse:', error);
      const message = error.response?.data?.detail || 'Error saving verse';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleDelete = async (verseId) => {
    if (!window.confirm('Are you sure you want to delete this verse?')) return;

    try {
      await api.delete(`/bible/verses/${verseId}`);
      setSnackbar({ open: true, message: 'Verse deleted successfully', severity: 'success' });
      loadVerses();
    } catch (error) {
      console.error('Error deleting verse:', error);
      setSnackbar({ open: true, message: 'Error deleting verse', severity: 'error' });
    }
  };

  const filteredVerses = verses.filter(verse => {
    const matchesSearch = searchTerm === '' ||
      verse.text_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verse.book.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BookIcon />
        Bible Verse Manager
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search verses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Book</InputLabel>
                <Select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  label="Book"
                >
                  <MenuItem value="">All Books</MenuItem>
                  {books.map((book) => (
                    <MenuItem key={book} value={book}>{book}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Chapter"
                type="number"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                Add New Verse
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBook('');
                  setSelectedChapter('');
                  setPage(1);
                  loadVerses();
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Verses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>English Text</TableCell>
              <TableCell>Telugu Text</TableCell>
              <TableCell>Daily Verse</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredVerses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No verses found</TableCell>
              </TableRow>
            ) : (
              filteredVerses.map((verse) => (
                <TableRow key={verse.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {verse.book} {verse.chapter}:{verse.verse_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {verse.text_en}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {verse.text_te || 'Not available'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {verse.is_daily && <Chip label="Daily" color="primary" size="small" />}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(verse)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(verse.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVerse ? 'Edit Bible Verse' : 'Add New Bible Verse'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Book</InputLabel>
                <Select
                  value={formData.book}
                  onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                  label="Book"
                >
                  {books.map((book) => (
                    <MenuItem key={book} value={book}>{book}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Chapter"
                type="number"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Verse Number"
                type="number"
                value={formData.verse_number}
                onChange={(e) => setFormData({ ...formData, verse_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="English Text"
                multiline
                rows={3}
                value={formData.text_en}
                onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telugu Text (Optional)"
                multiline
                rows={3}
                value={formData.text_te}
                onChange={(e) => setFormData({ ...formData, text_te: e.target.value })}
                placeholder="Enter Telugu translation if available"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Daily Verse</InputLabel>
                <Select
                  value={formData.is_daily}
                  onChange={(e) => setFormData({ ...formData, is_daily: e.target.value })}
                  label="Daily Verse"
                >
                  <MenuItem value={false}>No</MenuItem>
                  <MenuItem value={true}>Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.book || !formData.chapter || !formData.verse_number || !formData.text_en}
          >
            {editingVerse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BibleVerseManager;