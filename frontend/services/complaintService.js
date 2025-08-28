import axiosInstance from './axiosInstance';

export const registerComplaint = async (complaintData) => {
  try {
    const response = await axiosInstance.post('/api/complaints/register', complaintData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getComplaintHistory = async () => {
  try {
    const response = await axiosInstance.get('/api/complaints/history');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const trackComplaint = async (complaintNumber) => {
  try {
    const response = await axiosInstance.get(`/api/complaints/track/${complaintNumber}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentComplaints = async () => {
  try {
    const response = await axiosInstance.get('/api/departments/complaints');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateComplaintStatus = async (complaintNumber, updateData) => {
  try {
    const response = await axiosInstance.put(`/api/departments/complaints/${complaintNumber}/status`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatMessages = async (complaintNumber) => {
  try {
    const response = await axiosInstance.get(`/api/complaints/${complaintNumber}/chat`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const respondToCloseRequest = async (complaintNumber, responseData) => {
  try {
    const response = await axiosInstance.post(`/api/complaints/${complaintNumber}/close-response`, responseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};