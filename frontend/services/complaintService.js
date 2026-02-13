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

export const submitUserFeedback = async (complaintNumber, feedbackData) => {
  try {
    const response = await axiosInstance.post(`/api/complaints/${complaintNumber}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserComplaintStats = async () => {
  try {
    const response = await axiosInstance.get('/api/complaints/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const transferComplaint = async (complaintNumber, transferData) => {
  try {
    const response = await axiosInstance.post(`/api/departments/complaints/${complaintNumber}/transfer`, transferData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestCloseComplaint = async (complaintNumber, reason) => {
  try {
    const response = await axiosInstance.post(`/api/departments/complaints/${complaintNumber}/request-close`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getIncomingTransfers = async () => {
  try {
    const response = await axiosInstance.get('/api/departments/transfers/incoming');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const acceptTransferRequest = async (complaintNumber) => {
  try {
    const response = await axiosInstance.post(`/api/departments/complaints/${complaintNumber}/accept-transfer`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rejectTransferRequest = async (complaintNumber, rejectionReason) => {
  try {
    const response = await axiosInstance.post(`/api/departments/complaints/${complaintNumber}/reject-transfer`, { rejectionReason });
    return response.data;
  } catch (error) {
    throw error;
  }
};