import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { User, Product, UserProductPermissions, TabPermission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, Pencil, Trash, ShieldCheck, User as UserIcon, Users, Eye, EyeSlash, Lock, Package, Receipt, CalendarBlank } from '@phosphor-icons/react';
import { ProductPermissionsManager } from '@/components/ProductPermissionsManager';
import { useIsMobile } from '@/hooks/use-mobile';
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
    tabPermissions: [] as TabPermission[],
  });
  const [showPassword, setShowPassword] = useState(false);

  const safeUsers = users || [];
  const safeProducts = products || [];
  const isMobile = useIsMobile();

  const allTabs: { id: TabPermission; label: string; icon: typeof Package; description: string }[] = [
    { id: 'inventory', label: 'Inventario', icon: Package, description: 'Ver y gestionar productos' },
    { id: 'orders', label: 'Órdenes', icon: Receipt, description: 'Acceso a ventas y compras' },
    { id: 'dailyclose', label: 'Cierre del Día', icon: CalendarBlank, description: 'Reportes de cierre diario' },
  ];

  const resetForm = () => {
    setFormData({ username: '', password: '', isAdmin: false, tabPermissions: [] });
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
      tabPermissions: user.tabPermissions || [],
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
      tabPermissions: formData.isAdmin ? undefined : formData.tabPermissions,
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
              tabPermissions: formData.isAdmin ? undefined : formData.tabPermissions,
              productPermissions: u.productPermissions,
            }
          : u
      )
    );

    if (editingUser.username === currentUser.username) {
      const updatedCurrentUser: User = {
        username: formData.username.trim(),
        password: formData.password,
        isAdmin: formData.isAdmin,
        tabPermissions: formData.isAdmin ? undefined : formData.tabPermissions,
        productPermissions: editingUser.productPermissions,
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
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 md:w-7 md:h-7 text-primary" weight="duotone" />
            Gestión de Usuarios
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Administre los usuarios del sistema y sus permisos
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="text-sm md:text-base w-full md:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <Card className="p-3 md:p-6">
        <div className="mb-4">
          <h3 className="text-base md:text-lg font-semibold mb-1">Usuarios Registrados</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Total: {safeUsers.length} usuarios ({safeUsers.filter((u) => u.isAdmin).length} administradores)
          </p>
        </div>

        {safeUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm md:text-base">No hay usuarios registrados</p>
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {safeUsers.map((user) => (
              <Card key={user.username} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user.isAdmin ? 'bg-primary/10' : 'bg-muted'}`}>
                        {user.isAdmin ? (
                          <ShieldCheck className="w-6 h-6 text-primary" weight="fill" />
                        ) : (
                          <UserIcon className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-foreground truncate">
                          {user.username}
                        </h4>
                        <Badge variant={user.isAdmin ? 'default' : 'secondary'} className="text-xs mt-1">
                          {user.isAdmin ? 'Admin' : 'Visitante'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Lock className="w-3 h-3" />
                      <span>Contraseña:</span>
                      <span className="font-mono">{'•'.repeat(user.password.length)}</span>
                    </div>
                    {!user.isAdmin && (
                      <div className="text-xs text-muted-foreground">
                        {user.tabPermissions && user.tabPermissions.length > 0 ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>Permisos:</span>
                            <Badge variant="outline" className="text-xs">
                              {user.tabPermissions.length} tab{user.tabPermissions.length !== 1 ? 's' : ''}
                            </Badge>
                            {user.productPermissions && user.productPermissions.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {user.productPermissions.length} producto{user.productPermissions.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span>Sin permisos de tabs asignados</span>
                        )}
                      </div>
                    )}
                    {user.isAdmin && (
                      <div className="text-xs text-muted-foreground">
                        Acceso total al sistema
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {!user.isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPermissionsUser(user)}
                        className="flex-1"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Permisos
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDialog(user)}
                      className={`${user.isAdmin ? 'flex-1' : ''}`}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingUsername(user.username)}
                      disabled={user.username === 'admin' || user.username === currentUser.username}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] md:w-[50px]"></TableHead>
                  <TableHead className="text-xs md:text-sm">Nombre de Usuario</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs md:text-sm">Contraseña</TableHead>
                  <TableHead className="text-xs md:text-sm">Tipo</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs md:text-sm">Permisos</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>
                      {user.isAdmin ? (
                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" weight="fill" />
                      ) : (
                        <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-xs md:text-sm">{user.username}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs md:text-sm">{'•'.repeat(user.password.length)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isAdmin ? 'default' : 'secondary'} className="text-xs">
                        {user.isAdmin ? 'Admin' : 'Visitante'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.isAdmin ? (
                        <span className="text-xs text-muted-foreground">Acceso total</span>
                      ) : (
                        <div className="space-y-1">
                          {user.tabPermissions && user.tabPermissions.length > 0 ? (
                            <Badge variant="outline" className="text-xs">
                              {user.tabPermissions.length} tab{user.tabPermissions.length !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin acceso a tabs</span>
                          )}
                          {user.productPermissions && user.productPermissions.length > 0 && (
                            <Badge variant="outline" className="text-xs ml-1">
                              {user.productPermissions.length} producto{user.productPermissions.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 md:gap-2">
                        {!user.isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPermissionsUser(user)}
                            title="Gestionar permisos de productos"
                            className="h-8 w-8 md:h-10 md:w-10"
                          >
                            <Lock className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(user)}
                          className="h-8 w-8 md:h-10 md:w-10"
                        >
                          <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingUsername(user.username)}
                          disabled={user.username === 'admin' || user.username === currentUser.username}
                          className="h-8 w-8 md:h-10 md:w-10"
                        >
                          <Trash className="w-3 h-3 md:w-4 md:h-4" />
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
        <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Crear Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Complete los datos para crear un nuevo usuario en el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 md:space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="add-username" className="text-sm md:text-base">Nombre de Usuario</Label>
              <Input
                id="add-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ej: usuario123"
                autoComplete="off"
                className="text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground">Mínimo 3 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password" className="text-sm md:text-base">Contraseña</Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="text-sm md:text-base pr-10"
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

            <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
              <div className="space-y-0.5">
                <Label htmlFor="add-admin" className="text-sm md:text-base">
                  Permisos de Administrador
                </Label>
                <p className="text-xs md:text-sm text-muted-foreground">
                  El usuario podrá gestionar productos, usuarios y configuraciones
                </p>
              </div>
              <Switch
                id="add-admin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
            </div>

            {!formData.isAdmin && (
              <div className="space-y-3 rounded-lg border p-3 md:p-4">
                <Label className="text-sm md:text-base">Permisos de Vistas (Tabs)</Label>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">
                  Seleccione las vistas del sistema a las que el usuario tendrá acceso
                </p>
                <div className="space-y-2">
                  {allTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <div key={tab.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`add-tab-${tab.id}`}
                          checked={formData.tabPermissions.includes(tab.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                tabPermissions: [...formData.tabPermissions, tab.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                tabPermissions: formData.tabPermissions.filter((t) => t !== tab.id),
                              });
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor={`add-tab-${tab.id}`} className="text-xs md:text-sm font-medium cursor-pointer">
                              {tab.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{tab.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-end mt-4 md:mt-6">
            <Button variant="outline" onClick={handleCloseDialogs} className="text-sm md:text-base">
              Cancelar
            </Button>
            <Button onClick={handleAddUser} className="text-sm md:text-base">
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && handleCloseDialogs()}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Editar Usuario</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Modifique los datos del usuario "{editingUser?.username}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 md:space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-sm md:text-base">Nombre de Usuario</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ej: usuario123"
                autoComplete="off"
                className="text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground">Mínimo 3 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-sm md:text-base">Contraseña</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="text-sm md:text-base pr-10"
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

            <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-admin" className="text-sm md:text-base">
                  Permisos de Administrador
                </Label>
                <p className="text-xs md:text-sm text-muted-foreground">
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

            {!formData.isAdmin && (
              <div className="space-y-3 rounded-lg border p-3 md:p-4">
                <Label className="text-sm md:text-base">Permisos de Vistas (Tabs)</Label>
                <p className="text-xs md:text-sm text-muted-foreground mb-3">
                  Seleccione las vistas del sistema a las que el usuario tendrá acceso
                </p>
                <div className="space-y-2">
                  {allTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <div key={tab.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`edit-tab-${tab.id}`}
                          checked={formData.tabPermissions.includes(tab.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                tabPermissions: [...formData.tabPermissions, tab.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                tabPermissions: formData.tabPermissions.filter((t) => t !== tab.id),
                              });
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor={`edit-tab-${tab.id}`} className="text-xs md:text-sm font-medium cursor-pointer">
                              {tab.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{tab.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(editingUser?.username === 'admin' || editingUser?.username === currentUser.username) && (
              <div className="rounded-lg bg-muted/50 p-2 md:p-3 border border-border">
                <p className="text-xs text-muted-foreground">
                  {editingUser?.username === 'admin'
                    ? 'El usuario "admin" siempre debe mantener permisos de administrador'
                    : 'No puede quitarse los permisos de administrador a sí mismo'}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-end mt-4 md:mt-6">
            <Button variant="outline" onClick={handleCloseDialogs} className="text-sm md:text-base">
              Cancelar
            </Button>
            <Button onClick={handleEditUser} className="text-sm md:text-base">
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
