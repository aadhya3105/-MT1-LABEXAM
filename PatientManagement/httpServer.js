const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

let patients = [
  {
    id: 1,
    name: "Amit Kumar",
    age: 35,
    disease: "Fever",
    doctorName: "Dr.Sharma",
  },
  {
    id: 2,
    name: "Neha Verma",
    age: 58,
    disease: "Migraine",
    doctorName: "Dr.Mehta",
  },
  {
    id: 3,
    name: "Rohan Gupta",
    age: 33,
    disease: "Hypertension",
    doctorName: "Dr.Nair",
  },
];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload, null, 2));
};

const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const cleanUrl = url.split("?")[0];

  if (method === "GET" && cleanUrl === "/") {
    const filePath = path.join(PUBLIC_DIR, "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          return sendHtml(
            res,
            200,
            "<h1>Welcome to Hospital Patient Management</h1><p>HTTP Server running on port 3000.</p>"
          );
        }
        return sendJson(res, 500, {
          error: "Failed to read welcome page",
          details: err.message,
        });
      }
      return sendHtml(res, 200, data);
    });
    return;
  }

  if (method === "GET" && cleanUrl === "/about") {
    return sendHtml(
      res,
      200,
      `<h1>About CityCare Hospital</h1>
       <p>General & Multi-Specialty Care Center.</p>
       <p>24/7 Emergency & Outpatient Patient Management Portal.</p>`
    );
  }

  if (method === "GET" && cleanUrl === "/patients") {
    return sendJson(res, 200, patients);
  }

  if (method === "POST" && cleanUrl === "/add-patient") {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk.toString();
    });

    req.on("end", () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON request body" });
      }

      const { id, name, age, disease, doctorName } = parsedBody;

      if (
        id === undefined ||
        !name ||
        age === undefined ||
        !disease ||
        !doctorName
      ) {
        return sendJson(res, 400, {
          error:
            "Missing required fields. Required: id, name, age, disease, doctorName",
        });
      }

      const numericId = Number(id);
      const numericAge = Number(age);

      if (Number.isNaN(numericId) || Number.isNaN(numericAge) || numericAge <= 0) {
        return sendJson(res, 400, {
          error: "id and age must be valid numbers (age must be greater than 0)",
        });
      }

      const duplicate = patients.some((p) => p.id === numericId);
      if (duplicate) {
        return sendJson(res, 409, {
          error: `Patient with id ${numericId} already exists`,
        });
      }

      const newPatient = {
        id: numericId,
        name: String(name).trim(),
        age: numericAge,
        disease: String(disease).trim(),
        doctorName: String(doctorName).trim(),
      };

      patients.push(newPatient);
      return sendJson(res, 201, {
        message: "Patient added successfully",
        patient: newPatient,
      });
    });
    return;
  }

  return sendJson(res, 404, {
    error: "Route not found",
    method,
    path: cleanUrl,
  });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});