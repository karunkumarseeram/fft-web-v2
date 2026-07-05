import api from "./api"; 
// assuming you already have axios instance in api.js

// ================= CREATE FEEDBACK =================
export const createFeedback = async (data) => {
  const res = await api.post("/feedback/", data);
  return res.data;
};


// ================= GET MY FEEDBACK =================
export const getMyFeedback = async () => {
  const res = await api.get("/feedback/my");
  return res.data;
};


// ================= GET SINGLE FEEDBACK =================
export const getFeedbackById = async (id) => {
  const res = await api.get(`/feedback/${id}`);
  return res.data;
};


// ================= ADMIN: GET ALL FEEDBACK =================
export const getAllFeedback = async (skip = 0, limit = 20, status = "") => {
  const res = await api.get("/feedback/admin/all", {
    params: { skip, limit, status },
  });
  return res.data;
};


// ================= ADMIN: REPLY FEEDBACK =================
export const replyFeedback = async (id, data) => {
  const res = await api.post(`/feedback/admin/${id}/reply`, data);
  return res.data;
};


// ================= ADMIN: UPDATE STATUS =================
export const updateFeedbackStatus = async (id, status) => {
  const res = await api.patch(`/feedback/admin/${id}/status`, {
    status,
  });
  return res.data;
};


// ================= ADMIN: DELETE FEEDBACK =================
export const deleteFeedback = async (id) => {
  const res = await api.delete(`/feedback/admin/${id}`);
  return res.data;
};