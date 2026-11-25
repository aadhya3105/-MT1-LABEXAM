const express = require("express");

const app = express();
const PORT = 4000;

app.use(express.json());

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
    name: "Priya Nair",
    age: 29,
    disease: "Asthma",
    doctorName: "Dr.Verma",
  },
  {
    id: 3,
    name: "Suresh Rao",
    age: 52,
    disease: "Diabetes",
    doctorName: "Dr.Kulkarni",
  },
];


app.get("/patients", (req, res) => {
  return res.status(200).json(patients);
});


app.get("/patients/:id", (req, res) => {
  const patientId = Number(req.params.id);
  if (Number.isNaN(patientId)) {
    return res.status(400).json({ error: "Invalid patient ID" });
  }

  const patient = patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ error: `Patient with ID ${patientId} not found` });
  }

  return res.status(200).json(patient);
});


app.post("/patients", (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { id, name, age, disease, doctorName } = req.body;

  if (
    id === undefined ||
    !name ||
    age === undefined ||
    !disease ||
    !doctorName
  ) {
    return res.status(400).json({
      error:
        "All fields (id, name, age, disease, doctorName) are required",
    });
  }

  const numericId = Number(id);
  const numericAge = Number(age);

  if (Number.isNaN(numericId) || Number.isNaN(numericAge) || numericAge <= 0) {
    return res.status(400).json({
      error: "id and age must be valid numbers (age must be greater than 0)",
    });
  }

  if (patients.some((p) => p.id === numericId)) {
    return res.status(409).json({
      error: `Patient with ID ${numericId} already exists`,
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
  return res.status(201).json({
    message: "Patient added successfully",
    patient: newPatient,
  });
});

app.put("/patients/:id", (req, res) => {
  const patientId = Number(req.params.id);
  if (Number.isNaN(patientId)) {
    return res.status(400).json({ error: "Invalid patient ID" });
  }

  const index = patients.findIndex((p) => p.id === patientId);
  if (index === -1) {
    return res.status(404).json({ error: `Patient with ID ${patientId} not found` });
  }

  const { name, age, disease, doctorName } = req.body || {};

  if (
    name === undefined &&
    age === undefined &&
    disease === undefined &&
    doctorName === undefined
  ) {
    return res.status(400).json({
      error: "Provide at least one field to update (name, age, disease, doctorName)",
    });
  }

  if (age !== undefined && (Number.isNaN(Number(age)) || Number(age) <= 0)) {
    return res.status(400).json({ error: "age must be a valid positive number" });
  }

  const existing = patients[index];
  const updatedPatient = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    age: age !== undefined ? Number(age) : existing.age,
    disease: disease !== undefined ? String(disease).trim() : existing.disease,
    doctorName:
      doctorName !== undefined ? String(doctorName).trim() : existing.doctorName,
  };

  patients[index] = updatedPatient;
  return res.status(200).json({
    message: "Patient updated successfully",
    patient: updatedPatient,
  });
});

app.delete("/patients/:id", (req, res) => {
  const patientId = Number(req.params.id);
  if (Number.isNaN(patientId)) {
    return res.status(400).json({ error: "Invalid patient ID" });
  }

  const index = patients.findIndex((p) => p.id === patientId);
  if (index === -1) {
    return res.status(404).json({ error: `Patient with ID ${patientId} not found` });
  }

  const [deletedPatient] = patients.splice(index, 1);
  return res.status(200).json({
    message: "Patient deleted successfully",
    patient: deletedPatient,
  });
});


app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  return res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  return res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});