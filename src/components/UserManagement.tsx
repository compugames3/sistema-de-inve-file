import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { User, Product, UserProductPermissions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Pencil, Trash, ShieldCheck, User as UserIcon, Users, Eye, EyeSlash, Lock } from '@phosphor-icons/react';
import { ProductPermissionsManager } from '@/components/ProductPermissionsManager';
import { toast } from 'sonner';

interface UserManagementProps {
  currentUser: User;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useKV<User[]>('system-users', []);
  const [products] = useKV<Product[]>('inventory-products', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isAdmin: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const safeUsers = users || [];
  const safeProducts = products || [];

  const resetForm = () => {
    setFormData({ username: '', password: '', isAdmin: false });
    setShowPassword(false);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setFormData({
      username: user.username,
      password: user.password,
      isAdmin: user.isAdmin,
    });
    setShowPassword(false);
    setEditingUser(user);
  };

  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const handleAddUser = () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const userExists = safeUsers.some((u) => u.username === formData.username);
    if (userExists) {
      toast.error('El nombre de usuario ya existe');
      return;
    }

    const newUser: User = {
      username: formData.username.trim(),
      password: formData.password,
      isAdmin: formData.isAdmin,
    };

    setUsers((current) => [...(current || []), newUser]);
    toast.success(`Usuario "${newUser.username}" creado exitosamente`);
    handleCloseDialogs();
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (editingUser.username === 'admin' && !formData.isAdmin) {
      toast.error('No se puede quitar permisos de administrador al usuario "admin"');
      return;
    }

    if (editingUser.username === currentUser.username && !formData.isAdmin) {
      toast.error('No puede quitarse los permisos de administrador a sí mismo');
      return;
    }

    const userExists = safeUsers.some(
      (u) => u.username === formData.username && u.username !== editingUser.username
    );
    if (userExists) {
      toast.error('El nombre de usuario ya existe');
      return;
    }

    setUsers((current) =>
      (current || []).map((u) =>
        u.username === editingUser.username
          ? {
              username: formData.username.trim(),
              password: formData.password,
              isAdmin: formData.isAdmin,
            }
          : u
      )
    );

    if (editingUser.username === currentUser.username) {
      const updatedCurrentUser: User = {
        username: formData.username.trim(),
        password: formData.password,
        isAdmin: formData.isAdmin,
      };
      window.spark.kv.set('current-user', updatedCurrentUser);
    }

    toast.success(`Usuario "${formData.username}" actualizado exitosamente`);
    handleCloseDialogs();
  };

  const handleDeleteUser = () => {
    if (!deletingUsername) return;

    if (deletingUsername === 'admin') {
      toast.error('No se puede eliminar el usuario administrador por defecto');
      setDeletingUsername(null);
      return;
    }

    if (deletingUsername === currentUser.username) {
      toast.error('No puede eliminarse a sí mismo');
      setDeletingUsername(null);
      return;
    }

    setUsers((current) => (current || []).filter((u) => u.username !== deletingUsername));
    toast.success(`Usuario "${deletingUsername}" eliminado exitosamente`);
    setDeletingUsername(null);
  };

  const handleUpdatePermissions = (username: string, permissions: UserProductPermissions[]) => {
    setUsers((current) =>
      (current || []).map((u) =>
        u.username === username
          ? { ...u, productPermissions: permissions }
          : u
      )
    );

    if (username === currentUser.username) {
      window.spark.kv.set('current-user', {
        ...currentUser,
        productPermissions: permissions,
      });
    }
  };

  const deletingUser = safeUsers.find((u) => u.username === deletingUsername);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" weight="duotone" />
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administre los usuarios del sistema y sus permisos
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Usuarios Registrados</h3>
          <p className="text-sm text-muted-foreground">
            Total: {safeUsers.length} usuarios ({safeUsers.filter((u) => u.isAdmin).length} administradores)
          </p>
        </div>

        {safeUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nombre de Usuario</TableHead>
                  <TableHead>Contraseña</TableHead>
                  <TableHead>Tipo de Usuario</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>
                      {user.isAdmin ? (
                        <ShieldCheck className="w-5 h-5 text-primary" weight="fill" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="font-mono text-sm">{'•'.repeat(user.password.length)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                        {user.isAdmin ? 'Administrador' : 'Visitante'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <span className="text-xs text-muted-foreground">Acceso total</span>
                      ) : user.productPermissions && user.productPermissions.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          {user.productPermissions.length} producto{user.productPermissions.length !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin permisos</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!user.isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPermissionsUser(user)}
                            title="Gestionar permisos de productos"
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingUsername(user.username)}
                          disabled={user.username === 'admin' || user.username === currentUser.username}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && handleCloseDialogs()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="add-username">Nombre de Usuario</Label>
              <Input
                id="add-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ej: usuario123"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Mínimo 3 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="add-admin" className="text-base">
                  Permisos de Administrador
                </Label>
                <p className="text-sm text-muted-foreground">
                  El usuario podrá gestionar productos, usuarios y configuraciones
                </p>
              </div>
              <Switch
                id="add-admin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={handleCloseDialogs}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && handleCloseDialogs()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos del usuario "{editingUser?.username}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Nombre de Usuario</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ej: usuario123"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">Mínimo 3 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-admin" className="text-base">
                  Permisos de Administrador
                </Label>
                <p className="text-sm text-muted-foreground">
                  El usuario podrá gestionar productos, usuarios y configuraciones
                </p>
              </div>
              <Switch
                id="edit-admin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
                disabled={
                  editingUser?.username === 'admin' || editingUser?.username === currentUser.username
                }
              />
            </div>

            {(editingUser?.username === 'admin' || editingUser?.username === currentUser.username) && (
              <div className="rounded-lg bg-muted/50 p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  {editingUser?.username === 'admin'
                    ? 'El usuario "admin" siempre debe mantener permisos de administrador'
                    : 'No puede quitarse los permisos de administrador a sí mismo'}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={handleCloseDialogs}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>
              <Pencil className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUsername} onOpenChange={(open) => !open && setDeletingUsername(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario{' '}
              <span className="font-semibold">"{deletingUser?.username}"</span> del sistema.
              {deletingUser?.isAdmin && (
                <span className="block mt-2 text-warning font-medium">
                  ⚠️ Este usuario tiene permisos de administrador.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {permissionsUser && (
        <ProductPermissionsManager
          user={permissionsUser}
          products={safeProducts}
          onUpdatePermissions={(permissions) =>
            handleUpdatePermissions(permissionsUser.username, permissions)
          }
          onClose={() => setPermissionsUser(null)}
        />
      )}
    </div>
  );
}
