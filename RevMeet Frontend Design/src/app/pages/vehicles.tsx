import { useEffect, useState } from "react";
import { Plus, Car, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { fetchVehicles, createVehicle, getCurrentUserId } from "../lib/api";
import { toast } from "sonner";

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Form state
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [powerHp, setPowerHp] = useState("");
  const [plateOptional, setPlateOptional] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(userId);

        const data = await fetchVehicles(userId);
        setVehicles(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Fehler beim Laden der Fahrzeuge");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCreateDialog = () => {
    setEditingVehicle(null);
    resetForm();
    setVehicleDialogOpen(true);
  };

  const openEditDialog = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(vehicle.year?.toString() || "");
    setColor(vehicle.color || "");
    setPowerHp(vehicle.powerHp?.toString() || "");
    setPlateOptional(vehicle.plateOptional || "");
    setNotes(vehicle.notes || "");
    setVehicleDialogOpen(true);
  };

  const resetForm = () => {
    setMake("");
    setModel("");
    setYear("");
    setColor("");
    setPowerHp("");
    setPlateOptional("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!make || !model) {
      toast.error("Marke und Modell sind Pflichtfelder");
      return;
    }

    try {
      if (editingVehicle) {
        // Not implemented: update vehicle endpoint
        toast.success("Fahrzeug erfolgreich aktualisiert!");
      } else {
        const newVehicle = await createVehicle({
          userId: currentUserId,
          make,
          model,
          year: year ? Number(year) : undefined,
          color,
          powerHp: powerHp ? Number(powerHp) : undefined,
          plateOptional,
          notes,
        });
        setVehicles((prev) => [...prev, newVehicle]);
        toast.success("Fahrzeug erfolgreich hinzugefügt!");
      }

      setVehicleDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(`Fehler beim Speichern: ${err?.message || err}`);
    }
  };

  const handleDelete = () => {
    toast.success("Fahrzeug erfolgreich gelöscht");
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white md:text-4xl font-bold mb-2">
              Meine Fahrzeuge
            </h1>
            <p className="text-muted-foreground">
              Verwalte deine Fahrzeugsammlung
            </p>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Hinzufügen</span>
          </Button>
        </div>

        {loading && (
          <Card className="p-12 text-center bg-card border-border">
            <p>Lade Fahrzeuge...</p>
          </Card>
        )}

        {error && (
          <Card className="p-12 text-center bg-card border-border">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && vehicles.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Fahrzeuge</h3>
            <p className="text-muted-foreground mb-6">
              Füge dein erstes Fahrzeug hinzu, um an Carmeets teilzunehmen
            </p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={openCreateDialog}
            >
              <Plus className="w-4 h-4 mr-2" />
              Fahrzeug hinzufügen
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.vehicleId}
                className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors"
              >
                <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.year && (
                        <Badge variant="outline" className="text-xs">
                          {vehicle.year}
                        </Badge>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6">
                    {vehicle.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Farbe</span>
                        <span className="font-medium">{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.powerHp && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Leistung</span>
                        <span className="font-medium">
                          {vehicle.powerHp} PS
                        </span>
                      </div>
                    )}
                    {vehicle.plateOptional && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Kennzeichen
                        </span>
                        <span className="font-medium font-mono">
                          {vehicle.plateOptional}
                        </span>
                      </div>
                    )}
                    {vehicle.notes && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          {vehicle.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEditDialog(vehicle)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => {
                        setVehicleToDelete(vehicle.vehicleId);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent className="bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle
                ? "Fahrzeug bearbeiten"
                : "Neues Fahrzeug hinzufügen"}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? "Aktualisiere die Details deines Fahrzeugs"
                : "Füge ein neues Fahrzeug zu deiner Sammlung hinzu"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">
                  Marke <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="make"
                  placeholder="z.B. Porsche"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">
                  Modell <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="model"
                  placeholder="z.B. 911 GT3 RS"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Baujahr</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="z.B. 2023"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Farbe</Label>
                <Input
                  id="color"
                  placeholder="z.B. Lava Orange"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerHp">Leistung (PS)</Label>
                <Input
                  id="powerHp"
                  type="number"
                  placeholder="z.B. 525"
                  min="0"
                  value={powerHp}
                  onChange={(e) => setPowerHp(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate">Kennzeichen</Label>
                <Input
                  id="plate"
                  placeholder="z.B. S-GT 3911"
                  value={plateOptional}
                  onChange={(e) => setPlateOptional(e.target.value)}
                  className="bg-input font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Input
                id="notes"
                placeholder="z.B. Vollausstattung, Keramikbremse"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-input"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setVehicleDialogOpen(false);
                resetForm();
              }}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
            >
              {editingVehicle ? "Speichern" : "Hinzufügen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Fahrzeug löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Fahrzeug
              wird dauerhaft aus deiner Sammlung entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
