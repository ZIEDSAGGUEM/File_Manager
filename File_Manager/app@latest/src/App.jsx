import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";

const App = () => {
  const [baseDir, setBaseDir] = useState("C:/Users/ZIED/Desktop");
  const [filename, setFilename] = useState("");
  const [foldername, setFoldername] = useState("");
  const [items, setItems] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [fileContent, setFileContent] = useState(null);
  const [openFileModal, setOpenFileModal] = useState(false);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:3001/list", {
        params: { base_dir: baseDir },
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      showNotification("Failed to fetch items.", "error");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [baseDir]);

  const handleOpenFile = async (filename) => {
    try {
      const response = await axios.get("http://localhost:3001/open-file", {
        params: { base_dir: baseDir, filename },
      });
      setFileContent(response.data.content);
      setOpenFileModal(true);
    } catch (error) {
      console.error("Error opening file:", error);
      showNotification("Failed to open file.", "error");
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCreateFile = async () => {
    if (!filename) {
      showNotification("Filename is required.", "error");
      return;
    }
    try {
      await axios.post("http://localhost:3001/create-file", {
        base_dir: baseDir,
        filename,
      });
      showNotification(`File "${filename}" created successfully.`, "success");
      setFilename("");
      fetchItems();
    } catch (error) {
      console.error("Error creating file:", error);
      showNotification("Failed to create file.", "error");
    }
  };

  const handleCreateFolder = async () => {
    if (!foldername) {
      showNotification("Folder name is required.", "error");
      return;
    }
    try {
      await axios.post("http://localhost:3001/create-folder", {
        base_dir: baseDir,
        foldername,
      });
      showNotification(
        `Folder "${foldername}" created successfully.`,
        "success"
      );
      setFoldername("");
      fetchItems();
    } catch (error) {
      console.error("Error creating folder:", error);
      showNotification("Failed to create folder.", "error");
    }
  };

  const handleDelete = async (itemName) => {
    try {
      await axios.delete("http://localhost:3001/delete", {
        data: { base_dir: baseDir, name: itemName },
      });
      showNotification(`Item "${itemName}" deleted successfully.`, "success");
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      showNotification("Failed to delete item.", "error");
    }
  };

  const handleFolderClick = (folderName) => {
    const newBaseDir = `${baseDir}/${folderName}`;
    setBaseDir(newBaseDir);
  };

  const handleBreadcrumbClick = (pathIndex) => {
    const newBaseDir = baseDir
      .split("/")
      .slice(0, pathIndex + 1)
      .join("/");
    setBaseDir(newBaseDir);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Dynamic File Manager
      </Typography>
      <TextField
        fullWidth
        label="Base Directory"
        variant="outlined"
        value={baseDir}
        onChange={(e) => setBaseDir(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box display="flex" gap={2} sx={{ mb: 4 }}>
        <TextField
          label="File Name"
          variant="outlined"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" color="primary" onClick={handleCreateFile}>
          Create File
        </Button>
      </Box>
      <Box display="flex" gap={2} sx={{ mb: 4 }}>
        <TextField
          label="Folder Name"
          variant="outlined"
          value={foldername}
          onChange={(e) => setFoldername(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateFolder}
        >
          Create Folder
        </Button>
      </Box>
      <Breadcrumbs separator=">" sx={{ mb: 4 }}>
        {baseDir.split("/").map((dir, index) => (
          <Link
            key={index}
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => handleBreadcrumbClick(index)}
          >
            {dir || "Root"}
          </Link>
        ))}
      </Breadcrumbs>
      <Typography variant="h5" gutterBottom>
        Items in {baseDir}
      </Typography>
      <Dialog
        open={openFileModal}
        onClose={() => setOpenFileModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>File Content</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="pre">
            {fileContent || "No content to display."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFileModal(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      ;
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={4} sm={3} md={2} key={item.name}>
            <Card>
              <CardActionArea
                onClick={
                  item.isDirectory
                    ? () => handleFolderClick(item.name)
                    : () => handleOpenFile(item.name)
                }
              >
                <CardContent sx={{ textAlign: "center" }}>
                  {item.isDirectory ? (
                    <FolderIcon sx={{ fontSize: 60, color: "primary.main" }} />
                  ) : (
                    <InsertDriveFileIcon
                      sx={{ fontSize: 60, color: "secondary.main" }}
                    />
                  )}
                  <Typography variant="body2" noWrap>
                    {item.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(item.name)}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default App;
