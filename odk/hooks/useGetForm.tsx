import { FormSchema } from "../type/FormType";

export const serverForms: FormSchema[] = [
  {
    id: "AFP-F001",
    title: "Immediate AFP Case Notification Form",
    description:
      "Used for immediate reporting of a suspected AFP case to ensure rapid investigation.",
    version: "2.1",
    lastUpdated: "Oct 15, 2025",
    sections: [
      {
        title: "Location & Date",
        fields: [
          { id: "state", label: "State", type: "text", required: true },
          {
            id: "lga",
            label: "Local Government Area",
            type: "text",
            required: true,
          },
          {
            id: "facility_name",
            label: "Health Facility Name",
            type: "text",
            required: true,
          },
          { id: "date", label: "Date", type: "date", required: true },
          {
            id: "week_no",
            label: "Week Number",
            type: "number",
            required: true,
          },
          { id: "year", label: "Year", type: "number", required: true },
        ],
      },
      {
        title: "Patient Details",
        fields: [
          {
            id: "child_name",
            label: "Child's Name",
            type: "text",
            required: true,
          },
          {
            id: "sex",
            label: "Sex",
            type: "select",
            options: ["Male", "Female"],
            required: true,
          },
          { id: "dob", label: "Date of Birth", type: "date", required: true },
          { id: "father_name", label: "Father's Name", type: "text" },
          { id: "mother_name", label: "Mother's Name", type: "text" },
          { id: "address", label: "Address", type: "text", required: true },
          {
            id: "village",
            label: "Village/City",
            type: "text",
            required: true,
          },
          { id: "permanent_address", label: "Permanent Address", type: "text" },
          { id: "patient_image", label: "Patient Image", type: "image" },
        ],
      },
      {
        title: "Hospitalization & Onset",
        fields: [
          {
            id: "hospitalized",
            label: "Is the child hospitalized?",
            type: "radio",
            options: ["Yes", "No"],
            required: true,
          },
          {
            id: "date_hospitalized",
            label: "Date of Hospitalization",
            type: "date",
          },
          { id: "hospital_ward", label: "Hospital Ward", type: "text" },
          {
            id: "paralysis_onset",
            label: "Date of Onset of Paralysis",
            type: "date",
            required: true,
          },
        ],
      },
      {
        title: "Reporting Details",
        fields: [
          {
            id: "notification_date",
            label: "Date of Notification",
            type: "date",
            required: true,
          },
          {
            id: "notified_by",
            label: "Notified By (Name)",
            type: "text",
            required: true,
          },
          { id: "signature", label: "Signature", type: "image" },
        ],
      },
      {
        title: "Action Taken",
        fields: [
          {
            id: "informed_mother",
            label: "Informed Mother About Stool Sample Collection",
            type: "checkbox",
          },
          {
            id: "confirmed_address",
            label: "Confirmed Address of the Child",
            type: "checkbox",
          },
          { id: "other_actions", label: "Other Actions Taken", type: "text" },
        ],
      },
    ],
  },
  {
    id: "AFP-F003",
    title: "AFP Surveillance System Weekly Health Facility Report",
    description:
      "Weekly summary of AFP cases identified and reported by the health facility.",
    version: "1.5",
    lastUpdated: "Oct 12, 2025",
    sections: [
      {
        title: "Facility & Date",
        fields: [
          {
            id: "facility_name",
            label: "Health Facility Name",
            type: "text",
            required: true,
          },
          {
            id: "week_no",
            label: "Week Number",
            type: "number",
            required: true,
          },
          { id: "year", label: "Year", type: "number", required: true },
          {
            id: "from_date",
            label: "Report From",
            type: "date",
            required: true,
          },
          { id: "to_date", label: "Report To", type: "date", required: true },
        ],
      },
      {
        title: "AFP Case Summary",
        fields: [
          {
            id: "case_count",
            label: "Number of AFP Cases Identified",
            type: "number",
            required: true,
          },
        ],
      },
      {
        title: "Reporting Officer",
        fields: [
          {
            id: "officer_name",
            label: "Officer's Name",
            type: "text",
            required: true,
          },
          { id: "signature", label: "Signature", type: "image" },
          {
            id: "submission_date",
            label: "Submission Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "LCI-L001",
    title: "Monthly List of Community Informant Report",
    description:
      "Monthly cases identified and reported by the Community Informant.",
    version: "0.5",
    lastUpdated: "Oct 22, 2025",
    sections: [
      {
        title: "Facility & Date",
        fields: [
          {
            id: "community_informant",
            label: "Community Informant Name",
            type: "text",
            required: true,
          },
          {
            id: "from_date",
            label: "Report From",
            type: "date",
            required: true,
          },
          { id: "to_date", label: "Report To", type: "date", required: true },
        ],
      },
      {
        title: "No. of Case reported",
        fields: [
          {
            id: "case_count",
            label: "Number of reported Cases Identified",
            type: "number",
            required: true,
          },
        ],
      },
      {
        title: "Feedback",
        fields: [
          {
            id: "feedback",
            label: "Community Informant Feddback",
            type: "text",
            required: true,
          },
        ],
      },
      {
        title: "Reporting Officer",
        fields: [
          {
            id: "officer_name",
            label: "Officer's Name",
            type: "text",
            required: true,
          },
          { id: "signature", label: "Signature", type: "image" },
          {
            id: "submission_date",
            label: "Submission Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "SIR-S001",
    title: "Immediate Case Notification Form",
    description:
      "Used for immediate reporting of a suspected case to ensure rapid investigation.",
    version: "2.1",
    lastUpdated: "Oct 15, 2025",
    sections: [
      {
        title: "Location & Date",
        fields: [
          { id: "state", label: "State", type: "text", required: true },
          {
            id: "lga",
            label: "Local Government Area",
            type: "text",
            required: true,
          },
          {
            id: "facility_name",
            label: "Health Facility Name",
            type: "text",
            required: true,
          },
          { id: "date", label: "Date", type: "date", required: true },
          {
            id: "week_no",
            label: "Week Number",
            type: "number",
            required: true,
          },
          { id: "year", label: "Year", type: "number", required: true },
        ],
      },
      {
        title: "Patient Details",
        fields: [
          {
            id: "child_name",
            label: "Child's Name",
            type: "text",
            required: true,
          },
          {
            id: "sex",
            label: "Sex",
            type: "select",
            options: ["Male", "Female"],
            required: true,
          },
          { id: "dob", label: "Date of Birth", type: "date", required: true },
          { id: "father_name", label: "Father's Name", type: "text" },
          { id: "mother_name", label: "Mother's Name", type: "text" },
          { id: "address", label: "Address", type: "text", required: true },
          {
            id: "village",
            label: "Village/City",
            type: "text",
            required: true,
          },
          { id: "permanent_address", label: "Permanent Address", type: "text" },
          { id: "patient_image", label: "Patient Image", type: "image" },
        ],
      },
      {
        title: "Hospitalization & Onset",
        fields: [
          {
            id: "hospitalized",
            label: "Is the child hospitalized?",
            type: "radio",
            options: ["Yes", "No"],
            required: true,
          },
          {
            id: "date_hospitalized",
            label: "Date of Hospitalization",
            type: "date",
          },
          { id: "hospital_ward", label: "Hospital Ward", type: "text" },
          {
            id: "paralysis_onset",
            label: "Date of Onset of Paralysis",
            type: "date",
            required: true,
          },
        ],
      },
      {
        title: "Reporting Details",
        fields: [
          {
            id: "notification_date",
            label: "Date of Notification",
            type: "date",
            required: true,
          },
          {
            id: "notified_by",
            label: "Notified By (Name)",
            type: "text",
            required: true,
          },
          { id: "signature", label: "Signature", type: "image" },
        ],
      },
      {
        title: "Action Taken",
        fields: [
          {
            id: "informed_mother",
            label: "Informed Mother About Stool Sample Collection",
            type: "checkbox",
          },
          {
            id: "confirmed_address",
            label: "Confirmed Address of the Child",
            type: "checkbox",
          },
          { id: "other_actions", label: "Other Actions Taken", type: "text" },
        ],
      },
    ],
  },
];
