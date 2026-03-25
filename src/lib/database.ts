import { DatabaseBackup } from './types';

export const exportDatabase = (backup: DatabaseBackup): void => {
  const jsonContent = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inventario_backup_${backup.timestamp.split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importDatabase = (file: File): Promise<DatabaseBackup> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup: DatabaseBackup = JSON.parse(content);
        
        if (!backup.version || !backup.timestamp || !backup.products) {
          reject(new Error('Formato de archivo inválido'));
          return;
        }
        
        resolve(backup);
      } catch (error) {
        reject(new Error('Error al leer el archivo'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};
