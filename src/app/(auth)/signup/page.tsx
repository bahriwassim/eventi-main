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
import { Eye, EyeOff, Chrome } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            avatar_url: `https://api.dicebear.com/8.x/lorelei/svg?seed=${Math.random().toString(36).substring(7)}`,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({ title: 'Compte créé avec succès!' });
        router.push('/profile');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'inscription',
        description: error.message,
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
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'inscription Google',
        description: error.message,
      });
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-[80px]" />
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
            <h1 className="text-2xl font-bold font-headline text-foreground">Créer un compte</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Rejoignez Eventi pour découvrir des événements incroyables.
            </p>
          </div>

          {/* Form */}
          <form className="grid gap-4" onSubmit={handleSignup}>
            <div className="grid gap-2">
              <Label htmlFor="full-name" className="text-sm text-muted-foreground">Nom complet</Label>
              <Input
                id="full-name"
                placeholder="Flen ben foulen"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/5 border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
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
              <Label htmlFor="phone" className="text-sm text-muted-foreground">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="55 123 456"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-white/5 border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Mot de passe</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="text-sm text-muted-foreground">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm mt-2">
              Créer un compte
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
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-primary hover:text-fuchsia-400 transition-colors font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
