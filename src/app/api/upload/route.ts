import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Types MIME autorisés
const ALLOWED_MIME_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Taille maximale (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Validation du type MIME côté serveur
function validateMimeType(mimeType: string): boolean {
  return Object.keys(ALLOWED_MIME_TYPES).includes(mimeType);
}

// Validation de la taille du fichier
function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Validation du contenu du fichier (vérification de l'en-tête)
async function validateFileContent(buffer: Buffer): Promise<string | null> {
  // Vérifier l'en-tête du fichier
  const header = buffer.slice(0, 4).toString('hex');
  
  // JPEG: FF D8 FF
  if (header.startsWith('ffd8ff')) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (header.startsWith('89504e47')) return 'image/png';
  // GIF: 47 49 46 38
  if (header.startsWith('47494638')) return 'image/gif';
  // WebP: 52 49 46 46
  if (header.startsWith('52494646')) return 'image/webp';
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validation du type MIME
    if (!validateMimeType(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Types acceptés: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validation de la taille
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 5MB' },
        { status: 400 }
      );
    }

    // Lire le contenu du fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validation du contenu (vérification de l'en-tête du fichier)
    const detectedMimeType = await validateFileContent(buffer);
    if (!detectedMimeType || detectedMimeType !== file.type) {
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas au type MIME déclaré' },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const fileExt = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES];
    const fileName = `${randomUUID()}${fileExt}`;
    
    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Sauvegarder le fichier
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Optionnel: Sauvegarder dans Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });

        const { data, error } = await supabase.storage
          .from('event-posters')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error('Erreur Supabase Storage:', error);
        } else {
          // Supprimer le fichier local si uploadé dans Supabase
          const { unlink } = await import('fs/promises');
          await unlink(filePath);
          
          return NextResponse.json({
            success: true,
            fileName,
            url: `${supabaseUrl}/storage/v1/object/public/event-posters/${fileName}`,
          });
        }
      } catch (storageError) {
        console.error('Erreur lors de lupload vers Supabase:', storageError);
      }
    }

    // Retourner l'URL du fichier local si Supabase échoue
    return NextResponse.json({
      success: true,
      fileName,
      url: `/uploads/${fileName}`,
    });

  } catch (error) {
    console.error('Erreur lors de lupload:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}