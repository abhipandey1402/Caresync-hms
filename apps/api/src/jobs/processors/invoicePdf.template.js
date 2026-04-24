import React from "react";
import ReactPDF, { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatPaise } from "../../services/billing.service.js";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#1F2937",
    fontFamily: "Helvetica"
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6
  },
  section: {
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  card: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10
  },
  heading: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6
  },
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontWeight: 700
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 4
  },
  colService: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colRate: { flex: 1.4, textAlign: "right" },
  colGst: { flex: 1.1, textAlign: "right" },
  colTotal: { flex: 1.6, textAlign: "right" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  muted: {
    color: "#6B7280"
  },
  strong: {
    fontWeight: 700
  },
  footer: {
    marginTop: 12,
    fontSize: 9,
    color: "#4B5563"
  }
});

const renderLineItem = (item, index) =>
  React.createElement(
    View,
    { key: `${item.description}-${index}`, style: styles.tableRow },
    React.createElement(
      Text,
      { style: styles.colService },
      `${item.description}${item.hsnCode ? `\nHSN/SAC: ${item.hsnCode}` : ""}`
    ),
    React.createElement(Text, { style: styles.colQty }, String(item.quantity)),
    React.createElement(Text, { style: styles.colRate }, formatPaise(item.rate)),
    React.createElement(Text, { style: styles.colGst }, `${item.gstRate}%`),
    React.createElement(Text, { style: styles.colTotal }, formatPaise(item.totalAmount))
  );

const InvoiceTemplate = ({ bill, tenant }) =>
  React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.title }, tenant.legalName || tenant.name),
        React.createElement(
          Text,
          { style: styles.muted },
          [
            tenant.address?.line1,
            tenant.address?.line2,
            tenant.address?.city,
            tenant.address?.state,
            tenant.address?.pincode
          ]
            .filter(Boolean)
            .join(", ")
        ),
        React.createElement(
          Text,
          { style: styles.muted },
          `GSTIN: ${tenant.gstin || "NA"}  Phone: ${tenant.contact?.phone || "NA"}`
        )
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.heading }, "TAX INVOICE"),
          React.createElement(Text, null, `Date: ${new Date(bill.finalizedAt || bill.createdAt).toLocaleDateString("en-IN")}`)
        ),
        React.createElement(Text, null, `Bill No: ${bill.billNumber}`),
        React.createElement(Text, null, `GST Invoice No: ${bill.gstInvoiceNumber || "NA"}`)
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(Text, { style: styles.heading }, "Patient Details"),
        React.createElement(Text, null, `Patient: ${bill.patientId?.name || "NA"} (${bill.patientId?.uhid || "NA"})`),
        React.createElement(Text, null, `UHID: ${bill.patientId?.uhid || "NA"}  ABHA: ${bill.patientId?.abhaId || "NA"}`)
      ),
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: styles.colService }, "Service"),
          React.createElement(Text, { style: styles.colQty }, "Qty"),
          React.createElement(Text, { style: styles.colRate }, "Rate"),
          React.createElement(Text, { style: styles.colGst }, "GST"),
          React.createElement(Text, { style: styles.colTotal }, "Total")
        ),
        ...bill.lineItems.map(renderLineItem)
      ),
      React.createElement(
        View,
        { style: [styles.section, styles.card] },
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, "Subtotal"),
          React.createElement(Text, null, formatPaise(bill.subtotal))
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, `CGST`),
          React.createElement(Text, null, formatPaise(bill.taxBreakup?.cgst))
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, `SGST`),
          React.createElement(Text, null, formatPaise(bill.taxBreakup?.sgst))
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, `IGST`),
          React.createElement(Text, null, formatPaise(bill.taxBreakup?.igst))
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, "Discount"),
          React.createElement(Text, null, `- ${formatPaise(bill.discount)}`)
        ),
        React.createElement(
          View,
          { style: [styles.summaryRow, styles.strong] },
          React.createElement(Text, null, "Total"),
          React.createElement(Text, null, formatPaise(bill.total))
        ),
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(Text, null, "Payment Status"),
          React.createElement(Text, null, String(bill.status || "").toUpperCase())
        )
      ),
      React.createElement(
        Text,
        { style: styles.footer },
        "GST breakup and HSN/SAC codes shown above. This invoice is system generated."
      )
    )
  );

export const renderInvoicePdf = async ({ bill, tenant }) =>
  ReactPDF.renderToBuffer(React.createElement(InvoiceTemplate, { bill, tenant }));
