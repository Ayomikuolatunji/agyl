interface Field {
  name: string;
}

export const createCertificateFields: Field[] = [
  { name: "expirationDate" },
  { name: "credentialUrl" },
  { name: "issuingOrganization" },
  { name: "issueDate" },
  { name: "certificateFile" },
];

export const updateCertificateFields: Field[] = [
  { name: "certificateFile" },
  { name: "uploadedCertificateCloudinaryId" },
];

export const uploadGuarantorFields: Field[] = [
  { name: "validIdFile" },
  { name: "profilePictureFile" },
  { name: "signatureFile" },
  { name: "applicantSignatureFile" },
  { name: "guarantorFirstName" },
  { name: "guarantorLastName" },
  { name: "date" },
  { name: "relationshipWithGuarantor" },
  { name: "guarantorEmail" },
  { name: "guarantorPhoneNumber" },
  { name: "date" },
];

export const nyscAndValid: Field[] = [{ name: "nysc" }, { name: "validId" }];

export const updateProfessionalOverview: Field[] = [
  { name: "meansOfIdentificationFile" },
  { name: "meansOfIdentificationCloudinaryId" },
];

export const updateGuarantorFiles = [
  { name: "publicUrl" },
  { name: "publicId" },
];
