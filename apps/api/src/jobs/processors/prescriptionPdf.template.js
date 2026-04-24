import React from "react";
import ReactPDF, { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { getFrequencyLabels, translateInstructionToHindi } from "../../services/prescription.service.js";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, color: "#111827", fontFamily: "Helvetica" },
  section: { marginBottom: 12 },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 4 },
  muted: { color: "#4B5563" },
  card: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 10 },
  heading: { fontSize: 11, fontWeight: 700, marginBottom: 5 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  item: { marginBottom: 8 },
  rxTitle: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  footer: { marginTop: 10, fontSize: 9, color: "#4B5563" }
});

const calcAge = (dateOfBirth) => {
  if (!dateOfBirth) return "NA";
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
};

const PrescriptionTemplate = ({ prescription, tenant }) => {
  const labels = getFrequencyLabels();
  const patient = prescription.patientId || prescription.visitId?.patientId || {};
  const doctor = prescription.doctorId || prescription.visitId?.doctorId || {};
  const vitals = prescription.visitId?.vitals || {};

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.title }, doctor.name || "Doctor"),
        React.createElement(
          Text,
          { style: styles.muted },
          `${doctor.profile?.registrationNumber ? `Reg No: ${doctor.profile.registrationNumber}` : "Reg No: NA"}`
        ),
        React.createElement(Text, { style: styles.muted }, tenant.legalName || tenant.name),
        React.createElement(Text, { style: styles.muted }, `Ph: ${tenant.contact?.phone || "NA"}`)
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, null, `Patient: ${patient.name || "NA"}   Age: ${calcAge(patient.dateOfBirth)}${patient.gender ? String(patient.gender).slice(0, 1).toUpperCase() : ""}`),
          React.createElement(Text, null, `Date: ${new Date(prescription.finalizedAt || prescription.createdAt).toLocaleDateString("en-IN")}`)
        ),
        React.createElement(Text, null, `UHID: ${patient.uhid || "NA"}`),
        React.createElement(Text, null, `Chief Complaint: ${prescription.visitId?.chiefComplaint || "NA"}`),
        React.createElement(
          Text,
          null,
          `Vitals: BP ${vitals.systolicBp || "-"}${vitals.diastolicBp ? `/${vitals.diastolicBp}` : ""}  Temp ${vitals.temperatureF || "-"}°F  SpO2 ${vitals.spo2 || "-"}`
        )
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(Text, { style: styles.heading }, "Dx"),
        ...prescription.diagnosis.map((item, index) =>
          React.createElement(Text, { key: `${item.icdCode}-${index}` }, `${item.name} (${item.icdCode})`)
        )
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(Text, { style: styles.heading }, "Rx"),
        ...prescription.medicines.map((item, index) => {
          const hindiInstruction = translateInstructionToHindi(item.instructions);
          const frequency = labels[item.frequency]?.hi || labels[item.frequency]?.en || item.frequency;

          return React.createElement(
            View,
            { key: `${item.name}-${index}`, style: styles.item },
            React.createElement(Text, { style: styles.rxTitle }, `${index + 1}. ${item.name}`),
            React.createElement(Text, null, `${item.dose || ""} ${item.frequency || ""} × ${item.duration || ""} (${item.instructions || "No instructions"})`),
            React.createElement(Text, { style: styles.muted }, `[${frequency}${hindiInstruction ? `, ${hindiInstruction}` : ""}]`)
          );
        })
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(Text, { style: styles.heading }, "Lab & Advice"),
        React.createElement(Text, null, `Lab: ${prescription.labTests.map((item) => `${item.name}${item.instructions ? ` (${item.instructions})` : ""}`).join(", ") || "NA"}`),
        React.createElement(Text, null, `Advice: ${prescription.advice || "NA"}`),
        React.createElement(Text, null, `Follow-up: ${prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString("en-IN") : "NA"}`)
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        `Digital Signature Placeholder · ${doctor.name || "Doctor"}`
      )
    )
  );
};

export const renderPrescriptionPdf = async ({ prescription, tenant }) =>
  ReactPDF.renderToBuffer(React.createElement(PrescriptionTemplate, { prescription, tenant }));
