import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserProfile } from "../backend.d";
import { useAllUsers } from "../hooks/useQueries";

const DEMO_USERS: UserProfile[] = [
  {
    userId: {} as any,
    name: "Carlos Mendez",
    email: "carlos@email.com",
    phone: "+53 5555 0001",
    role: "driver",
    loyaltyPoints: BigInt(0),
    createdAt: BigInt(Date.now()),
  },
  {
    userId: {} as any,
    name: "Maria Lopez",
    email: "maria@email.com",
    phone: "+53 5555 0002",
    role: "driver",
    loyaltyPoints: BigInt(0),
    createdAt: BigInt(Date.now()),
  },
  {
    userId: {} as any,
    name: "Ana García",
    email: "ana@email.com",
    phone: "+53 5555 0003",
    role: "user",
    loyaltyPoints: BigInt(150),
    createdAt: BigInt(Date.now()),
  },
  {
    userId: {} as any,
    name: "Roberto Diaz",
    email: "roberto@email.com",
    phone: "+53 5555 0004",
    role: "user",
    loyaltyPoints: BigInt(75),
    createdAt: BigInt(Date.now()),
  },
  {
    userId: {} as any,
    name: "Luisa Flores",
    email: "luisa@email.com",
    phone: "+53 5555 0005",
    role: "user",
    loyaltyPoints: BigInt(300),
    createdAt: BigInt(Date.now()),
  },
];

export default function AdminUsersScreen() {
  const { data: usersData } = useAllUsers();
  const users = usersData && usersData.length > 0 ? usersData : DEMO_USERS;

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
            {users.map((user) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
