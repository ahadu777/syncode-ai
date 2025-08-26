import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Terminal API endpoints
  app.post("/api/terminal/execute", async (req, res) => {
    try {
      const { command, cwd = process.cwd() } = req.body;
      
      if (!command) {
        return res.status(400).json({ error: "Command is required" });
      }

      const childProcess = spawn("bash", ["-c", command], {
        cwd,
        stdio: "pipe",
        env: { ...process.env, TERM: "xterm-color" }
      });

      let stdout = "";
      let stderr = "";

      childProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      childProcess.on("close", (code) => {
        res.json({
          stdout,
          stderr,
          exitCode: code,
          command,
          cwd
        });
      });

      // Handle timeout
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill();
          res.json({
            stdout,
            stderr: stderr + "\nCommand timed out",
            exitCode: 1,
            command,
            cwd
          });
        }
      }, 30000); // 30 second timeout

    } catch (error) {
      res.status(500).json({ error: "Failed to execute command" });
    }
  });

  // File system API endpoints
  app.get("/api/files", async (req, res) => {
    try {
      const { path: dirPath = "." } = req.query;
      const targetPath = dirPath === "/workspace" ? "." : dirPath as string;
      
      const files = await fs.readdir(targetPath, { withFileTypes: true });
      
      const fileList = files.map(file => ({
        name: file.name,
        type: file.isDirectory() ? "directory" : "file",
        path: path.join(targetPath, file.name)
      }));
      
      res.json({ files: fileList, currentPath: targetPath });
    } catch (error) {
      console.error("File read error:", error);
      res.status(500).json({ error: "Failed to read directory" });
    }
  });

  app.get("/api/files/content", async (req, res) => {
    try {
      const { path: filePath } = req.query;
      
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }
      
      const content = await fs.readFile(filePath as string, "utf-8");
      res.json({ content, path: filePath });
    } catch (error) {
      res.status(500).json({ error: "Failed to read file" });
    }
  });

  app.post("/api/files/create", async (req, res) => {
    try {
      const { path: filePath, content = "", type = "file" } = req.body;
      
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }
      
      if (type === "directory") {
        await fs.mkdir(filePath, { recursive: true });
      } else {
        await fs.writeFile(filePath, content);
      }
      
      res.json({ success: true, path: filePath, type });
    } catch (error) {
      res.status(500).json({ error: "Failed to create file/directory" });
    }
  });

  app.delete("/api/files", async (req, res) => {
    try {
      const { path: filePath } = req.body;
      
      if (!filePath) {
        return res.status(400).json({ error: "File path is required" });
      }
      
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await fs.rmdir(filePath, { recursive: true });
      } else {
        await fs.unlink(filePath);
      }
      
      res.json({ success: true, path: filePath });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file/directory" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
