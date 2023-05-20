export const downloadIntoFile = (
  data: string,
  fileNamePrefix: string,
  extension: 'json' | 'csv'
) => {
  const fileName = fileNamePrefix + '_' + Date.now() + '.' + extension;

  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
  );
  element.setAttribute('download', fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  return fileName;
};
