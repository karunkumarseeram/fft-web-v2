import { useEffect, useState } from "react";
import API from "../services/api";
import { Button, Card, CardContent, Typography } from "@mui/material";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const res = await API.get("/admin/pending-users");
    setUsers(res.data);
  };

  const approveUser = async (id) => {
    await API.put(`/admin/approve/${id}`);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h2>Pending Members</h2>

      {users.map((u) => (
        <Card key={u.id} style={{ margin: 10 }}>
          <CardContent>
            <Typography>{u.name}</Typography>
            <Typography>{u.email}</Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => approveUser(u.id)}
            >
              Approve
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}