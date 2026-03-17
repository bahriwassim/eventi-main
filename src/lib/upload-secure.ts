export interface UploadResult {
  success: boolean;
  fileName?: string;
  url?: string;
  error?: string;
}

export async function uploadFileSecure(file: File): Promise<UploadResult> {
  try {
    // Validation côté client (double sécurité)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Type de fichier non autorisé. Types acceptés: JPEG, PNG, WebP, GIF'
      };
    }

    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Fichier trop volumineux. Taille maximale: 5MB'
      };
    }

    // Créer FormData pour l'envoi
    const formData = new FormData();
    formData.append('file', file);

    // Appeler notre route d'upload sécurisée
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors du téléchargement'
      };
    }

    return {
      success: true,
      fileName: result.fileName,
      url: result.url
    };

  } catch (error) {
    console.error('Erreur lors du téléchargement sécurisé:', error);
    return {
      success: false,
      error: 'Erreur réseau lors du téléchargement'
    };
  }
}