import { Link } from "react-router";
import { useState } from "react";
import { Calendar, Users, Car, Filter, Search, MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { mockMeets, getRegistrationCount } from "../lib/mock-data";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function MeetsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMeets = mockMeets.filter((meet) => {
    const matchesStatus =
      statusFilter === "all" || meet.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      meet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meet.venue.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedMeets = [...filteredMeets].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            Alle Carmeets
          </h1>
          <p className="text-muted-foreground">
            Entdecke spontane Events in deiner Nähe
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-8 bg-card border-border">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nach Titel oder Stadt suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-input">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="PLANNED">Geplant</SelectItem>
                  <SelectItem value="CANCELLED">Abgesagt</SelectItem>
                  <SelectItem value="DONE">Beendet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {sortedMeets.length} {sortedMeets.length === 1 ? "Meet" : "Meets"}{" "}
            gefunden
          </p>
        </div>

        {/* Meets Grid */}
        {sortedMeets.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Meets gefunden</h3>
            <p className="text-muted-foreground mb-6">
              Versuche es mit anderen Filtereinstellungen oder erstelle ein
              neues Meet.
            </p>
            <Link to="/meets/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Meet erstellen
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMeets.map((meet) => {
              const counts = getRegistrationCount(meet.meetId);
              const isUpcoming = new Date(meet.startAt) > new Date();

              return (
                <Card
                  key={meet.meetId}
                  className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Status Bar */}
                  <div
                    className={`h-2 ${
                      meet.status === "PLANNED"
                        ? "bg-gradient-to-r from-primary to-primary/60"
                        : meet.status === "CANCELLED"
                          ? "bg-destructive"
                          : "bg-muted"
                    }`}
                  />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
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
                      {isUpcoming && (
                        <Badge variant="outline" className="text-xs">
                          Bald
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {meet.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {meet.description}
                    </p>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {format(new Date(meet.startAt), "dd. MMMM yyyy", {
                          locale: de,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="text-muted-foreground">
                        {format(new Date(meet.startAt), "HH:mm", {
                          locale: de,
                        })}{" "}
                        Uhr
                      </span>
                      {meet.endAt && (
                        <>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-muted-foreground">
                            {format(new Date(meet.endAt), "HH:mm", {
                              locale: de,
                            })}{" "}
                            Uhr
                          </span>
                        </>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="line-clamp-1">
                        {meet.venue.name}, {meet.venue.city}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm mb-6 pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {counts.participants}
                          {meet.maxParticipants && `/${meet.maxParticipants}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {counts.visitors}
                          {meet.maxVisitors && `/${meet.maxVisitors}`}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={`/meets/${meet.meetId}`}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Details ansehen
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
