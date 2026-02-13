'use client';

import Link from 'next/link';
import { Logo } from './logo';
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
    return (
        <footer className="relative border-t border-white/10 bg-black text-white mt-auto overflow-hidden">
            {/* Animated gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 animate-gradient-move bg-[length:200%_100%]" />

            {/* Background decorative elements - darker/subtler for contrast */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] animate-float pointer-events-none" />
            <div className="absolute top-10 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                                <Logo className="h-8 w-8 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                            </div>
                            <span className="text-2xl font-bold font-headline text-white">Eventi</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                            Votre portail premium pour découvrir et réserver les meilleurs événements à Sousse et dans la région du Sahel.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="p-2.5 rounded-full bg-white/5 border border-white/10 shadow-sm hover:bg-white/20 hover:scale-110 hover:border-white/30 text-gray-400 hover:text-white transition-all duration-300 group">
                                    <Icon className="h-4 w-4 group-hover:animate-bounce-subtle" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-1">
                        <h4 className="font-bold font-headline text-white mb-6 relative inline-block">
                            Newsletter
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                        </h4>
                        <p className="text-sm text-gray-400 mb-4">
                            Recevez les derniers événements et offres exclusives directement dans votre boîte mail.
                        </p>
                        <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative">
                                <Input 
                                    placeholder="votre@email.com" 
                                    className="bg-white/10 border-white/20 focus:border-white/50 pr-10 transition-all text-white placeholder:text-gray-500"
                                />
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 shadow-md group font-bold">
                                S&apos;abonner
                                <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </div>

                    {/* Catégories */}
                    <div>
                        <h4 className="font-bold font-headline text-white mb-6 relative inline-block">
                            Catégories
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full" />
                        </h4>
                        <ul className="space-y-3">
                            {['Musique', 'Culture', 'Art', 'Gastronomie', 'Mode', 'Football', 'Volleyball', 'Basketball'].map((cat) => (
                                <li key={cat}>
                                    <Link href={`/?category=${cat}#events`} className="text-sm text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 cursor-pointer flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white transition-all duration-300" />
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold font-headline text-white mb-6 relative inline-block">
                            Contact
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-400 group">
                                <div className="p-2 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <span className="mt-1">Sousse, Tunisie</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-400 group">
                                <div className="p-2 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <span className="mt-1">contact@eventi.tn</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-400 group">
                                <div className="p-2 rounded-lg bg-white/5 text-white group-hover:bg-white/10 transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <span className="mt-1">+216 73 000 000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Eventi. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors cursor-pointer">Politique de confidentialité</Link>
                        <Link href="/terms-of-service" className="hover:text-white transition-colors cursor-pointer">Conditions d&apos;utilisation</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
