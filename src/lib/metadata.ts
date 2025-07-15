// src/lib/metadata.ts
export function getPageMetadata(title: string, description: string) {
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        title,
        description,
      },
    };
  }
  