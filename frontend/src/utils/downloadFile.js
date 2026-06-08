import apiClient from '../api/axios';

/**
 * Downloads a file from the given URL.
 * @param {string} url - The API endpoint to download the file from.
 * @param {string} defaultFilename - The default filename if none is provided in the headers.
 */
export const downloadFile = async (url, defaultFilename = 'download.pdf') => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob', // Important for handling binary data
    });

    // Try to get filename from content-disposition header if present
    const disposition = response.headers['content-disposition'];
    let filename = defaultFilename;
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Create a blob URL and trigger the download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};
