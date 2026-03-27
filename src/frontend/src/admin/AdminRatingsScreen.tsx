import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";
import { useAllRatings } from "../hooks/useQueries";

export default function AdminRatingsScreen() {
  const { data: ratingsData } = useAllRatings();
  const ratings = ratingsData ?? [];

  const avgScore =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + Number(r.score), 0) / ratings.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-4" data-ocid="admin.ratings.section">
      <div className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Calificación Promedio</p>
          <p className="text-3xl font-bold text-foreground">
            {avgScore} <span className="text-yellow-400">★</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {ratings.length} reseñas totales
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <Table data-ocid="admin.ratings.table">
          <TableHeader>
            <TableRow>
              <TableHead>Viaje</TableHead>
              <TableHead>Puntuación</TableHead>
              <TableHead>Comentario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                  data-ocid="admin.ratings.empty_state"
                >
                  No hay calificaciones aún
                </TableCell>
              </TableRow>
            ) : (
              ratings.map((r) => (
                <TableRow key={r.id.toString()} data-ocid="admin.ratings.row">
                  <TableCell className="text-sm font-mono">
                    #{r.tripId.toString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Number(r.score) }, (_, j) => (
                        <Star
                          key={`star-${r.id.toString()}-${j}`}
                          className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                    {r.comment}
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
