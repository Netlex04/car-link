import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, MapPin, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { mockVenues } from "../lib/mock-data";
import { toast } from "sonner";

export function MeetCreatePage() {
  const navigate = useNavigate();
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [maxVisitors, setMaxVisitors] = useState("");

  // New venue form state
  const [newVenueName, setNewVenueName] = useState("");
  const [newVenueStreet, setNewVenueStreet] = useState("");
  const [newVenueZip, setNewVenueZip] = useState("");
  const [newVenueCity, setNewVenueCity] = useState("");
  const [newVenueCountry, setNewVenueCountry] = useState("Deutschland");

  const handleCreateVenue = () => {
    if (!newVenueName || !newVenueCity) {
      toast.error("Name und Stadt sind Pflichtfelder");
      return;
    }

    // Mock venue creation
    toast.success("Venue erfolgreich erstellt!");
    setVenueDialogOpen(false);

    // Reset form
    setNewVenueName("");
    setNewVenueStreet("");
    setNewVenueZip("");
    setNewVenueCity("");
    setNewVenueCountry("Deutschland");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startDate || !startTime || !venueId) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    // Mock meet creation
    toast.success("Meet erfolgreich erstellt!");

    // Navigate to meets overview
    setTimeout(() => {
      navigate("/meets");
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/meets">
          <Button variant="ghost" className="mb-6 text-white">
            <ArrowLeft className="w-4  h-4 mr-2" />
            Zurück
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            Neues Meet erstellen
          </h1>
          <p className="text-muted-foreground">
            Organisiere dein eigenes Carmeet und bringe die Community zusammen
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6 md:p-8 bg-card border-border space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="z.B. Stuttgart AMG Night"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-input"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Beschreibe dein Event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input min-h-[120px]"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Gib Details zu deinem Event an
              </p>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Startdatum <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">
                  Startzeit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Enddatum</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Endzeit</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-input"
                />
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venue">
                Veranstaltungsort <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={venueId} onValueChange={setVenueId} required>
                  <SelectTrigger className="bg-input flex-1">
                    <SelectValue placeholder="Ort auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVenues.map((venue) => (
                      <SelectItem key={venue.venueId} value={venue.venueId}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog
                  open={venueDialogOpen}
                  onOpenChange={setVenueDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle>Neuen Ort hinzufügen</DialogTitle>
                      <DialogDescription>
                        Erstelle einen neuen Veranstaltungsort
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="venueName">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="venueName"
                          placeholder="z.B. Nürburgring Parkplatz"
                          value={newVenueName}
                          onChange={(e) => setNewVenueName(e.target.value)}
                          className="bg-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venueStreet">Straße</Label>
                        <Input
                          id="venueStreet"
                          placeholder="z.B. Nürburgring 1"
                          value={newVenueStreet}
                          onChange={(e) => setNewVenueStreet(e.target.value)}
                          className="bg-input"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="venueZip">PLZ</Label>
                          <Input
                            id="venueZip"
                            placeholder="z.B. 53520"
                            value={newVenueZip}
                            onChange={(e) => setNewVenueZip(e.target.value)}
                            className="bg-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="venueCity">
                            Stadt <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="venueCity"
                            placeholder="z.B. Nürburg"
                            value={newVenueCity}
                            onChange={(e) => setNewVenueCity(e.target.value)}
                            className="bg-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venueCountry">Land</Label>
                        <Input
                          id="venueCountry"
                          value={newVenueCountry}
                          onChange={(e) => setNewVenueCountry(e.target.value)}
                          className="bg-input"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setVenueDialogOpen(false)}
                      >
                        Abbrechen
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleCreateVenue}
                      >
                        Erstellen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Limits */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="z.B. 50"
                  min="0"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="bg-input"
                />
                <p className="text-xs text-muted-foreground">
                  Teilnehmer mit Fahrzeug
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxVisitors">Max. Besucher</Label>
                <Input
                  id="maxVisitors"
                  type="number"
                  placeholder="z.B. 100"
                  min="0"
                  value={maxVisitors}
                  onChange={(e) => setMaxVisitors(e.target.value)}
                  className="bg-input"
                />
                <p className="text-xs text-muted-foreground">
                  Besucher ohne Fahrzeug
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-foreground mb-1">
                    <strong>Tipp:</strong> Je genauer deine Beschreibung, desto
                    mehr Teilnehmer werden sich anmelden.
                  </p>
                  <p className="text-muted-foreground">
                    Gib Details wie Dresscode, besondere Regeln oder geplante
                    Aktivitäten an.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Link to="/meets" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Abbrechen
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Meet erstellen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
