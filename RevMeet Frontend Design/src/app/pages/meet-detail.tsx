import { useParams, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Clock,
  User,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  getCurrentUserId,
  fetchMeet,
  fetchRegistrations,
  fetchRegistrationCount,
  createRegistration,
  cancelRegistration,
  fetchVehicles,
  fetchUser,
} from "../lib/api";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

export function MeetDetailPage() {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<
    "PARTICIPANT" | "VISITOR"
  >("VISITOR");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [meet, setMeet] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [meetRegistrations, setMeetRegistrations] = useState<any[]>([]);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userRegistration, setUserRegistration] = useState<any | null>(null);
  const [counts, setCounts] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetId) return;

    (async () => {
      setLoading(true);
      try {
        const userId = await getCurrentUserId();
        setCurrentUserId(userId);

        const [m, regs, vehicles, organizer] = await Promise.all([
          fetchMeet(meetId),
          fetchRegistrations({ meetId }),
          fetchVehicles(userId),
          fetchUser(userId),
        ]);

        setMeet(m);
        setMeetRegistrations(regs.filter((r: any) => r.status === "CONFIRMED"));
        setUserVehicles(vehicles);
        setUsers([organizer]);

        const yourReg = regs.find(
          (r: any) => r.userId === userId && r.status === "CONFIRMED",
        );
        setUserRegistration(yourReg || null);

        const countData = await fetchRegistrationCount(meetId);
        setCounts(countData);

        setError(null);
      } catch (err: any) {
        setError(err?.message || "Fehler beim Laden der Meet-Daten");
      } finally {
        setLoading(false);
      }
    })();
  }, [meetId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md bg-card border-border">
          <p>Lade Meet-Daten...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md bg-card border-border">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Erneut versuchen
          </Button>
        </Card>
      </div>
    );
  }

  if (!meet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md bg-card border-border">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Meet nicht gefunden</h2>
          <p className="text-muted-foreground mb-6">
            Das gesuchte Carmeet existiert nicht oder wurde gelöscht.
          </p>
          <Link to="/meets">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Zurück zur Übersicht
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleRegister = async () => {
    if (registrationRole === "PARTICIPANT" && !selectedVehicleId) {
      toast.error("Bitte wähle ein Fahrzeug aus");
      return;
    }

    try {
      await createRegistration({
        meetId,
        userId: currentUserId,
        role: registrationRole,
        status: "CONFIRMED",
        vehicleId:
          registrationRole === "PARTICIPANT" ? selectedVehicleId : null,
      });

      toast.success(
        registrationRole === "PARTICIPANT"
          ? "Du bist jetzt als Teilnehmer angemeldet!"
          : "Du bist jetzt als Besucher angemeldet!",
      );
      setRegistrationDialogOpen(false);
      const regs = await fetchRegistrations({ meetId });
      setMeetRegistrations(regs.filter((r: any) => r.status === "CONFIRMED"));
      setUserRegistration(
        regs.find(
          (r: any) => r.userId === currentUserId && r.status === "CONFIRMED",
        ) || null,
      );
    } catch (err: any) {
      toast.error(`Fehler bei der Anmeldung: ${err?.message || err}`);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;

    try {
      await cancelRegistration(userRegistration.registrationId);
      toast.success("Anmeldung erfolgreich storniert");

      const regs = await fetchRegistrations({ meetId });
      setMeetRegistrations(regs.filter((r: any) => r.status === "CONFIRMED"));
      setUserRegistration(null);
    } catch (err: any) {
      toast.error(`Fehler beim Stornieren: ${err?.message || err}`);
    }
  };

  const isOrganizer = meet.organizerUserId === currentUserId;
  const organizer = users.find((u) => u.userId === meet.organizerUserId);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/meets">
          <Button variant="ghost" className="mb-6 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </Link>

        {/* Hero Card */}
        <Card className="overflow-hidden bg-card border-border mb-6">
          <div
            className={`h-2 ${
              meet.status === "PLANNED"
                ? "bg-gradient-to-r from-primary to-primary/60"
                : meet.status === "CANCELLED"
                  ? "bg-destructive"
                  : "bg-muted"
            }`}
          />

          <div className="p-6 md:p-8">
            {/* Status & Date */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge
                className={
                  meet.status === "PLANNED"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : meet.status === "CANCELLED"
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-muted/50 text-muted-foreground border-border"
                }
              >
                {meet.status === "PLANNED"
                  ? "Geplant"
                  : meet.status === "CANCELLED"
                    ? "Abgesagt"
                    : "Beendet"}
              </Badge>
              {isOrganizer && (
                <Badge variant="outline" className="bg-primary/5 text-primary">
                  <User className="w-3 h-3 mr-1" />
                  Dein Event
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {meet.title}
            </h1>

            {/* Description */}
            {meet.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {meet.description}
              </p>
            )}

            {/* Meta Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Datum</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(meet.startAt), "EEEE, dd. MMMM yyyy", {
                        locale: de,
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Uhrzeit</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(meet.startAt), "HH:mm", { locale: de })}{" "}
                      Uhr
                      {meet.endAt &&
                        ` - ${format(new Date(meet.endAt), "HH:mm", { locale: de })} Uhr`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">{meet.venue.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {meet.venue.city}, {meet.venue.country}
                    </div>
                  </div>
                </div>

                {organizer && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Organisator</div>
                      <div className="text-sm text-muted-foreground">
                        {organizer.displayName}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {counts?.participants || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Teilnehmer
                  {meet.maxParticipants && ` / ${meet.maxParticipants}`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {counts?.visitors || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Besucher{meet.maxVisitors && ` / ${meet.maxVisitors}`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {counts?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">Gesamt</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {meetRegistrations.filter((r) => r.vehicleId).length}
                </div>
                <div className="text-sm text-muted-foreground">Fahrzeuge</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Registration Actions */}
        {meet.status === "PLANNED" && (
          <Card className="p-6 bg-card border-border mb-6">
            <h2 className="text-xl font-semibold mb-4">Anmeldung</h2>

            {userRegistration ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {userRegistration.role === "PARTICIPANT" ? (
                      <Car className="w-5 h-5 text-primary" />
                    ) : (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      Du bist als{" "}
                      {userRegistration.role === "PARTICIPANT"
                        ? "Teilnehmer"
                        : "Besucher"}{" "}
                      angemeldet
                    </div>
                    {userRegistration.vehicleId && (
                      <div className="text-sm text-muted-foreground">
                        Mit Fahrzeug angemeldet
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleCancelRegistration}
                >
                  Anmeldung stornieren
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Melde dich jetzt an und sei dabei!
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setRegistrationRole("PARTICIPANT");
                      setRegistrationDialogOpen(true);
                    }}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Als Teilnehmer anmelden
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRegistrationRole("VISITOR");
                      setRegistrationDialogOpen(true);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Als Besucher anmelden
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Registered Participants Preview */}
        {meetRegistrations.length > 0 && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold mb-4">
              Angemeldete Teilnehmer
            </h2>
            <div className="space-y-3">
              {meetRegistrations.slice(0, 5).map((reg) => {
                const user = mockUsers.find((u) => u.userId === reg.userId);
                const vehicle = reg.vehicleId
                  ? mockVehicles.find((v) => v.vehicleId === reg.vehicleId)
                  : null;

                return (
                  <div
                    key={reg.registrationId}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {reg.role === "PARTICIPANT" ? (
                        <Car className="w-5 h-5 text-primary" />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {user?.displayName || "Unbekannt"}
                      </div>
                      {vehicle && (
                        <div className="text-sm text-muted-foreground">
                          {vehicle.make} {vehicle.model}
                          {vehicle.year && ` (${vehicle.year})`}
                        </div>
                      )}
                      {!vehicle && reg.role === "VISITOR" && (
                        <div className="text-sm text-muted-foreground">
                          Besucher
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {reg.role === "PARTICIPANT" ? "Teilnehmer" : "Besucher"}
                    </Badge>
                  </div>
                );
              })}
            </div>
            {meetRegistrations.length > 5 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                + {meetRegistrations.length - 5} weitere
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog
        open={registrationDialogOpen}
        onOpenChange={setRegistrationDialogOpen}
      >
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>
              Anmeldung als{" "}
              {registrationRole === "PARTICIPANT" ? "Teilnehmer" : "Besucher"}
            </DialogTitle>
            <DialogDescription>
              {registrationRole === "PARTICIPANT"
                ? "Wähle ein Fahrzeug aus, mit dem du teilnehmen möchtest."
                : "Du meldest dich als Besucher ohne Fahrzeug an."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup
              value={registrationRole}
              onValueChange={(v) => setRegistrationRole(v as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VISITOR" id="visitor" />
                <Label htmlFor="visitor" className="flex-1 cursor-pointer">
                  <div className="font-medium">Besucher</div>
                  <div className="text-sm text-muted-foreground">
                    Ohne Fahrzeug
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PARTICIPANT" id="participant" />
                <Label htmlFor="participant" className="flex-1 cursor-pointer">
                  <div className="font-medium">Teilnehmer</div>
                  <div className="text-sm text-muted-foreground">
                    Mit Fahrzeug
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {registrationRole === "PARTICIPANT" && (
              <div className="space-y-2">
                <Label>Fahrzeug auswählen</Label>
                {userVehicles.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                    Du hast noch keine Fahrzeuge.{" "}
                    <Link
                      to="/vehicles"
                      className="text-primary hover:underline"
                    >
                      Jetzt hinzufügen
                    </Link>
                  </div>
                ) : (
                  <Select
                    value={selectedVehicleId}
                    onValueChange={setSelectedVehicleId}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue placeholder="Fahrzeug wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userVehicles.map((vehicle) => (
                        <SelectItem
                          key={vehicle.vehicleId}
                          value={vehicle.vehicleId}
                        >
                          {vehicle.make} {vehicle.model}
                          {vehicle.year && ` (${vehicle.year})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRegistrationDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleRegister}
              disabled={
                registrationRole === "PARTICIPANT" && userVehicles.length === 0
              }
            >
              Anmelden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
