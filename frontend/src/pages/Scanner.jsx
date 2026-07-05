import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  FlashlightOn as FlashlightIcon,
  FlashlightOff as FlashlightOffIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Scanner = () => {
  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [flashlight, setFlashlight] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadEvents();
    return () => {
      stopCamera();
    };
  }, []);

  const loadEvents = async () => {
    try {
      const response = await API.get('/events');
      const upcomingEvents = response.data.filter(event =>
        new Date(event.event_date) >= new Date()
      );
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadAttendance = async (eventId) => {
    if (!eventId) return;
    try {
      const response = await API.get(`/events/${eventId}/attendance`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendance([]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setSnackbar({
        open: true,
        message: 'Unable to access camera. Please check permissions.',
        severity: 'error'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const toggleFlashlight = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlight }]
        });
        setFlashlight(!flashlight);
      } else {
        setSnackbar({
          open: true,
          message: 'Flashlight not supported on this device',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      setSnackbar({
        open: true,
        message: 'Unable to toggle flashlight',
        severity: 'error'
      });
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return context.getImageData(0, 0, canvas.width, canvas.height);
  };

  const scanQRCode = async () => {
    if (!scanning || !selectedEvent) {
      setSnackbar({
        open: true,
        message: 'Please select an event and start scanning first',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const imageData = captureFrame();
      if (!imageData) {
        throw new Error('Unable to capture frame');
      }

      // Convert image data to base64 for API
      const canvas = canvasRef.current;
      const base64Image = canvas.toDataURL('image/png').split(',')[1];

      const response = await API.post('/scanner/scan', {
        image: base64Image,
        event_id: selectedEvent
      });

      setScanResult(response.data);
      setSnackbar({
        open: true,
        message: 'Check-in successful!',
        severity: 'success'
      });

      // Reload attendance
      loadAttendance(selectedEvent);

    } catch (error) {
      console.error('Error scanning QR code:', error);
      setScanResult({
        success: false,
        message: error.response?.data?.detail || 'Failed to scan QR code'
      });
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to scan QR code',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (type, id) => {
    try {
      const response = await API.post('/scanner/generate-qr', {
        type,
        id
      });
      setQrData(response.data);
      setShowQRDialog(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate QR code',
        severity: 'error'
      });
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    loadAttendance(eventId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
        <ScannerIcon fontSize="large" />
        Church Scanner
      </Typography>

      <Grid container spacing={3}>
        {/* Scanner Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScannerIcon />
                QR Code Scanner
              </Typography>

              {/* Event Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Event</InputLabel>
                <Select
                  value={selectedEvent}
                  onChange={(e) => handleEventChange(e.target.value)}
                  label="Select Event"
                >
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(event.event_date)} at {formatTime(event.event_date)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Camera View */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    display: scanning ? 'block' : 'none'
                  }}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {!scanning && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '300px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <ScannerIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Camera Ready
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Start Scanning" to begin
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Control Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {!scanning ? (
                  <Button
                    variant="contained"
                    startIcon={<ScannerIcon />}
                    onClick={startCamera}
                    disabled={!selectedEvent}
                    fullWidth
                  >
                    Start Scanning
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={stopCamera}
                      fullWidth
                    >
                      Stop Scanning
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={flashlight ? <FlashlightOffIcon /> : <FlashlightIcon />}
                      onClick={toggleFlashlight}
                    >
                      {flashlight ? 'Flash Off' : 'Flash On'}
                    </Button>
                  </>
                )}
              </Box>

              {scanning && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={scanQRCode}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
                  fullWidth
                >
                  {loading ? 'Scanning...' : 'Scan QR Code'}
                </Button>
              )}

              {/* Scan Result */}
              {scanResult && (
                <Alert
                  severity={scanResult.success ? 'success' : 'error'}
                  sx={{ mt: 2 }}
                  icon={scanResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {scanResult.message}
                  </Typography>
                  {scanResult.member && (
                    <Typography variant="caption" display="block">
                      Member: {scanResult.member.name} ({scanResult.member.phone})
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                Attendance ({attendance.length})
              </Typography>

              {selectedEvent ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {attendance.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No attendees yet
                    </Typography>
                  ) : (
                    attendance.map((attendee, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {attendee.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={attendee.name}
                          secondary={attendee.phone}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label="Checked In"
                            color="success"
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Select an event to view attendance
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Generation Section */}
      {isAdmin && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeIcon />
              Generate QR Codes
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Event QR Codes
                </Typography>
                <List>
                  {events.slice(0, 3).map((event) => (
                    <ListItem key={event.id}>
                      <ListItemText
                        primary={event.title}
                        secondary={formatDate(event.event_date)}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<QrCodeIcon />}
                        onClick={() => generateQRCode('event', event.id)}
                      >
                        Generate
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Member QR Codes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  QR codes for members can be generated from the Members page
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  onClick={() => window.location.href = '/members'}
                  sx={{ mt: 1 }}
                >
                  Go to Members
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* QR Code Display Dialog */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          {qrData && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <img
                src={`data:image/png;base64,${qrData.qr_code}`}
                alt="QR Code"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Typography variant="body2" sx={{ mt: 2, wordBreak: 'break-all' }}>
                Data: {qrData.data}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Close</Button>
          {qrData && (
            <Button
              variant="contained"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:image/png;base64,${qrData.qr_code}`;
                link.download = 'qr-code.png';
                link.click();
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Scanner;