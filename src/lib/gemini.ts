import { GoogleGenAI } from '@google/genai'

const getMimeType = (base64: string): string => {
  const match = base64.match(/^data:([^;]+);base64,/)
  return match ? match[1] : 'image/jpeg'
}

export async function generateTryOn(
  userImageBase64: string,
  clothingImageBase64: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API ključ nije konfigurisan.')
  }

  const ai = new GoogleGenAI({ apiKey })

  const userMime = getMimeType(userImageBase64)
  const clothingMime = getMimeType(clothingImageBase64)

  const cleanUserBase64 = userImageBase64.split(',')[1] || userImageBase64
  const cleanClothingBase64 = clothingImageBase64.split(',')[1] || clothingImageBase64

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanUserBase64,
              mimeType: userMime,
            },
          },
          {
            inlineData: {
              data: cleanClothingBase64,
              mimeType: clothingMime,
            },
          },
          {
            text: `VIRTUAL TRY-ON INSTRUKCIJE ZA BUTIK KATARINA:

1. IDENTITET KORISNIKA (SLIKA 1): Sačuvaj LICE, KOSU i OBLIK TELA osobe sa prve slike. Ona je model koji "isprobava" odjeću.
2. IZVOR ODJEĆE (SLIKA 2): Uzmi isključivo ODJEĆU sa druge slike. Potpuno zanemari lice i identitet osobe sa ove slike.
3. REZULTAT: Pokaži osobu sa slike 1 kako nosi odjeću sa slike 2. Odjeća treba da bude savršeno prilagođena njenoj pozi i građi.

STROGA PRAVILA:
- Generiši JEDNU koherentnu sliku visokog kvaliteta.
- Bez kolaža, bez duplih lica.
- Pozadina treba da ostane neutralna ili slična slici 1.`,
          },
        ],
      },
      config: {
        responseModalities: ['image', 'text'],
      },
    })

    // Extract the generated image from the response
    const parts = response.candidates?.[0]?.content?.parts
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png'
          return `data:${mimeType};base64,${part.inlineData.data}`
        }
      }
    }

    throw new Error('Nije generisana slika. Pokušajte ponovo.')
  } catch (error: any) {
    console.error('Gemini API error:', error)
    throw new Error(error.message || 'Greška pri generisanju slike. Pokušajte ponovo.')
  }
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Upload image to get URL (kept for compatibility)
export async function uploadImageToStorage(
  base64Data: string,
  fileName: string,
  supabaseClient: any
): Promise<string> {
  const base64Response = await fetch(base64Data)
  const blob = await base64Response.blob()

  const filePath = `tryon/${Date.now()}-${fileName}`

  const { data, error } = await supabaseClient.storage
    .from('clothing')
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true
    })

  if (error) {
    throw new Error('Greška pri uploadu slike: ' + error.message)
  }

  const { data: urlData } = supabaseClient.storage
    .from('clothing')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
