interface Field {
  name: string;
}

export const certificateFields: Array<Field> = [
  { name: "expirationDate" },
  { name: "credentialUrl" },
  { name: "issuingOrganization" },
  { name: "issueDate" },
  { name: "certificateFile" },
  { name: "id" },
];
