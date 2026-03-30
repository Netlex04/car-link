import { Link } from "react-router";
import { Calendar, Users, Car, ArrowRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { fetchMeets, fetchRegistrationCount } from "../lib/api";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function HomePage() {
  const [meets, setMeets] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const meetData = await fetchMeets();
        setMeets(meetData);

        const countsData = await Promise.all(
          meetData.slice(0, 3).map(async (m: any) => {
            const count = await fetchRegistrationCount(m.meetId);
            return { meetId: m.meetId, count };
          }),
        );

        setCounts(
          countsData.reduce(
            (acc, item) => {
              acc[item.meetId] = item.count;
              return acc;
            },
            {} as Record<string, any>,
          ),
        );

        setError(null);
      } catch (err: any) {
        setError(err?.message || "Fehler beim Laden der Startseite");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getRegistrationCount = (meetId: string) => {
    return counts[meetId] || { participants: 0, visitors: 0, total: 0 };
  };

  const upcomingMeets = meets
    .filter((m) => m.status === "PLANNED")
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-card/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,217,255,0.1),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">
                Die Community für Autofans
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="block text-white">Carmeets</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                spontan organisieren
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              CarLink bringt die Car-Community zusammen. Entdecke Carmeets in
              deiner Nähe, zeige dein Fahrzeug und vernetze dich mit anderen
              Enthusiasten.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/meets">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Carmeet finden
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/meets/new">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Car className="w-5 h-5 mr-2" />
                  Meet erstellen
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {mockMeets.length}+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Carmeets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                500+
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Teilnehmer
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                50+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Städte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">
              So funktioniert CarLink
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Einfach, schnell und spontan – perfekt für die Car-Community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Meets entdecken</h3>
              <p className="text-muted-foreground">
                Finde spontane Carmeets in deiner Stadt oder organisiere dein
                eigenes Event.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fahrzeug anmelden</h3>
              <p className="text-muted-foreground">
                Zeige dein Auto und vernetze dich mit anderen Fahrern und
                Enthusiasten.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community erleben</h3>
              <p className="text-muted-foreground">
                Tausche dich aus, knüpfe neue Kontakte und erlebe die
                Car-Culture live.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Meets Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Kommende Meets</h2>
              <p className="text-muted-foreground mt-2">
                Die nächsten Events in deiner Nähe
              </p>
            </div>
            <Link to="/meets">
              <Button variant="outline">
                Alle anzeigen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingMeets.map((meet) => {
              const counts = getRegistrationCount(meet.meetId);
              return (
                <Card
                  key={meet.meetId}
                  className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {meet.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(meet.startAt), "dd. MMM", {
                            locale: de,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(meet.startAt), "HH:mm", {
                            locale: de,
                          })}{" "}
                          Uhr
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {meet.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {meet.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>{counts.participants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{counts.visitors}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground mb-4">
                      📍 {meet.venue.city}, {meet.venue.country}
                    </div>

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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl text-white md:text-4xl font-bold mb-4">
            Bereit für dein nächstes Carmeet?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Werde Teil der Community und erlebe unvergessliche Momente
          </p>
          <Link to="/meets/new">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Jetzt Meet erstellen
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
