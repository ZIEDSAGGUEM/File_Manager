const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Create a new file in a specified base directory
app.post("/create-file", (req, res) => {
  const { base_dir, filename, content = "" } = req.body;

  if (!base_dir || !filename) {
    return res
      .status(400)
      .json({ message: "Base directory and filename are required." });
  }

  const filePath = path.join(base_dir, filename);

  // Check if the base_dir exists
  if (!fs.existsSync(base_dir)) {
    return res
      .status(400)
      .json({ message: `Directory ${base_dir} does not exist.` });
  }

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Error creating file:", err);
      return res
        .status(500)
        .json({ message: "Failed to create file", error: err });
    }
    res.status(200).json({
      message: `File '${filename}' created in '${base_dir}' successfully.`,
    });
  });
});

// Create a new folder in a specified base directory
app.post("/create-folder", (req, res) => {
  const { base_dir, foldername } = req.body;

  if (!base_dir || !foldername) {
    return res
      .status(400)
      .json({ message: "Base directory and folder name are required." });
  }

  const folderPath = path.join(base_dir, foldername);

  // Check if the base_dir exists
  if (!fs.existsSync(base_dir)) {
    return res
      .status(400)
      .json({ message: `Directory ${base_dir} does not exist.` });
  }

  fs.mkdir(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating folder:", err);
      return res
        .status(500)
        .json({ message: "Failed to create folder", error: err });
    }
    res.status(200).json({
      message: `Folder '${foldername}' created in '${base_dir}' successfully.`,
    });
  });
});

// List files and folders in a directory
app.get("/list", (req, res) => {
  const { base_dir } = req.query;

  if (!base_dir) {
    return res.status(400).json({ message: "Base directory is required." });
  }

  if (!fs.existsSync(base_dir)) {
    return res
      .status(400)
      .json({ message: `Directory ${base_dir} does not exist.` });
  }

  fs.readdir(base_dir, { withFileTypes: true }, (err, items) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res
        .status(500)
        .json({ message: "Error reading directory", error: err });
    }

    const results = items.map((item) => ({
      name: item.name,
      isDirectory: item.isDirectory(),
    }));
    res.status(200).json(results);
  });
});

// Delete a file or folder
app.delete("/delete", (req, res) => {
  const { base_dir, name } = req.body;

  if (!base_dir || !name) {
    return res
      .status(400)
      .json({ message: "Base directory and name are required." });
  }

  const itemPath = path.join(base_dir, name);

  fs.rm(itemPath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("Error deleting item:", err);
      return res
        .status(500)
        .json({ message: "Error deleting item", error: err });
    }
    res.status(200).json({ message: `Item '${name}' deleted successfully.` });
  });
});

app.get("/open-file", (req, res) => {
  const { base_dir, filename } = req.query;
  const filePath = path.join(base_dir, filename);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: "Failed to read file." });
    }
    res.json({ content: data });
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
