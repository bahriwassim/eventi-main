'use client';

import { Search, Calendar, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  const [priceRange, setPriceRange] = useState([0, 500]);

  // Update local state when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || 'all');
    setLocation(searchParams.get('location') || 'all');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (category && category !== 'all') params.set('category', category);
    if (location && location !== 'all') params.set('location', location);
    
    // For now we don't put price in URL to keep it simple, or we could:
    // params.set('minPrice', priceRange[0].toString());
    // params.set('maxPrice', priceRange[1].toString());

    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setCategory('all');
    setLocation('all');
    setPriceRange([0, 500]);
    router.push('/');
  };

  const activeFiltersCount = [
    searchTerm, 
    category !== 'all', 
    location !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="glass-strong rounded-2xl p-4 border border-white/10 shadow-2xl shadow-purple-900/10">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Input */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Rechercher un événement, artiste..." 
              className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 h-12 text-base transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {/* Category Select */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px] md:w-[160px] bg-white/5 border-white/10 h-12">
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="h-4 w-4 text-fuchsia-400" />
                  <span className="truncate">{category === 'all' ? 'Catégorie' : category}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="Musique">Musique</SelectItem>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Volleyball">Volleyball</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Culture">Culture</SelectItem>
                <SelectItem value="Art">Art</SelectItem>
                <SelectItem value="Gastronomie">Gastronomie</SelectItem>
                <SelectItem value="Mode">Mode</SelectItem>
              </SelectContent>
            </Select>

            {/* Location Select */}
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[140px] md:w-[160px] bg-white/5 border-white/10 h-12">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="truncate">{location === 'all' ? 'Lieu' : location}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les lieux</SelectItem>
                <SelectItem value="Sousse">Sousse</SelectItem>
                <SelectItem value="Monastir">Monastir</SelectItem>
                <SelectItem value="Mahdia">Mahdia</SelectItem>
                <SelectItem value="Tunis">Tunis</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 w-12 px-0 border-white/10 bg-white/5 hover:bg-white/10">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 glass-strong border-white/10 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none mb-2">Filtres avancés</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Prix</span>
                      <span className="text-muted-foreground">{priceRange[0]} - {priceRange[1]} TND</span>
                    </div>
                    <Slider
                      defaultValue={[0, 500]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSearch} 
              className="h-12 px-6 bg-gradient-primary hover:opacity-90 transition-opacity border-0 shadow-glow-sm"
            >
              Rechercher
            </Button>
            {activeFiltersCount > 0 && (
              <Button 
                onClick={handleClear} 
                variant="ghost" 
                className="h-12 px-3 text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            {searchTerm && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1 pl-2">
                Recherche: {searchTerm}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            {category !== 'all' && (
              <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 gap-1 pl-2">
                {category}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setCategory('all')} />
              </Badge>
            )}
            {location !== 'all' && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1 pl-2">
                {location}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setLocation('all')} />
              </Badge>
            )}
             <Button variant="link" size="sm" onClick={handleClear} className="h-5 text-xs text-muted-foreground px-0 ml-2">
              Tout effacer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
