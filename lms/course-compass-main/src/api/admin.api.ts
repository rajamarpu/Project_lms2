import API from "./client";

export const adminApi = {
  // Dashboard
  getStats: async () => {
    const { data } = await API.get("/admin/stats");
    return data;
  },

  // Users
  getUsers: async () => {
    const { data } = await API.get("/admin/users");
    return data;
  },

  updateUser: async (id: string, payload: { status?: string; role?: string }) => {
    const { data } = await API.put(`/admin/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await API.delete(`/admin/users/${id}`);
    return data;
  },

  // Courses
  getCourses: async () => {
    const { data } = await API.get("/admin/courses");
    return data;
  },

  updateCourse: async (id: string, payload: { status: string }) => {
    const { data } = await API.put(`/admin/courses/${id}`, payload);
    return data;
  },

  deleteCourse: async (id: string) => {
    const { data } = await API.delete(`/admin/courses/${id}`);
    return data;
  },

  // Certificates
  getPendingCertificates: async () => {
    const { data } = await API.get("/admin/certificates/pending");
    return data;
  },

  getApprovedCertificates: async () => {
    const { data } = await API.get("/admin/certificates/approved");
    return data;
  },

  approveCertificate: async (id: string) => {
    const { data } = await API.put(`/admin/certificates/${id}/approve`);
    return data;
  },
};
