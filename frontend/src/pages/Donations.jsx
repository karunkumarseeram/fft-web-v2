import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";

import { VolunteerActivism as DonationIcon } from "@mui/icons-material";
import { QRCode } from "react-qr-code";
import { loadStripe } from "@stripe/stripe-js";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

/* ---------------- STRIPE KEY ---------------- */
const STRIPE_PUBLIC_KEY = "pk_test_...";

/* ---------------- PAYMENT METHODS ---------------- */
const PAYMENT_METHODS = {
  UPI: { label: "UPI (PhonePe / GPay / Paytm)", api: "UPI" },
  CARD_STRIPE: { label: "Card (Stripe)", api: "CARD" },
  CASH: { label: "Bank Transfer / Cash", api: "CASH" }
};

/* ---------------- STYLE ---------------- */
const fontFamily = "'Inter', Arial, sans-serif";

const headerStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "10px",
  padding: "14px",
  borderRadius: "12px",
  background: "linear-gradient(90deg,#ede7f6,#f3e5f5)",
  color: "#4a148c",
  fontWeight: 700,
  fontSize: "12px",
  textTransform: "uppercase",
  fontFamily
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "10px",
  padding: "14px",
  marginTop: "10px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #fffdf5 0%, #fff8e1 50%, #ffecb3 100%)",
  boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
  fontFamily,
  alignItems: "center",
  border: "1px solid rgba(0,0,0,0.08)",
  color: "#1f2937"
};

const statusStyle = (status) => ({
  padding: "6px 10px",
  borderRadius: "8px",
  color: "#fff",
  fontWeight: 700,
  fontSize: "12px",
  textAlign: "center",
  background:
    status === "SUCCESS"
      ? "#2e7d32"
      : status === "PENDING"
      ? "#ff9800"
      : "#e53935"
});

const Donations = () => {
  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  const [formData, setFormData] = useState({
    donor_name: "",
    amount: "",
    payment_method: ""
  });

  const [donations, setDonations] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null); // ✅ ADDED (safe)

  const [filters, setFilters] = useState({
    name: "",
    minAmount: "",
    maxAmount: "",
    method: "ALL",
    status: "ALL"
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    loadData();
    loadBank();

    if (isAdmin) loadStats(); // ✅ ONLY ADMIN

    const params = new URLSearchParams(window.location.search);

    if (params.get("success") === "true") {
      setPaymentSuccess(true);
      setTimeout(() => loadData(), 500);
      window.history.replaceState({}, document.title, "/donations");
    }
  }, []);

  const loadData = async () => {
    const res = await API.get(
      isAdmin ? "/donations" : "/donations/my-donations"
    );
    setDonations(res.data);
  };

  const loadBank = async () => {
    const res = await API.get("/donations/info/bank-details");
    setBankDetails(res.data);
  };

  /* ---------------- ADMIN STATS ---------------- */
  const loadStats = async () => {
    try {
      const res = await API.get("/donations/stats/summary");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- UPI ---------------- */
  const upiLink =
    bankDetails?.upi && formData.amount
      ? `upi://pay?pa=${bankDetails.upi}&pn=Church&am=${formData.amount}&cu=INR`
      : null;

  const isUPI = formData.payment_method === "UPI";

  /* ---------------- STRIPE ---------------- */
  const handleStripe = async () => {
    try {
      setLoading(true);

      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);

      const res = await API.post("/donations/create-stripe-session", {
        donor_name: formData.donor_name,
        amount: formData.amount,
        success_url: window.location.origin + "/donations?success=true",
        cancel_url: window.location.origin + "/donations"
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Stripe failed",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSubmit = async () => {
    try {
      await API.post("/donations", {
        ...formData,
        payment_method:
          PAYMENT_METHODS[formData.payment_method]?.api || "CASH"
      });

      setSnackbar({
        open: true,
        message: "Donation saved",
        severity: "success"
      });

      loadData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error",
        severity: "error"
      });
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredDonations = donations.filter((d) => {
    const nameMatch =
      d.donor_name?.toLowerCase().includes(filters.name.toLowerCase());

    const amount = parseFloat(d.amount || 0);

    const minMatch =
      filters.minAmount === "" || amount >= parseFloat(filters.minAmount);

    const maxMatch =
      filters.maxAmount === "" || amount <= parseFloat(filters.maxAmount);

    const methodMatch =
      filters.method === "ALL" || d.payment_method === filters.method;

    const statusMatch =
      filters.status === "ALL" || d.status === filters.status;

    return nameMatch && minMatch && maxMatch && methodMatch && statusMatch;
  });

  /* ---------------- SUCCESS PAGE ---------------- */
  if (paymentSuccess) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h4" color="success.main">
          🎉 Payment Successful
        </Typography>
        <Button sx={{ mt: 3 }} onClick={() => setPaymentSuccess(false)}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, fontFamily }}>

      <Typography variant="h4" sx={{ mb: 3, color: "#4a148c" }}>
        <DonationIcon /> Donations
      </Typography>

      {/* ================= ADMIN CARDS ================= */}
      {isAdmin && stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>

          <Grid item xs={12} md={4}>
            <Card sx={{ background: "linear-gradient(135deg,#fff8e1,#ffe082)" }}>
              <CardContent>
                <Typography>Total Donations</Typography>
                <Typography variant="h5">
                  {stats.total_donations}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ background: "linear-gradient(135deg,#e8f5e9,#a5d6a7)" }}>
              <CardContent>
                <Typography>Total Amount</Typography>
                <Typography variant="h5">
                  ₹{stats.total_amount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}

      <Grid container spacing={3}>

        {/* FORM */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>

              <TextField
                label="Name"
                fullWidth
                sx={{ mb: 2 }}
                value={formData.donor_name}
                onChange={(e) =>
                  setFormData({ ...formData, donor_name: e.target.value })
                }
              />

              <TextField
                label="Amount"
                fullWidth
                sx={{ mb: 2 }}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                >
                  {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>
                      {v.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* UPI QR */}
              {isUPI && upiLink && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <QRCode value={upiLink} size={150} />
                  <Typography sx={{ fontSize: "13px" }}>
                    Scan UPI QR
                  </Typography>
                </Box>
              )}

              {/* STRIPE BUTTON FIXED */}
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={() =>
                  formData.payment_method === "CARD_STRIPE"
                    ? handleStripe()
                    : handleSubmit()
                }
              >
                Pay Now
              </Button>

            </CardContent>
          </Card>
        </Grid>

        {/* TABLE */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>

              <Typography sx={{ mb: 2, fontWeight: 700 }}>
                All Donations
              </Typography>
                {/* FILTERS */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>

                <TextField
                  size="small"
                  label="Name"
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                />

                <TextField
                  size="small"
                  label="Min ₹"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                />

                <TextField
                  size="small"
                  label="Max ₹"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
  <InputLabel>Status</InputLabel>
  <Select
    value={filters.status}
    label="Status"
    onChange={(e) =>
      setFilters({ ...filters, status: e.target.value })
    }
  >
    <MenuItem value="ALL">All</MenuItem>
    <MenuItem value="SUCCESS">Success</MenuItem>
    <MenuItem value="PENDING">Pending</MenuItem>
    <MenuItem value="FAILED">Failed</MenuItem>
  </Select>
</FormControl>

              </Box>

              {/* HEADER */}
              <Box sx={headerStyle}>
                <div>Name</div>
                <div>Amount</div>
                <div>Method</div>
                <div>Status</div>
              </Box>

              {filteredDonations.map((d) => (
                <Box key={d.id} sx={rowStyle}>
                  <div>{d.donor_name}</div>
                  <div>₹{d.amount}</div>
                  <div>{d.payment_method}</div>
                  <div style={statusStyle(d.status)}>
                    {d.status}
                  </div>
                </Box>
              ))}

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Donations;