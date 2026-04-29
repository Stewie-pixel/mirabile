import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from 'miaoda-auth-react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/generator', label: 'Generate Roadmap' },
    { path: '/progress', label: 'Progress' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://miaoda-conversation-file.s3cdn.medo.dev/user-b9n50z51dudc/20260428/file-b9remfbc3gu8.png"
              alt="Mirabile Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold text-foreground">Mirabile</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {user &&
              navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors hover:text-primary ${
                    location.pathname === item.path ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col gap-4 mt-8">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`text-sm transition-colors hover:text-primary ${
                            location.pathname === item.path ? 'text-primary font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <Button variant="outline" onClick={handleSignOut} className="mt-4">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}