import { useKV } from '@github/spark/hooks';
import { AuditLog, AuditAction, Product } from '@/lib/types';

export const useAudit = () => {
  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('audit-logs', []);
  const [currentUser] = useKV<any>('current-user', null);

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const createAuditLog = (
    action: AuditAction,
    entityType: 'product' | 'user' | 'backup',
    entityId: string,
    entityName: string,
    changes?: { field: string; oldValue: any; newValue: any }[]
  ) => {
    const log: AuditLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      username: currentUser?.username || 'Sistema',
      action,
      entityType,
      entityId,
      entityName,
      changes,
    };

    setAuditLogs((current) => [...(current || []), log]);
  };

  const logProductCreate = (product: Product) => {
    createAuditLog('CREATE', 'product', product.id, product.name);
  };

  const logProductUpdate = (oldProduct: Product, newProduct: Product) => {
    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    Object.keys(newProduct).forEach((key) => {
      const k = key as keyof Product;
      if (oldProduct[k] !== newProduct[k] && k !== 'updatedAt') {
        changes.push({
          field: key,
          oldValue: oldProduct[k],
          newValue: newProduct[k],
        });
      }
    });

    if (changes.length > 0) {
      createAuditLog('UPDATE', 'product', newProduct.id, newProduct.name, changes);
    }
  };

  const logProductDelete = (product: Product) => {
    createAuditLog('DELETE', 'product', product.id, product.name);
  };

  const logBackupRestore = (filename: string) => {
    createAuditLog('RESTORE', 'backup', generateId(), filename);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  return {
    auditLogs: auditLogs || [],
    logProductCreate,
    logProductUpdate,
    logProductDelete,
    logBackupRestore,
    clearAuditLogs,
  };
};
