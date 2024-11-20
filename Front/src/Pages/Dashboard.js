import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    format: "",
    search: "",
    sortBy: "uploaded_at",
    order: "DESC",
  });
  const navigate = useNavigate();

  // Function to fetch files with filters
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Auth token
        },
        params: filter, // Pass the filters as query parameters
      });

      if (response.status === 200) {
        setFiles(response.data.files); // Store the filtered files in the state
      }
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
  }, [filter]); // Re-run this effect when the filter changes

  // Handle file input change (file selection)
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to download a file
  const handleDownload = (fileId) => {
    const url = `http://localhost:5000/api/files/download/${fileId}`;
    window.open(url, "_blank"); // Open the file in a new tab
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
      const response = await axios.post("http://localhost:5000/api/files/upload", formData, {
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

  // Handle filter change (search, format, sorting)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };
  // Function to delete a file
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
  return (
    <div>
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
          <option value="uploaded_at">Sort by Date</option>
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
        </form>
      </div>

      {/* Display messages */}
      {message && <p>{message}</p>}

      {/* Displaying files */}
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
