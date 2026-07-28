export const uploadGiftFile = async (file) => {
  if (!file) return null;
  return {
    name: file.name,
    type: file.type,
    preview: URL.createObjectURL(file),
    status: 'ready-for-backend-upload'
  };
};
