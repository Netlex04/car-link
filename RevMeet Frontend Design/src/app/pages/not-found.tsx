import { Link } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="p-12 text-center max-w-md bg-card border-border">
        <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-4">Seite nicht gefunden</h2>
        <p className="text-muted-foreground mb-8">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Home className="w-4 h-4 mr-2" />
            Zurück zur Startseite
          </Button>
        </Link>
      </Card>
    </div>
  );
}
