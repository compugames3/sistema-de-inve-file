import { DatabaseBackup, Product, BackupMetadata } from './types';

const calculateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

const compressData = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
};

const decompressData = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

export const createBackup = (
  products: Product[],
  users: Array<Omit<any, 'password'>>,
  auditLogs?: any[]
): DatabaseBackup => {
  const categories = [...new Set(products.map(p => p.category))];
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  
  const backup: DatabaseBackup = {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    products,
    users,
    auditLogs: auditLogs || [],
    metadata: {
      productsCount: products.length,
      usersCount: users.length,
      totalValue,
      categories,
    },
  };

  const jsonContent = JSON.stringify(backup);
  backup.checksum = calculateChecksum(jsonContent);

  return backup;
};

export const validateBackup = (backup: DatabaseBackup): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!backup.version) errors.push('Versión de backup no encontrada');
  if (!backup.timestamp) errors.push('Marca de tiempo no encontrada');
  if (!backup.products || !Array.isArray(backup.products)) {
    errors.push('Productos inválidos o no encontrados');
  }
  if (!backup.users || !Array.isArray(backup.users)) {
    errors.push('Usuarios inválidos o no encontrados');
  }

  if (backup.checksum) {
    const backupCopy = { ...backup };
    delete backupCopy.checksum;
    const calculatedChecksum = calculateChecksum(JSON.stringify(backupCopy));
    
    if (calculatedChecksum !== backup.checksum) {
      errors.push('Checksum inválido - el archivo puede estar corrupto');
    }
  }

  if (backup.products) {
    backup.products.forEach((product, index) => {
      if (!product.id) errors.push(`Producto ${index + 1}: ID faltante`);
      if (!product.sku) errors.push(`Producto ${index + 1}: SKU faltante`);
      if (!product.name) errors.push(`Producto ${index + 1}: Nombre faltante`);
      if (typeof product.quantity !== 'number') {
        errors.push(`Producto ${index + 1}: Cantidad inválida`);
      }
      if (typeof product.price !== 'number') {
        errors.push(`Producto ${index + 1}: Precio inválido`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const exportDatabase = (backup: DatabaseBackup, compressed: boolean = false): void => {
  const jsonContent = JSON.stringify(backup, null, 2);
  const finalContent = compressed ? compressData(jsonContent) : jsonContent;
  const fileExtension = compressed ? '.sib' : '.json';
  
  const blob = new Blob([finalContent], { 
    type: compressed ? 'application/octet-stream' : 'application/json;charset=utf-8;' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const dateStr = backup.timestamp.split('T')[0].replace(/-/g, '');
  const timeStr = backup.timestamp.split('T')[1].split(':').slice(0, 2).join('');
  const filename = `inventario_backup_${dateStr}_${timeStr}${fileExtension}`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const importDatabase = (file: File): Promise<DatabaseBackup> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const isCompressed = file.name.endsWith('.sib');
        const jsonContent = isCompressed ? decompressData(content) : content;
        
        const backup: DatabaseBackup = JSON.parse(jsonContent);
        
        const validation = validateBackup(backup);
        if (!validation.valid) {
          reject(new Error(`Backup inválido:\n${validation.errors.join('\n')}`));
          return;
        }
        
        resolve(backup);
      } catch (error) {
        reject(new Error('Error al leer el archivo: formato inválido'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};

export const getBackupMetadata = (backup: DatabaseBackup): BackupMetadata => {
  const jsonContent = JSON.stringify(backup);
  const sizeInBytes = new Blob([jsonContent]).size;
  
  return {
    filename: `inventario_backup_${backup.timestamp.split('T')[0]}.json`,
    timestamp: backup.timestamp,
    size: sizeInBytes,
    productsCount: backup.products.length,
    checksum: backup.checksum || '',
  };
};
