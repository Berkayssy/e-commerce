// backend/utils/fileparser.js - EXPORT'U DEĞİŞTİR:
const parseFile = (file) => {
  if (!file) return null;
  return {
    public_id: file.public_id,
    url: file.secure_url || file.path || file.url,
    width: file.width,
    height: file.height,
    format: file.format,
    resource_type: file.resource_type,
    bytes: file.bytes,
    created_at: file.created_at,
    original_filename: file.originalname || file.original_filename,
  };
};

module.exports = {
  parse: parseFile,
  stringify: (data) => JSON.stringify(data),
};
