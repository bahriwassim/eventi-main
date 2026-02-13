'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Eye, EyeOff } from 'lucide-react';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({ title: 'Connexion réussie!' });
      router.push('/profile');
    } catch (error: any) {
      let description = error.message;
      if (error.message.includes('Invalid login credentials')) {
        description = "Identifiants incorrects ou le compte n'existe pas. Avez-vous créé un compte ? Essayez de vous inscrire.";
      }
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: description,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      
      // Note: For OAuth, the redirect happens automatically, so we don't push to profile here immediately
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion Google',
        description: error.message,
      });
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/8 rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-sm mx-auto animate-scale-in">
        <div className="rounded-2xl glass border-white/10 p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-primary/10 animate-glow-pulse">
                <Logo className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold font-headline text-foreground">Ravi de vous revoir</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder à votre compte.
            </p>
          </div>

          {/* Form */}
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Mot de passe</Label>
                <span className="ml-auto inline-block text-xs text-primary cursor-pointer hover:text-fuchsia-400 transition-colors">
                  Mot de passe oublié ?
                </span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm mt-2">
              Se connecter
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-background text-xs text-muted-foreground">ou</span>
              </div>
            </div>

            <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300" type="button" onClick={handleGoogleSignIn}>
              <Chrome className="mr-2 h-4 w-4" />
              Continuer avec Google
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Vous n&apos;avez pas de compte ?{' '}
            <Link href="/signup" className="text-primary hover:text-fuchsia-400 transition-colors font-medium">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
