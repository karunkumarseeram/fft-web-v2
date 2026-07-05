import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Pagination,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RevokeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Members() {
  const { userRole, token } = useContext(AuthContext);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // items per page

  // 🔹 Load members with pagination
  const loadMembers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/members?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.members);
      setTotalPages(Math.ceil(res.data.total / limit));
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "ADMIN") loadMembers(page);
  }, [userRole, page]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/members/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMembers(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await API.put(`/admin/members/${id}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMembers(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "PASTOR":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <AdminIcon fontSize="small" />;
      case "PASTOR":
        return <PersonIcon fontSize="small" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant="h6" color="text.secondary">Loading members...</Typography>
      </Box>
    );
  }

  if (userRole !== "ADMIN") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant="h5" color="error" sx={{ textAlign: 'center' }}>
          Access Denied
          <br />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Only administrators can view this page
          </Typography>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 30 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Church Members Management
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage church members, approve new registrations, and oversee member status.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Member Details
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Contact Information
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary">
                        No members found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member, index) => (
                    <TableRow
                      key={member.id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {(page - 1) * limit + index + 1}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {member.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{member.email}</Typography>
                          </Box>
                          {member.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{member.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getRoleIcon(member.role || "MEMBER")}
                          label={member.role || "MEMBER"}
                          color={getRoleColor(member.role || "MEMBER")}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={member.is_approved ? "Approved" : "Pending"}
                          color={member.is_approved ? "success" : "warning"}
                          size="small"
                          variant={member.is_approved ? "filled" : "outlined"}
                        />
                      </TableCell>

                      <TableCell>
                        {!member.is_approved ? (
                          <Tooltip title="Approve Member">
                            <IconButton
                              color="success"
                              onClick={() => handleApprove(member.id)}
                              sx={{ mr: 1 }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Revoke Approval">
                            <IconButton
                              color="error"
                              onClick={() => handleRevoke(member.id)}
                            >
                              <RevokeIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}