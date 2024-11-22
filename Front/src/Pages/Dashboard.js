import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_test_51PvlpgL0QB8STWZLk81AQ7kFUrdQbGKoQZdPkE3i8oMO4bkcdSrFCQMCZ0pP0iGQ0puYrqXodDj67tl8xyspZiov00ROwen1YD");

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    format: "",
    search: "",
    sortBy: "created_at",  // Default sorting by date
    order: "ASC",  // Default sorting order
  });
  const [storageStats, setStorageStats] = useState(null);
  const [additionalStorage, setAdditionalStorage] = useState(0);
  const navigate = useNavigate();
  // const stripe = useStripe();
  // const elements = useElements();
  // const card = elements.getElement(CardElement);

  // const handleBuyMoreStorage = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.post(
  //       'http://localhost:5000/api/payment/buy-storage',
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       setMessage('Storage successfully upgraded! Please proceed with payment.');
  //       navigate('/payment', {
  //         state: { clientSecret: response.data.clientSecret, userInfo: response.data.userInfo },
  //       });
  //     }
  //   } catch (error) {
  //     setMessage('Error processing payment.');
  //     console.error('Error buying storage:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  


  useEffect(() => {
    const fetchStorageStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/storage-stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 200) {
          setStorageStats(response.data);
        }
      } catch (error) {
        console.error("Error fetching storage stats:", error);
        setMessage('Failed to fetch storage stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStorageStats();
  }, []);
  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,  // Auth token
        },
      });

      setFiles(files.filter((file) => file.id !== fileId));  // Remove the deleted file from the list
      setMessage("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file.");
    }
  };
  // Fetch the filtered files from the backend
  const fetchFiles = async () => {
    console.log("fichier avant filtre", files)
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: filter,  // Send filters as query params
      });
      console.log("DEBUG: Files retrieved:", response.data.files); 
      if (response.status === 200) {
        setFiles(response.data.files);  // Store filtered files in state
      }
      console.log("fichiers apres filtre", files)
    } catch (error) {
      console.error("Error retrieving files:", error);
      setMessage("Error retrieving files.");
    } finally {
      setLoading(false);
    }
  };

  // Call fetchFiles whenever the filter changes
  useEffect(() => {
    fetchFiles();
  }, [filter]); // Re-run when filter changes

  // Handle filter change (search, format, sorting)
  
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log("DEBUG: Filter changed:", name, value); // Log the change
        setFilter((prevFilter) => ({
          ...prevFilter,
          [name]: value,  // Update the filter state when the user changes a filter option
        }));
      };
      
  // Handle file input change (file selection)
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to download a file
  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`  // Ensure token is passed if needed
        },
      });
  
      if (response.ok) {
        const blob = await response.blob();  // Convert response to Blob
        const url = window.URL.createObjectURL(blob);  // Create an object URL for the file
        const a = document.createElement('a');
        a.href = url;
        a.download = fileId;  // Use the file name if available
        document.body.appendChild(a);
        a.click();
        a.remove();  // Remove the link element
      } else {
        throw new Error('Failed to download the file.');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert('Failed to download the file.');
    }
  };
  
  

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Auth token
        },
      });

      if (response.status === 200) {
        setMessage("File uploaded successfully!");
        setFiles((prevFiles) => [response.data.file, ...prevFiles]); // Add file to the list
        setFile(null); // Reset file input
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent.")) {
      setLoading(true);
      try {
        const response = await axios.delete("http://localhost:5000/api/auth/delete-account", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Correct token sent in headers
          },
        });
        setMessage(response.data.message);
        // Optionally redirect the user to the login or home page after deletion
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login"; // or navigate('/login');
        }, 2000); // wait 2 seconds before redirect
      } catch (error) {
        console.error("Error deleting account:", error);
        setMessage("There was an error deleting your account.");
      } finally {
        setLoading(false);
      }
    }
  };
  const [error, setError] = useState("");

  // const handleAction = async () => {
  //   setLoading(true);
  //   try {
  //     // Call the backend to create a payment intent and get clientSecret
  //     const response = await axios.post("http://localhost:5000/api/auth/create-payment-intent", { /* user-specific data */ });

  //     if (response.data.clientSecret) {
  //       // Redirect to the payment page with clientSecret and user info
  //       navigate("/payment", {
  //         state: {
  //           clientSecret: response.data.clientSecret,
  //           userInfo: { /* user info like name, email, etc. */ },
  //         },
  //       });
  //     } else {
  //       setError("Erreur lors de la création du paiement.");
  //     }
  //   } catch (error) {
  //     setError("Erreur serveur lors de la création du paiement.");
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const [invoices, setInvoices] = useState([]);
  const handleDownloadInvoice = async (invoiceId) => {
    console.log(`DEBUG: Attempting to download invoice with ID: ${invoiceId}`);
    try {
        const response = await axios.get(`http://localhost:5000/api/auth/invoice/${invoiceId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}` // Include the user's authentication token
            },
            responseType: 'blob',  // Important to handle binary data (file)
        });

        // Check if the response is okay before triggering the download
        if (response.status === 200) {
            console.log(`DEBUG: Invoice ${invoiceId} download successful`);

            // Create a link element to trigger the download
            const link = document.createElement('a');
            const url = window.URL.createObjectURL(new Blob([response.data]));
            link.href = url;
            link.setAttribute('download', `invoice_${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Clean up the URL object
            window.URL.revokeObjectURL(url);
        } else {
            console.log(`DEBUG: Failed to download invoice ${invoiceId}. Response:`, response);
        }
    } catch (error) {
        console.error(`DEBUG: Error downloading invoice ${invoiceId}:`, error);
        alert("Erreur lors du téléchargement de la facture.");
    }
};

useEffect(() => {
  const fetchInvoices = async () => {
      try {
          const response = await axios.get('http://localhost:5000/api/auth/invoices', {
              headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,  // Add the JWT token
              }
          });

          if (response.status === 200) {
              setInvoices(response.data.invoices);  // Store the invoices in the state
          }
      } catch (err) {
          console.error('Error fetching invoices:', err);
          setError('Error fetching invoices.');
      }
  };

  fetchInvoices();  // Fetch the invoices when the component mounts
}, []);
  return (
    <div>
      <Header />
      <button onClick={handleDeleteAccount} disabled={loading}>
        {loading ? "Deleting..." : "Delete Account"}
      </button>
      {/* <div>
        <input
          type="number"
          value={additionalStorage}
          onChange={(e) => setAdditionalStorage(Number(e.target.value))}
          placeholder="Enter additional storage in MB"
        />
         <button onClick={handleAction} disabled={loading}>
        {loading ? 'Processing Payment...' : 'Buy Additional Storage'}
      </button>
      </div> */}
      <h1>Your Invoices</h1>
            {error && <p>{error}</p>}
            <ul>
                {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                        <li key={invoice.id}>
                            Invoice ID: {invoice.id} - Amount: {invoice.amount} - Date: {invoice.created_at}
                        </li>
                    ))
                ) : (
                    <p>No invoices found.</p>
                )}
            </ul>
        {loading ? (
            <p>Loading...</p>
        ) : (
            <ul>
                {invoices.map((invoice) => (
                    <li key={invoice.id}>
                        <span>Invoice #{invoice.id} - {invoice.amount} €</span>
                        <button onClick={() => handleDownloadInvoice(invoice.id)}>Download</button>
                    </li>
                ))}
            </ul>
        )}
      <h1>User Dashboard</h1>
      <h2>Your Files</h2>

      {/* Filter and Sorting */}
      <div>
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          value={filter.search}
          onChange={handleFilterChange}
        />
        <select name="format" value={filter.format} onChange={handleFilterChange}>
          <option value="">Filter by format</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
        </select>
        <select name="sortBy" value={filter.sortBy} onChange={handleFilterChange}>
          <option value="created_at">Sort by Date</option>
          <option value="size">Sort by Size</option>
        </select>
        <select name="order" value={filter.order} onChange={handleFilterChange}>
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>

      {/* File upload form */}
      <div>
        <h3>Upload a File</h3>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
          {error && <div>{error}</div>}
    
        </form>
      </div>

      {/* Display messages */}
      {message && <p>{message}</p>}
      {loading ? (
        <p>Chargement des informations de stockage...</p>
      ) : storageStats ? (
        <div>
          <h2>Votre espace de stockage</h2>
          <p>Total de stockage: {storageStats.totalStorage} Mo</p>
          <p>Espace utilisé: {storageStats.totalUsed} Mo</p>
          <p>Reste à utiliser: {storageStats.remainingStorage} Mo</p>
        </div>
      ) : (
        <p>{message}</p>
      )}
      {/* Display files */}
      {loading ? (
        <p>Loading files...</p>
      ) : files.length > 0 ? (
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <span>{file.name}</span> - {file.size} bytes
              <button onClick={() => handleDownload(file.id)}>Download</button>
              <button onClick={() => handleDelete(file.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found</p>
      )}
    </div>
  );
};

export default Dashboard;
