import React from "react";
import { AttachmentsManager } from "./AttachmentsManager";
import { Attachment } from "../types";

interface Props {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

export const AttachmentUpload: React.FC<Props> = ({ attachments, onChange }) => {
  return (
    <AttachmentsManager
      attachments={attachments}
      onChange={onChange}
      specialistName="Dyżurujący"
      title="Załączniki (PDF, Excel, obrazy, DOCX)"
    />
  );
};
