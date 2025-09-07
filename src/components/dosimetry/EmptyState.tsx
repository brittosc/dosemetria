import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";

interface EmptyStateProps {
  onAddCrime: () => void;
}

export function EmptyState({ onAddCrime }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center">
        <Scale className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Comece seu Cálculo</h2>
        <p className="text-muted-foreground mt-2 mb-4">
          Para iniciar a dosimetria, adicione o primeiro crime.
        </p>
        <Button onClick={onAddCrime}>Adicionar Crime</Button>
      </CardContent>
    </Card>
  );
}
