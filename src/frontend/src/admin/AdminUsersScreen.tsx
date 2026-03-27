import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllUsers } from "../hooks/useQueries";

export default function AdminUsersScreen() {
  const { data: usersData } = useAllUsers();
  const users = usersData ?? [];

  return (
    <div className="space-y-4" data-ocid="admin.users.section">
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="admin.users.table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                  data-ocid="admin.users.empty_state"
                >
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.email} data-ocid="admin.users.row">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.phone}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "driver" ? "default" : "secondary"}
                    >
                      {user.role === "driver" ? "Conductor" : "Cliente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.loyaltyPoints?.toString() ?? "0"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
