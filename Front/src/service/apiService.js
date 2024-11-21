const BASE_URL = "http://localhost:5000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la requête API");
  }
  return response.json();
};

// Authentification
export const signupUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const checkEmailAvailability = async (email) => {
  const response = await fetch(`${BASE_URL}/auth/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// Paiements
export const createPaymentIntent = async ({ userId, email, billingAddress, purpose }) => {
  const response = await fetch(`${BASE_URL}/payments/create-payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, billingAddress, purpose }),
  });
  return handleResponse(response);
};

// Fichiers
export const uploadFile = async (formData, token) => {
  const response = await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const getUserFiles = async (token) => {
  const response = await fetch(`${BASE_URL}/files`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const deleteFile = async (fileId, token) => {
  const response = await fetch(`${BASE_URL}/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const downloadFile = async (fileId, token) => {
  const response = await fetch(`${BASE_URL}/files/download/${fileId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors du téléchargement du fichier");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileId;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const updateFileMetadata = async (fileId, metadata, token) => {
  const response = await fetch(`${BASE_URL}/files/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(metadata),
  });
  return handleResponse(response);
};

export const getFilteredAndSortedFiles = async (params, token) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/files/filter?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};
