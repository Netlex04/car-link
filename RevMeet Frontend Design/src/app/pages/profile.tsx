import { Link } from 'react-router';
import { useState } from 'react';
import { User, Mail, Calendar, Car, Users, Edit, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  getCurrentUser,
  getUserVehicles,
  getUserRegistrations,
  mockMeets,
  mockVehicles,
  CURRENT_USER_ID,
} from '../lib/mock-data';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export function ProfilePage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const currentUser = getCurrentUser();
  const userVehicles = getUserVehicles(CURRENT_USER_ID);
  const userRegistrations = getUserRegistrations(CURRENT_USER_ID).filter(
    (r) => r.status === 'CONFIRMED'
  );

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [email, setEmail] = useState(currentUser.email);

  const upcomingRegistrations = userRegistrations.filter((reg) => {
    const meet = mockMeets.find((m) => m.meetId === reg.meetId);
    return meet && new Date(meet.startAt) > new Date();
  });

  const pastRegistrations = userRegistrations.filter((reg) => {
    const meet = mockMeets.find((m) => m.meetId === reg.meetId);
    return meet && new Date(meet.startAt) <= new Date();
  });

  const organizedMeets = mockMeets.filter(
    (m) => m.organizerUserId === CURRENT_USER_ID
  );

  const handleUpdateProfile = () => {
    if (!displayName || !email) {
      toast.error('Name und E-Mail sind Pflichtfelder');
      return;
    }

    toast.success('Profil erfolgreich aktualisiert!');
    setEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="p-6 md:p-8 bg-card border-border mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {currentUser.displayName}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Dabei seit{' '}
                    {format(new Date(currentUser.createdAt), 'MMMM yyyy', {
                      locale: de,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {userVehicles.length}
              </div>
              <div className="text-sm text-muted-foreground">Fahrzeuge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {userRegistrations.length}
              </div>
              <div className="text-sm text-muted-foreground">Anmeldungen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {organizedMeets.length}
              </div>
              <div className="text-sm text-muted-foreground">Organisiert</div>
            </div>
          </div>
        </Card>

        {/* Vehicles Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Meine Fahrzeuge</h2>
            <Link to="/vehicles">
              <Button variant="outline" size="sm">
                Verwalten
              </Button>
            </Link>
          </div>

          {userVehicles.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                Du hast noch keine Fahrzeuge hinzugefügt
              </p>
              <Link to="/vehicles">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Fahrzeug hinzufügen
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {userVehicles.map((vehicle) => (
                <Card
                  key={vehicle.vehicleId}
                  className="p-4 bg-card border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                        {vehicle.year && <span>{vehicle.year}</span>}
                        {vehicle.powerHp && <span>• {vehicle.powerHp} PS</span>}
                        {vehicle.color && <span>• {vehicle.color}</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Registrations */}
        {upcomingRegistrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Kommende Meets</h2>
            <div className="space-y-3">
              {upcomingRegistrations.map((reg) => {
                const meet = mockMeets.find((m) => m.meetId === reg.meetId);
                const vehicle = reg.vehicleId
                  ? mockVehicles.find((v) => v.vehicleId === reg.vehicleId)
                  : null;

                if (!meet) return null;

                return (
                  <Card
                    key={reg.registrationId}
                    className="p-4 bg-card border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {reg.role === 'PARTICIPANT' ? (
                          <Car className="w-6 h-6 text-primary" />
                        ) : (
                          <Users className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{meet.title}</h3>
                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary flex-shrink-0"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Angemeldet
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(meet.startAt), 'dd. MMM yyyy', {
                                locale: de,
                              })}
                            </span>
                          </div>
                          <span>
                            {reg.role === 'PARTICIPANT' ? 'Teilnehmer' : 'Besucher'}
                          </span>
                          {vehicle && (
                            <span>
                              • {vehicle.make} {vehicle.model}
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <Link to={`/meets/${meet.meetId}`}>
                            <Button variant="outline" size="sm">
                              Details ansehen
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Organized Meets */}
        {organizedMeets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Meine organisierten Meets</h2>
            <div className="space-y-3">
              {organizedMeets.map((meet) => (
                <Card
                  key={meet.meetId}
                  className="p-4 bg-card border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-semibold">{meet.title}</h3>
                        <Badge
                          className={
                            meet.status === 'PLANNED'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-muted/50 text-muted-foreground border-border'
                          }
                        >
                          {meet.status === 'PLANNED' ? 'Geplant' : meet.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(meet.startAt), 'dd. MMM yyyy', {
                              locale: de,
                            })}
                          </span>
                        </div>
                        <span>📍 {meet.venue.city}</span>
                      </div>

                      <Link to={`/meets/${meet.meetId}`}>
                        <Button variant="outline" size="sm">
                          Verwalten
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Registrations */}
        {pastRegistrations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Vergangene Meets</h2>
            <div className="space-y-3">
              {pastRegistrations.slice(0, 3).map((reg) => {
                const meet = mockMeets.find((m) => m.meetId === reg.meetId);
                if (!meet) return null;

                return (
                  <Card
                    key={reg.registrationId}
                    className="p-4 bg-card/50 border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-muted-foreground">
                          {meet.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meet.startAt), 'dd. MMMM yyyy', {
                            locale: de,
                          })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-muted-foreground">
                        Beendet
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisiere deine persönlichen Daten
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                E-Mail <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleUpdateProfile}
            >
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
