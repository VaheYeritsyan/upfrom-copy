export const exportCsv = (csvContent?: string, fileName?: string) => {
  if (!csvContent || !fileName) return;

  const prefix = 'data:text/csv;charset=utf-8';
  const url = encodeURI(`${prefix},${csvContent}`);
  const link = document.createElement('a');
  const file = `${fileName}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', file);
  link.style.height = '0px';
  link.style.width = '0px';
  link.style.opacity = '0';
  link.style.overflow = 'hidden';
  link.innerText = `Download ${file}`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
